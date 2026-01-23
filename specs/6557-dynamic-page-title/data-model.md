# Data Model: Dynamic Page Title in Browser Tabs

**Feature**: 6557-dynamic-page-title
**Date**: 2026-01-22

## Overview

This feature has minimal data model requirements as it operates on the client-side only and leverages existing entity data from GraphQL contexts.

## Entities

### PageTitle (Transient)

The page title is a transient, computed value that exists only in the DOM's `document.title` property.

| Attribute | Type   | Description                                          | Source            |
| --------- | ------ | ---------------------------------------------------- | ----------------- |
| context   | string | The page-specific portion of the title               | Component/Context |
| suffix    | string | Brand identifier, default "Alkemio"                  | Constant          |
| fullTitle | string | Computed: `{context} \| {suffix}` or just `{suffix}` | Hook              |

### Existing Entity Sources (Read-Only)

The following existing entities provide `displayName` values for dynamic titles:

| Entity             | Context/Hook                        | Property                             |
| ------------------ | ----------------------------------- | ------------------------------------ |
| Space              | `SpaceContext` → `useSpace()`       | `space.about.profile.displayName`    |
| Subspace           | `SubspaceContext` → `useSubSpace()` | `subspace.about.profile.displayName` |
| User               | Query in `UserPageLayout`           | `profile.displayName`                |
| Organization       | `OrganizationProvider`              | `profile.displayName`                |
| VirtualContributor | VC context/query                    | `profile.displayName`                |
| InnovationPack     | Pack query                          | `profile.displayName`                |

## State Transitions

```
┌─────────────────┐     Navigate      ┌─────────────────┐
│  Initial Load   │ ───────────────▶ │   Loading       │
│  (index.html)   │                   │   (Alkemio)     │
└─────────────────┘                   └────────┬────────┘
                                               │
                                               │ Data Ready
                                               ▼
                                      ┌─────────────────┐
                                      │  Title Set      │
                                      │  ([Name] | Alk) │
                                      └────────┬────────┘
                                               │
                                               │ Navigate Away
                                               ▼
                                      ┌─────────────────┐
                                      │  New Page       │
                                      │  (repeat cycle) │
                                      └─────────────────┘
```

## Validation Rules

| Rule         | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| Non-empty    | Title context must not be empty string (fallback to "Alkemio") |
| No undefined | Undefined titles fallback to "Alkemio"                         |
| String only  | Title must be a string type                                    |

## No Persistence

- Title is not stored in any database or cache
- Computed on each navigation/render
- Lost on page close (expected browser behavior)

## No New GraphQL Schema

- No schema changes required
- All needed data already exposed via existing queries
- Profile `displayName` available on all relevant entities
