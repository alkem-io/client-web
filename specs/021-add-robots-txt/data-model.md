# Data Model: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## Entities

This feature has no persistent data entities, database models, or GraphQL schema changes. It operates entirely at the build infrastructure level.

### Build Artifact: `public/robots.txt`

A static text file generated at build time by `buildConfiguration.js`.

| Attribute | Type | Description |
|-----------|------|-------------|
| Content | `text/plain` | RFC 9309-compliant robots.txt directives |
| Generation trigger | Build-time | Created on every `pnpm start` / `pnpm build` |
| Input | `VITE_APP_ROBOTS_ALLOW_INDEXING` env var | `"true"` → production rules; anything else → disallow all |

### Environment Variable: `VITE_APP_ROBOTS_ALLOW_INDEXING`

| Property | Value |
|----------|-------|
| Type | String (boolean-like) |
| Required | No (absence = fail-safe disallow) |
| Valid values | `"true"` enables indexing; all other values disable |
| Scope | Build-time only (read by `buildConfiguration.js`) |
| CI/CD | Set to `"true"` only in production deployment pipelines |

## State Transitions

```
Environment variable check:
  ┌─────────────────────────────────┐
  │ VITE_APP_ROBOTS_ALLOW_INDEXING  │
  └─────────┬───────────────────────┘
            │
     ┌──────┴──────┐
     │  === "true"  │
     ├──Yes─────────┼──No/Missing──┐
     ▼              │              ▼
  Production        │         Restrictive
  robots.txt        │         robots.txt
  (Allow: /)        │         (Disallow: /)
  (Disallow: /admin)│
                    │
```

## Relationships

No relationships with other entities. This feature is self-contained build infrastructure.
