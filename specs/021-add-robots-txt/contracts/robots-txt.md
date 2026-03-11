# Contract: robots.txt HTTP Response

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## Endpoint

```
GET /robots.txt
```

## Response

- **Status**: `200 OK`
- **Content-Type**: `text/plain`
- **Cache**: Handled by web server/CDN configuration (not application concern)

## Response Body Variants

### Production (`VITE_APP_ROBOTS_ALLOW_INDEXING=true`)

```text
User-agent: *
Allow: /
Disallow: /admin
```

### Non-production (default)

```text
User-agent: *
Disallow: /
```

## Compliance

- Follows [RFC 9309 — Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
- Valid for Google's robots.txt testing tool
- No `Sitemap:` directive (deferred until sitemap is implemented)

## Notes

- This is a static file served directly by the web server (Nginx/CDN), not by the application
- No API, middleware, or runtime logic involved
- No GraphQL changes
