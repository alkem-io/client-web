# Quickstart: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## What This Feature Does

Generates an environment-aware `robots.txt` file at build time so search engines know what to crawl (production) or to stay away entirely (non-production).

## How It Works

1. `buildConfiguration.js` reads the `VITE_APP_ROBOTS_ALLOW_INDEXING` environment variable
2. If `"true"`, writes production robots.txt (allow public content, block `/admin`)
3. Otherwise, writes restrictive robots.txt (block everything) — fail-safe default
4. The generated `public/robots.txt` is served as a static file by the web server

## Local Development

No special setup needed. Running `pnpm start` generates a restrictive robots.txt automatically (since `VITE_APP_ROBOTS_ALLOW_INDEXING` is not set locally).

To test production rules locally:

```bash
VITE_APP_ROBOTS_ALLOW_INDEXING=true pnpm start
# Then visit http://localhost:3001/robots.txt
```

## Verification

```bash
# After starting dev server or building:
curl http://localhost:3001/robots.txt

# Expected output (development — no VITE_APP_ROBOTS_ALLOW_INDEXING):
# User-agent: *
# Disallow: /

# Expected output (production — VITE_APP_ROBOTS_ALLOW_INDEXING=true):
# User-agent: *
# Allow: /
# Disallow: /admin
```

## Files Changed

| File | Change |
|------|--------|
| `buildConfiguration.js` | Added robots.txt generation logic |
| `.env` | Documents `VITE_APP_ROBOTS_ALLOW_INDEXING` variable |
| `.gitignore` | Added `public/robots.txt` to ignored files |
| Test file | Unit test for robots.txt content generation |

## CI/CD Configuration

Set `VITE_APP_ROBOTS_ALLOW_INDEXING=true` **only** in the production deployment pipeline. All other environments (staging, dev, test) should leave it unset or set to any value other than `"true"`.
