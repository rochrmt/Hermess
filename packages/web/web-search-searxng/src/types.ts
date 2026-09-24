/**
 * Wire types for the SearxNG search API (`GET /search?format=json&q=...`).
 * SearxNG returns a flat `results[]`; each entry carries a URL, optional title,
 * optional snippet (content), and optional publishedDate.
 *
 * @module @deepseek-ai/dsh-web-search-searxng/types
 */

/** One entry of SearxNG's flat `results[]`. */
export interface SearxngResult {
  url: string
  title?: string
  content?: string
  publishedDate?: string | null
  engine?: string
  score?: number
}

/** SearxNG's search response envelope. */
export interface SearxngSearchResponse {
  results?: SearxngResult[]
  number_of_results?: number
}

/** SearxNG's error response (best-effort; usually plain text). */
export interface SearxngError {
  error?: string
  message?: string
}
