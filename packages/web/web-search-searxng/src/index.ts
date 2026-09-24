/**
 * `@deepseek-ai/dsh-web-search-searxng`: registers a SearxNG-backed
 * `WebSearchProvider` with `ctx.web`. A function/namespace plugin (NOT a
 * default-export service): it registers INTO the seam's provider registry,
 * exactly as `@deepseek-ai/dsh-web-search-exa` registers into `ctx.web`.
 *
 * SearxNG is a free, open-source meta-search engine that aggregates results
 * from multiple search engines (Google, Bing, DuckDuckGo, etc.) without
 * requiring an API key. You can use any public SearxNG instance or self-host
 * your own.
 *
 * @module @deepseek-ai/dsh-web-search-searxng
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-web'
import {
  SearxngSearchProvider,
  SEARXNG_DEFAULT_BASE_URL,
} from './provider.ts'

export {
  SEARXNG_DEFAULT_BASE_URL,
  SEARXNG_DEFAULT_NUM_RESULTS,
  SEARXNG_PROVIDER_ID,
  SearxngSearchProvider,
} from './provider.ts'
export type { SearxngSearchProviderOptions } from './provider.ts'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-searxng'

/** The web seam this provider registers into. */
export const inject = ['web']

/** Plugin config (all optional — `apply` fills constant defaults). */
export interface Config {
  /** SearxNG instance base URL; `/search` is appended. Defaults to a public instance. */
  baseURL?: string
  /** Default result count when a request carries no `maxResults`. */
  numResults?: number
  /** Comma-separated SearxNG categories (e.g. "general,it"). Defaults to "general". */
  categories?: string
  /** Comma-separated SearxNG engines to use. */
  engines?: string
  /** SearxNG language code (e.g. "en", "fr", "all"). Defaults to "all". */
  language?: string
}

export const Config: z<Config> = z.object({
  baseURL: z.string(),
  numResults: z.number().step(1).min(1),
  categories: z.string(),
  engines: z.string(),
  language: z.string(),
})

/** Register the SearxNG search provider with `ctx.web`. */
export function apply(ctx: Context, config: Config): void {
  ctx.web.registerSearchProvider(new SearxngSearchProvider({
    baseURL: config.baseURL ?? SEARXNG_DEFAULT_BASE_URL,
    ...config.numResults !== undefined ? { numResults: config.numResults } : {},
    ...config.categories !== undefined ? { categories: config.categories } : {},
    ...config.engines !== undefined ? { engines: config.engines } : {},
    ...config.language !== undefined ? { language: config.language } : {},
  }))
}
