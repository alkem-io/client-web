# Quickstart: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## What This Feature Does

Generates an environment-aware `robots.txt` file so search engines know what to crawl (production) or to stay away entirely (non-production).

## How It Works

1. `buildConfiguration.js` always generates the comprehensive production `public/robots.txt` at build time
2. At container startup, `env.sh` checks `VITE_APP_ALKEMIO_DOMAIN`
3. If domain is `https://alkem.io` (production), the production robots.txt is preserved
4. If domain is anything else (or unset), `env.sh` overwrites with restrictive `Disallow: /` rules (fail-safe)
5. The same Docker image works for any environment — no build args needed

## Local Development

No special setup needed. Running `pnpm start` generates the production robots.txt automatically. In local dev the runtime override doesn't apply (no `env.sh`), so you'll see the full production content.

To verify it works:

```bash
pnpm start
# Then visit http://localhost:3001/robots.txt
```

## Verification

```bash
# After starting dev server:
curl http://localhost:3001/robots.txt

# Expected output (local dev — full production content):
# User-agent: *
# Allow: /
# Disallow: /admin
# Disallow: /identity
# ... (comprehensive rules including AI bot blocking)

# In Docker (non-production domain):
# User-agent: *
# Disallow: /

# In Docker (production domain https://alkem.io):
# Full production content preserved
```

## Files Changed

| File | Change |
|------|--------|
| `buildConfiguration.js` | Added `generateRobotsTxt()` export + build-time generation |
| `.build/docker/env.sh` | Runtime override for non-production domains |
| `.build/.nginx/nginx.conf` | No-cache location block for `/robots.txt` |
| `vite.config.mjs` | `/robots.txt` in no-cache routes + Content-Type fix for static files |
| `.gitignore` | Added `public/robots.txt` to ignored files |
| `src/domain/platform/__tests__/robotsTxt.test.ts` | 13 unit tests for generation logic |

## CI/CD Configuration

No special CI/CD configuration needed. The same Docker image is built for all environments. At container startup, `env.sh` detects the domain and overwrites robots.txt if non-production. Only the production deployment with `VITE_APP_ALKEMIO_DOMAIN=https://alkem.io` preserves the full production robots.txt.
