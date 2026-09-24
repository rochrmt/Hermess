# @deepseek-ai/dsh-web-search-searxng

A [SearxNG](https://searxng.org)-backed `WebSearchProvider` for the harness [web capability seam](../web/README.md) (`ctx.web`). It calls a SearxNG instance's `GET /search?format=json` endpoint and maps the flat `results[]` into the seam's normalized `WebSearchResult`.

**Free and open-source**: SearxNG is a meta-search engine that aggregates results from Google, Bing, DuckDuckGo, and other engines. No API key is required. You can use any public SearxNG instance or self-host your own.

This is an **implementation** package: it registers a provider into `ctx.web`, it does not own the key and it does not register a model-facing tool. Like `@deepseek-ai/dsh-web-search-exa`, it is a function/namespace plugin (`inject: ['web']`).

## Config

| Key | Default | Meaning |
|---|---|---|
| `baseURL` | `https://searxng.site` | SearxNG instance base URL; `/search` is appended. Must have JSON output enabled. |
| `numResults` | `10` | Default result count when a request carries no `maxResults`. |
| `categories` | (unset → SearxNG default: `general`) | Comma-separated SearxNG categories (e.g. `general,it,images`). |
| `engines` | (unset → SearxNG default) | Comma-separated engines to use (e.g. `google,bing,duckduckgo`). |
| `language` | (unset → `all`) | SearxNG language code (e.g. `en`, `fr`, `all`). |

```yaml
- id: web-search-searxng
  name: '@deepseek-ai/dsh-web-search-searxng'
  config:
    baseURL: https://searxng.site
```

## Using a self-hosted instance

For maximum privacy and reliability, self-host SearxNG with Docker:

```bash
docker run -d -p 8080:8080 searxng/searxng
```

Then configure:
```yaml
- id: web-search-searxng
  name: '@deepseek-ai/dsh-web-search-searxng'
  config:
    baseURL: http://localhost:8080
```

Make sure `settings.yml` has `search.formats: [html, json]` enabled.

## Mapping

SearxNG returns a flat `results[]` and no generated answer, so `content` is omitted. Each result maps to a `WebSearchSource`: `url` ← `url`, `title` ← `title`, `snippet` ← `content`, `publishedAt` ← `publishedDate`. Provider failures surface as `WebError` `WEB_PROVIDER_ERROR`; an aborted request surfaces as `WEB_ABORTED`.
