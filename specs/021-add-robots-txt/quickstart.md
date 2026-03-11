# Quickstart: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## What This Feature Does

Generates an environment-aware `robots.txt` file so search engines know what to crawl (production) or to stay away entirely (non-production).

## How It Works

1. `public/robots.txt` is committed directly to the repository with comprehensive production crawling rules
2. In Docker, `env.sh` runs at container startup (before nginx)
3. If `VITE_ROBOTS_ALLOW_INDEXING=true` (set by K8s/Helm on production), the committed production file is preserved
4. Otherwise (unset or any other value), `env.sh` overwrites with disallow-all — the fail-safe default
5. Same Docker image works for all environments — runtime env var controls behaviour

## Local Development

No special setup needed. `public/robots.txt` is committed with production content, so running `pnpm start` serves it as-is. In local dev the runtime override doesn't apply (no `env.sh`), so you'll always see the full production content — this is harmless.

To verify:

```bash
pnpm start
curl http://localhost:3001/robots.txt
```

## Verification

```bash
# Local dev — always shows production content:
# User-agent: *
# Allow: /
# Disallow: /admin
# Disallow: /identity
# ... (comprehensive rules including AI bot blocking)

# Docker (non-production, VITE_ROBOTS_ALLOW_INDEXING unset):
# # Non-production environment - block all crawlers
# User-agent: *
# Disallow: /

# Docker (production, VITE_ROBOTS_ALLOW_INDEXING=true):
# Full production content preserved
```

## Files Changed

| File                                              | Change                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `public/robots.txt`                               | Committed production robots.txt with comprehensive crawling rules                        |
| `.build/docker/env.sh`                            | Runtime override: overwrites with disallow-all when `VITE_ROBOTS_ALLOW_INDEXING != true` |
| `.build/.nginx/nginx.conf`                        | No-cache location block for `/robots.txt` with `default_type text/plain`                 |
| `vite.config.mjs`                                 | `/robots.txt` in no-cache routes + Content-Type fix for static files                     |
| `src/domain/platform/__tests__/robotsTxt.test.ts` | 9 unit tests verifying production robots.txt content                                     |

## CI/CD Configuration

Production indexing is enabled by setting the `VITE_ROBOTS_ALLOW_INDEXING=true` environment variable on the production container via K8s/Helm — matching the existing pattern for variables like `VITE_APP_ALKEMIO_DOMAIN`. All other environments (dev, staging, test) leave it unset, so `env.sh` overwrites with disallow-all at startup.
