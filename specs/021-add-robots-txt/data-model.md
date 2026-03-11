# Data Model: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## Entities

This feature has no persistent data entities, database models, or GraphQL schema changes. It operates at the build infrastructure and container startup level.

### Build Artifact: `public/robots.txt`

A static text file generated at build time by `buildConfiguration.js`, potentially overridden at container startup by `env.sh`.

| Attribute | Type | Description |
|-----------|------|-------------|
| Content | `text/plain` | RFC 9309-compliant robots.txt directives |
| Build-time generation | `buildConfiguration.js` | Always generates comprehensive production rules |
| Runtime override | `env.sh` | Overwrites with restrictive rules when domain is not `https://alkem.io` |

### Environment Detection: `VITE_APP_ALKEMIO_DOMAIN`

| Property | Value |
|----------|-------|
| Type | String (URL) |
| Checked by | `env.sh` at container startup |
| Production value | `https://alkem.io` — preserves production robots.txt |
| Other values | Any non-production domain — overwritten with restrictive rules |
| Absent/unset | Treated as non-production (fail-safe) |

## State Transitions

```
Container startup (env.sh):
  ┌──────────────────────────────┐
  │ VITE_APP_ALKEMIO_DOMAIN      │
  └─────────┬────────────────────┘
            │
     ┌──────┴──────────────┐
     │ === "https://alkem.io" │
     ├──Yes────────────────┼──No/Missing──┐
     ▼                     │              ▼
  Keep production          │         Override with
  robots.txt               │         restrictive
  (comprehensive rules,    │         robots.txt
  AI bot blocking,         │         (Disallow: /)
  sensitive path blocks)   │
                           │
```

## Relationships

No relationships with other entities. This feature is self-contained build/infrastructure logic.
