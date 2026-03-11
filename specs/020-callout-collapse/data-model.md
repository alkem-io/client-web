# Data Model: Configurable Callout Collapse/Expand State

**Feature Branch**: `020-callout-collapse`
**Date**: 2026-03-11

## Entities

### SpaceSettingsLayout (New)

| Field                         | Type                          | Required | Description                                            |
| ----------------------------- | ----------------------------- | -------- | ------------------------------------------------------ |
| calloutDescriptionDisplayMode | CalloutDescriptionDisplayMode | Yes      | Default collapse/expand state for callout descriptions |

### CalloutDescriptionDisplayMode (Enum)

| Value     | Description                                      |
| --------- | ------------------------------------------------ |
| COLLAPSED | Callout descriptions render collapsed by default |
| EXPANDED  | Callout descriptions render expanded by default  |

### SpaceSettings (Extended)

Existing entity with new field:

| Field         | Type                       | Required | Notes                                  |
| ------------- | -------------------------- | -------- | -------------------------------------- |
| privacy       | SpaceSettingsPrivacy       | Yes      | Existing                               |
| membership    | SpaceSettingsMembership    | Yes      | Existing                               |
| collaboration | SpaceSettingsCollaboration | Yes      | Existing                               |
| sortMode      | SpaceSortMode              | Yes      | Existing                               |
| **layout**    | **SpaceSettingsLayout**    | **Yes**  | **New — callout display mode setting** |

## Client-Side Type Mapping

### SpaceSettingsModel.ts additions

```typescript
export interface SpaceSettingsLayout {
  calloutDescriptionDisplayMode: CalloutDescriptionDisplayMode;
}
```

Where `CalloutDescriptionDisplayMode` is the generated GraphQL enum imported from `graphql-schema.ts`.

### SpaceDefaultSettings additions

```typescript
layout: {
  calloutDescriptionDisplayMode: CalloutDescriptionDisplayMode.Expanded,
}
```

Default is `EXPANDED` to preserve current behavior for existing spaces. New spaces default to `COLLAPSED` server-side.

## Data Flow

```
Server (JSONB settings)
  → GraphQL query (settings.layout.calloutDescriptionDisplayMode)
    → Apollo cache (normalized by space ID)
      → Component tree (prop drilling or query)
        → ExpandableMarkdown (defaultCollapsed prop)
```

## State Transitions

### ExpandableMarkdown State (modified)

```
                    defaultCollapsed=false          defaultCollapsed=true
                    ─────────────────────           ─────────────────────
detecting ──┬──→ expanded (overflow)           detecting ──┬──→ collapsed (overflow)
            └──→ no-overflow (fits)                        └──→ no-overflow (fits)

expanded ←──→ collapsed  (user toggles, temporary per-session)
```

On navigation: state resets to initial detection based on space setting.
