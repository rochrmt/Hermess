/**
 * `SearxngSearchProvider`: a `WebSearchProvider` backed by a SearxNG instance
 * (`GET /search?format=json`). SearxNG is a free, open-source meta-search engine
 * that aggregates results from multiple search engines without requiring an API key.
 * It maps `content` to `snippet`, `publishedDate` to `publishedAt`, and omits
 * `content` (the generated answer field) because SearxNG returns no generated answer.
 *
 * @module @deepseek-ai/dsh-web-search-searxng/provider
 */

import { WebError } from '@deepseek-ai/dsh-web'
import type {
  WebSearchProvider,
  WebSearchRequest,
  WebSearchResult,
  WebSearchSource,
} from '@deepseek-ai/dsh-web'
import type { SearxngError, SearxngResult, SearxngSearchResponse } from './types.ts'

/** Stable id this provider registers under. */
export const SEARXNG_PROVIDER_ID = 'searxng'

/** Default SearxNG instance (a public instance that enables JSON output). */
export const SEARXNG_DEFAULT_BASE_URL = 'https://searxng.site'

/** Default number of results to request from SearxNG. */
export const SEARXNG_DEFAULT_NUM_RESULTS = 10

/** Attribution header sent on every request. */
const USER_AGENT = 'agentforge/0.1.0'

/** Resolved provider options. */
export interface SearxngSearchProviderOptions {
  /** SearxNG instance base URL; `/search` is the operation. */
  baseURL: string
  /** Default result count when a request carries no `maxResults`. */
  numResults?: number
  /** Comma-separated list of SearxNG categories (e.g. "general,it"). Defaults to "general". */
  categories?: string
  /** Comma-separated list of SearxNG engines to use. Defaults to SearxNG's default. */
  engines?: string
  /** SearxNG language code (e.g. "en", "fr", "all"). Defaults to "all". */
  language?: string
}

/**
 * Map one SearxNG result to a normalized source. Entries without a URL are
 * dropped (SearxNG should always provide one, but defensive coding).
 *
 * @param result - one entry of SearxNG's `results[]`.
 * @returns the normalized source, or `undefined` when the entry has no URL.
 */
export function mapSearxngResult(result: SearxngResult): WebSearchSource | undefined {
  if (result.url == null || result.url.length === 0) return undefined
  return {
    url: result.url,
    ...result.title != null && result.title.length > 0 ? { title: result.title } : {},
    ...result.content != null && result.content.length > 0 ? { snippet: result.content } : {},
    ...result.publishedDate != null && result.publishedDate.length > 0 ? { publishedAt: result.publishedDate } : {},
  }
}

/**
 * Map a SearxNG response envelope to a normalized search result.
 *
 * @param response - the parsed `GET /search?format=json` response body.
 * @returns the normalized result; entries without a URL are dropped.
 */
export function mapSearxngResponse(response: SearxngSearchResponse): WebSearchResult {
  const sources = (response.results ?? [])
    .map(mapSearxngResult)
    .filter((source): source is WebSearchSource => source !== undefined)
  return { sources, truncated: false }
}

/** The SearxNG-backed search provider; HTTP redirects fail as `WEB_PROVIDER_ERROR`. */
export class SearxngSearchProvider implements WebSearchProvider {
  readonly id = SEARXNG_PROVIDER_ID

  constructor(private readonly options: SearxngSearchProviderOptions) {}

  available(): boolean {
    return URL.canParse(this.options.baseURL)
      && (this.options.numResults === undefined || isPositiveInteger(this.options.numResults))
  }

  async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
    const numResults = request.maxResults ?? this.options.numResults ?? SEARXNG_DEFAULT_NUM_RESULTS
    const params = new URLSearchParams({
      q: request.query,
      format: 'json',
      pageno: '1',
    })
    if (this.options.categories !== undefined) params.set('categories', this.options.categories)
    if (this.options.engines !== undefined) params.set('engines', this.options.engines)
    if (this.options.language !== undefined) params.set('language', this.options.language)

    let response: Response
    try {
      response = await fetch(`${this.options.baseURL}/search?${params.toString()}`, {
        method: 'GET',
        redirect: 'error',
        headers: {
          'accept': 'application/json',
          'user-agent': USER_AGENT,
        },
        ...signal !== undefined ? { signal } : {},
      })
    } catch (error: unknown) {
      if (isAbortError(error)) throw new WebError('SearxNG search aborted', 'WEB_ABORTED', { cause: error })
      throw new WebError(`SearxNG search request failed: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error })
    }

    if (!response.ok) {
      const status = response.status
      let message = `SearxNG API error (HTTP ${status})`
      try {
        const parsed = await response.json() as SearxngError
        const detail = parsed.error ?? parsed.message
        if (detail !== undefined && detail.length > 0) message = detail
      } catch (error: unknown) {
        if (isAbortError(error)) throw new WebError('SearxNG search aborted', 'WEB_ABORTED', { cause: error })
      }
      throw new WebError(message, 'WEB_PROVIDER_ERROR')
    }

    try {
      const payload = await response.json() as SearxngSearchResponse
      const result = mapSearxngResponse(payload)
      // Apply maxResults truncation locally since SearxNG's `pageno` is page-based, not count-based
      if (numResults > 0 && result.sources.length > numResults) {
        return {
          sources: result.sources.slice(0, numResults),
          truncated: true,
        }
      }
      return result
    } catch (error: unknown) {
      if (isAbortError(error)) throw new WebError('SearxNG search aborted', 'WEB_ABORTED', { cause: error })
      throw new WebError(`SearxNG returned an unprocessable response body: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error })
    }
  }
}

/** True for a positive whole number. */
function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0
}

/** True for a fetch/`AbortSignal` abort, surfaced as `WEB_ABORTED`. */
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
