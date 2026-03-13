# Contract: robots.txt HTTP Response

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## Endpoint

```http
GET /robots.txt
```

## Response

- **Status**: `200 OK`
- **Content-Type**: `text/plain` (enforced by nginx `default_type text/plain` and Vite dev server Content-Type fix)
- **Cache**: `no-store, no-cache, must-revalidate` (nginx location block + Vite dev server no-cache middleware)

## Response Body Variants

### Production (VITE_ROBOTS_ALLOW_INDEXING=true)

```text
# Alkemio - robots.txt

# Global rules (all well-behaved crawlers)
User-agent: *
Allow: /
Disallow: /admin
Disallow: /identity
Disallow: /restricted
Disallow: /profile
Disallow: /api/
Disallow: /graphql
Disallow: /env-config.js
Disallow: /meta.json
Disallow: /assets/
Crawl-delay: 1

# AI / LLM scrapers - block by default
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Omgilibot
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: cohere-ai
Disallow: /

# Aggressive / poorly-behaved scrapers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

# Sitemap (uncomment when a sitemap is available)
# Sitemap: https://app.alkem.io/sitemap.xml
```

### Non-production (any other domain or unset)

```text
# Non-production environment - block all crawlers
User-agent: *
Disallow: /
```

## Environment Detection

Production vs non-production is determined at **container startup** by `env.sh`:

- Checks `VITE_ROBOTS_ALLOW_INDEXING` (injected from K8s/Helm at runtime)
- If `VITE_ROBOTS_ALLOW_INDEXING=true`, keeps the committed `public/robots.txt` (production content)
- Otherwise (unset or any other value), overwrites `robots.txt` with the restrictive disallow-all content (fail-safe)
- `buildConfiguration.js` has no robots.txt logic

## Compliance

- Follows [RFC 9309 — Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
- Valid for Google's robots.txt testing tool
- No `Sitemap:` directive (deferred until sitemap is implemented)
- AI bot blocking follows industry practice (NYT, Reddit, Stack Overflow, etc.)

## Notes

- This is a static file served directly by the web server (Nginx), not by the application
- No API, middleware, or runtime application logic involved
- No GraphQL changes
- `public/robots.txt` is committed with production content; `env.sh` overwrites at container startup for non-production
- Same Docker image for all environments — `VITE_ROBOTS_ALLOW_INDEXING` injected from K8s/Helm at runtime
