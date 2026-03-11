# Data Model: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## Entities

This feature has no persistent data entities, database models, or GraphQL schema changes. It operates at the static file and container startup infrastructure level.

### Static File: `public/robots.txt`

A plain text file committed directly to the repository with production crawling rules. Served by nginx in production, Vite dev server locally.

| Attribute        | Type         | Description                                                                                  |
| ---------------- | ------------ | -------------------------------------------------------------------------------------------- |
| Content          | `text/plain` | RFC 9309-compliant robots.txt directives                                                     |
| Committed        | Yes          | Version-controlled, not gitignored                                                           |
| Runtime override | `env.sh`     | Overwritten with disallow-all at container startup when `VITE_ROBOTS_ALLOW_INDEXING != true` |

### Runtime Variable: `VITE_ROBOTS_ALLOW_INDEXING`

| Property                | Value                                                                           |
| ----------------------- | ------------------------------------------------------------------------------- |
| Type                    | String                                                                          |
| Checked by              | `env.sh` at container startup                                                   |
| `true`                  | Keeps committed `public/robots.txt` (production content)                        |
| Unset / any other value | `env.sh` overwrites with disallow-all (fail-safe default)                       |
| Set via                 | K8s/Helm runtime env var injection (matching `VITE_APP_ALKEMIO_DOMAIN` pattern) |
| DOM exposure            | None -- `VITE_*` (without `_APP_`) prefix not written to `window._env_`         |

## State Transitions

```
Container startup (env.sh):
  +-----------------------------+
  | VITE_ROBOTS_ALLOW_INDEXING  |
  +-------------+---------------+
                |
       +--------+---------+
       | === "true"       |
       +-Yes-----------+--+-No/Unset--+
       v               |             v
  Keep committed       |         Overwrite with
  public/robots.txt    |         disallow-all
  (comprehensive rules,|         (User-agent: *
  AI bot blocking,     |          Disallow: /)
  sensitive path blocks)
```

## Relationships

No relationships with other entities. This feature is self-contained infrastructure logic.
