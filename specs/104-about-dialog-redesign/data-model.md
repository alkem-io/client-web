# Phase 1 Data Model: About Dialog Redesign

This is a presentation-layer redesign. There is **no database, no GraphQL schema change, and no new persisted state**. The only "data" is the **view-model** that flows from the integration layer (`CrdSpaceAbout` / `CrdSubspaceAbout`) into the CRD presentational components as plain TypeScript props. The existing `SpaceAboutData` type is the contract; the redesign keeps it (and may add purely-optional fields if the new layout needs them).

## Source → View-Model flow (unchanged)

```
useSpaceAboutDetailsQuery  ─┐
useCommunityGuidelinesQuery ┤→ CrdSpaceAbout / CrdSubspaceAbout (mapping)
useSpaceApplyFlow           ┘        │  builds SpaceAboutData + slots
                                     ▼
                         SpaceAboutDialog (shell/header)
                                     ▼
                          SpaceAboutView (body layout)  ← REDESIGNED
```

The mapping logic in the integration layer is **reused as-is**. GraphQL generated types never cross into `src/crd/` (Constitution III).

## Entities (view-model shapes)

### SpaceAboutData (existing — retained)

The aggregate the view renders. Fields already supplied by the integration mappers:

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Becomes the visible dialog title (R2). |
| `tagline` | `string?` | Rendered under the title (italic). |
| `description` | `string?` | Markdown → `MarkdownContent`. Shown in the space-info panel. |
| `location` | `string?` | `"city, country"`; meta row. |
| `metrics` | `Array<{ name; value }>` | Member count derived from `name === 'members'`. |
| `who` | `string?` | Markdown; "Who" section. |
| `why` | `string?` | Markdown; "Why" section. |
| `provider` | `SpaceLeadData?` | Host / "Hosted by". |
| `leadUsers` | `SpaceLeadData[]` | Leads (people). |
| `leadOrganizations` | `SpaceLeadData[]` | Leads (orgs). |
| `references` | `Array<{ name; uri; description? }>` | References section. |

### SpaceLeadData (existing — retained)

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Display name. |
| `avatarUrl` | `string?` | Missing → standard `AvatarFallback` (FR-013). |
| `type` | `'person' \| 'organization'` | |
| `location` | `string?` | Optional, shown in prototype lead/host rows. |
| `href` | `string` | Profile link (URL from `profile.url`, per urlBuilders rule). |

### Presentational props (drive the redesigned layout)

Existing props on `SpaceAboutDialog` / `SpaceAboutView` that MUST keep working:

| Prop | Purpose | Preserved behavior |
|---|---|---|
| `open` / `onOpenChange` | dialog visibility | FR-009/FR-010 |
| `data: SpaceAboutData` | the view-model | FR-002 |
| `joinSlot?` | apply/join CTA | FR-003/FR-004 |
| `guidelinesSlot?` | `CommunityGuidelinesBlock` | FR-006 |
| `contactHostSlot?` | host-contact affordance | FR-015 |
| `lockTooltipSlot?` | private-space lock indicator | FR-008 |
| `whyTitle?` / `whoTitle?` | level-aware headings | FR-014 |
| `memberCount?` | member metric for the panel | FR-002 |
| `isMember?` | member indication | FR-004 |
| `hasEditPrivilege?` | gates edit affordances | FR-005 |
| `onEditDescription / onEditWhy / onEditWho / onEditReferences / onEditMembers` | settings navigation | FR-005 (same destinations) |

**Possible additive (optional) prop** — only if the prototype's space-info panel needs a distinct "edit space profile" action separate from description editing: an optional `onEditProfile?: () => void`. Default behavior maps "edit space profile" to the existing `onEditDescription` to avoid integration churn. Any new prop is **optional** so the standalone preview and both integration sites keep compiling.

## Validation / rules (presentation-level)

- A section renders only when its data is present **or** the user can edit it (existing pattern); otherwise it is omitted with no placeholder (FR-011).
- Markdown fields render through a markdown renderer, never as raw text (FR-012, Constitution / CRD Rule 10).
- Missing `avatarUrl` → `AvatarFallback` (FR-013).
- All interactive elements are `<a>`/`<button>` with visible focus rings; icon-only buttons carry `aria-label` from `t()` (FR-016, FR-017).

## State (visual only)

| State | Location | Purpose |
|---|---|---|
| guidelines "read more" open | inside `CommunityGuidelinesBlock` (existing) | expand full guidelines (FR-006) |
| dialog open | controlled by integration layer | entry-point parity |

No other component state. No effects beyond React's. React Compiler handles memoization (no manual `useMemo`/`useCallback`).
</content>
