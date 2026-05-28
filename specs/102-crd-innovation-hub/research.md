# Phase 0 Research — CRD Innovation Hub Migration

**Feature**: 102-crd-innovation-hub
**Date**: 2026-05-28

All previously-unknown technical choices were resolved either by the existing CRD codebase precedent (Space Settings, Templates, User Profile migrations) or by the three clarifications captured in `spec.md` § Clarifications. No NEEDS CLARIFICATION markers remain.

---

## Decision 1 — Per-section inline-save state machine for the About tab

**Decision**: Reuse the `useAboutTabData.ts` pattern from `src/main/crdPages/topLevelPages/spaceSettings/about/` — a hook that owns:
- A `saveStatusByField` map of `Partial<Record<HubAboutSectionKey, 'idle' | 'saving' | 'saved'>>`
- A `dirtyByField` map computed from local `values` vs server-resolved `saved`
- A `valuesRef` (React 19 stable ref) used as the source of truth for save-time snapshots
- A `savedFlashTimers` ref of `setTimeout` handles to auto-clear the "saved" flash after ~1.8s
- A `startTransition` from `useTransition()` to mark the flash transition as non-urgent

This same hook owns the `useUpdateInnovationHubMutation` call and the `useUploadVisualMutation` call for the banner section.

**Rationale**:
- The Space Settings CRD page has been in production for the entire 040-series and successfully handles the same per-section save shape across name/tagline/what/why/who/location/tags/references. The Hub About tab has the same shape (subdomain/name/tagline/description/tags/banner), only fewer fields.
- Reusing the pattern means: no new abstraction to design, no new test patterns to learn, identical accessibility semantics (`aria-live="polite"` on the inline status).
- React 19 `useTransition` correctly marks the status-flash update as non-urgent so it never blocks a save that the user is racing.

**Alternatives considered**:
- *Single bottom Save button* (legacy MUI pattern) — rejected by Q1 / spec assumption: the prototype explicitly shows per-section save and the user asked for the new design as per the prototype.
- *Debounced auto-save on input change* — rejected because: (a) it deviates from the prototype, (b) it commits content the user may still be editing, (c) the `subdomain` field has server-side validation (uniqueness) that should not fire on every keystroke.

**Source pattern**: `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts`

---

## Decision 2 — Spaces tab: auto-save vs explicit Save button

**Decision**: Auto-save on each user action (add / remove / drag-reorder), reusing the existing `handleSubmitSpaceListFilter` semantics from `InnovationHubSettingsPage.tsx`. No top-level Save button on the Spaces tab. Drag-reorder uses the existing `optimisticResponse` shape — the table re-renders in the new order immediately, the mutation commits in the background, the refetch on success reconciles host-account/visibility metadata.

**Rationale**:
- The legacy page already auto-saves; users have been trained on this behaviour.
- The prototype's top-level "Save" button is decorative given auto-save semantics; including it would invite double-clicks and ambiguous UX ("did my drag save? do I now have to click Save?").
- Confirmed by the spec assumption.

**Alternatives considered**:
- *Batched save with a top-level button* — rejected because it changes the legacy semantics ("use existing functionality" was the user's brief) and would require new state for the staged-but-unsaved delta.
- *Auto-save + redundant Save button* — rejected as UX clutter.

**Confirmation feedback**: A `toast` (CRD `sonner` primitive at `src/crd/primitives/sonner.tsx`) fires on each successful action. Failures roll back the optimistic update and surface an error toast.

---

## Decision 3 — Description editor

**Decision**: Use the existing CRD `MarkdownEditor` at `@/crd/forms/markdown/MarkdownEditor.tsx`. The legacy Hub form's description is stored as a markdown string (the `profile.description` field), which is exactly what `MarkdownEditor` produces. On the public Hub home page, the description is rendered via `MarkdownContent` (the public-facing renderer).

**Rationale**:
- `MarkdownEditor` is the established CRD pattern for rich-text editing (used by Space Settings, Posts, Memos, etc.).
- The mutation contract (`updateInnovationHub.hubData.profileData.description`) is a string field — same shape on both sides.
- The legacy form uses `FormikMarkdownFieldLazy`, which also writes markdown — no content reshaping needed.
- The prototype uses `ReactQuill`, but that produces HTML, not markdown — adopting it verbatim would break content parity. The CRD `MarkdownEditor` is the right substitute because it matches the storage shape.

**Alternatives considered**:
- *Port `ReactQuill` into CRD* — rejected because it introduces a new dependency, breaks markdown parity, and contradicts the established CRD pattern.
- *Wrap the MUI `FormikMarkdownFieldLazy`* — rejected: violates the CRD "no MUI in `src/crd/`" golden rule.
- *Plain `Textarea` with raw markdown* — rejected as a UX regression vs. the legacy and the prototype.

---

## Decision 4 — Settings header thumbnail visual source

**Decision** (resolved by clarification Q1): The Settings sticky header renders a circular `w-12 h-12 rounded-full` thumbnail. When the hub has a `BANNER_WIDE` visual, the thumbnail crops that image into a circle. When no banner is set, the thumbnail falls back to the deterministic `pickColorFromId(hub.id)` gradient with the hub's initials over it — standard CRD avatar-fallback pattern.

**Rationale**:
- Standard CRD convention: real image always wins; deterministic colour fills the gap when there is no banner.
- No stock placeholder fallback (per CRD guidelines).
- Keeps the hub recognisable across pages even when the banner is missing.

**Implementation note**: The CRD `AvatarFallback` primitive already accepts a `color` prop and applies `backgroundGradient()` internally; the integration layer's mapper computes `color: pickColorFromId(hub.id)` and passes both the banner URL and the colour to the thumbnail component.

---

## Decision 5 — "Browse all Spaces on Alkemio" CTA target

**Decision** (resolved by clarification Q2): The CTA links to the **canonical platform host** — `//<config.locations.domain>/spaces` — using the existing `useConfig().locations.domain` value, identical to the legacy "go to main page" pattern. Visitors on a hub subdomain explicitly exit the hub's frame when they click the CTA.

**Rationale**:
- Matches legacy behaviour ("use existing functionality").
- Respects the CTA's purpose: it exists to escape the hub's curated filter, so it must NOT stay subdomain-relative (which would re-apply the same filter on the destination).
- Avoids subtle UX confusion where the user clicks "Browse all" and still sees a filtered/decorated Spaces explorer.

**Implementation note**: The link is constructed in the integration mapper, passed to the CRD `InnovationHubHome` component as an `allSpacesUrl: string` prop. The CRD component renders an `<a href>` — no `react-router-dom`, no `window.location`, in line with the CRD rule that links accept `href` and never navigate programmatically.

---

## Decision 6 — Non-admin lands on settings URL

**Decision** (resolved by clarification Q3): On detecting missing `Update` privilege at data-load time, the integration layer renders `<Navigate to={buildInnovationHubUrl(subdomain) | profile.url} replace />` to redirect the user to the hub home. Fail-closed: no form, no permission-denied page, no read-only render.

**Rationale**:
- Safest UX (no exposure of admin-only fields).
- Simplest implementation (single privilege check in `useHubAccessGuard`).
- Improves on the legacy behaviour, which renders the form regardless of privilege and relies on mutations failing server-side.

**Implementation**: A `useHubAccessGuard` hook reads `authorization.myPrivileges` from the resolved hub. It returns either `{ allowed: true }` or `{ allowed: false, redirectTo: string }`. The settings page renders `<Navigate>` when not allowed; otherwise it renders the settings shell.

---

## Decision 7 — Route dispatch strategy

**Decision**: Two changes to existing dispatchers, both gated on `useCrdEnabled()` (already in `TopLevelRoutes.tsx`):

1. **`/hub/<slug>` and `/hub/<slug>/settings`** (the path-based entry, currently `HubRoute` in `src/domain/innovationHub/routing/HubRoute.tsx`):
   - Add a parallel CRD route surface at `src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx`.
   - In `TopLevelRoutes.tsx`, gate the `${TopLevelRoutePath.Hub}/*` route block on `crdEnabled`: render `<CrdHubRoute />` when true, `<HubRoute />` (legacy) when false.
   - Both are lazy-loaded — the inactive chunk is never fetched.

2. **`/home` on hub subdomain** (the subdomain-resolution dispatcher, currently in `src/main/topLevelPages/Home/CrdHomePage.tsx`):
   - Currently `CrdHomePage` resolves the hub via `useInnovationHub()` and always renders the legacy MUI `InnovationHubHomePage` when a hub is found. This is the latent bug FR-027 must fix.
   - Change the hub-resolved branch to render the new `CrdInnovationHubHomePage` instead. The dashboard branch (no hub resolved) stays untouched.
   - The legacy `HomePage` dispatcher (the `designVersion=1` path) remains unchanged.

**Rationale**:
- Matches the established CRD-migration dispatch pattern from `SpaceExplorerPage` (legacy MUI vs CRD via `useCrdEnabled()` in `TopLevelRoutes.tsx`).
- Keeps the diff minimal — two existing files modified, no new dispatchers introduced.
- Preserves all existing fallbacks (404, dashboard for non-hub subdomain, etc.).

**Alternatives considered**:
- *Single dispatch point that picks the renderer inside the page* — rejected because it forces both versions to load on the same chunk, defeating the lazy-loading rule (FR-025).
- *Move the toggle decision into `HubRoute` itself* — rejected because `HubRoute` lives under `src/domain/` and the CRD layer should not be reached through a domain route file (architectural smell — the CRD route belongs in `crdPages/`).

---

## Decision 8 — Reusing the existing `AddSpaceByUrlDialog` flow in the CRD layer

**Decision**: Port the dialog UI to CRD primitives at `src/main/crdPages/innovationHub/dialogs/CrdAddSpaceByUrlDialog.tsx`. The integration-layer dialog uses CRD's `Dialog`, `Input`, `Button` primitives, with the same `useResolveSpaceUrl` domain hook for the URL-to-space-id resolution.

**Rationale**:
- The legacy `AddSpaceByUrlDialog` lives in `src/domain/innovationHub/InnovationHubsSettings/` and imports from `@mui/material` (`Box`, `Button`, `CircularProgress`, `FormHelperText`, `Stack`, `TextField`) plus the MUI dialog primitives. Importing it into the CRD layer would violate the "no MUI in CRD pages" rule.
- The dialog's _logic_ (URL validation, debounced resolve, duplicate detection) is captured in the `useResolveSpaceUrl` hook (headless). The CRD port keeps the same logic via the same hook — only the UI primitives change.
- Co-locating the CRD dialog in `crdPages/innovationHub/dialogs/` (not in `src/crd/components/`) is the right call because the dialog is a hub-specific surface (not a generic CRD component) AND it consumes a domain hook (`useResolveSpaceUrl`), which CRD presentational components are forbidden from doing.

**Alternatives considered**:
- *Promote the dialog to a generic CRD primitive* — rejected because it carries domain-specific resolution logic.
- *Refactor the legacy MUI dialog to be CRD-aware* — rejected because the legacy dialog must remain in place for `designVersion=1`.
- *Replace URL-based add with a pick-from-list dialog* (as the prototype suggests) — rejected because the user explicitly said "use the existing functionality". The URL-based flow shipped on branch `095-hub-add-space-url` and is the canonical add path.

---

## Decision 9 — i18n namespace and translation file scope

**Decision**: New namespace `crd-innovationHub` under `src/crd/i18n/innovationHub/`. Lazy-loaded for all 6 languages (en, nl, es, bg, de, fr) via the existing `crdNamespaceImports` registry in `src/core/i18n/config.ts`. All keys authored in the same PR; no Crowdin. Glossary terms (Space, Subspace, Post, template, Layout, Virtual Contributor) stay in English for Dutch only (per current enforcement scope).

**Key sections planned** (full list in `contracts/crd-components.md`):
- `home.banner.alt` — alt text for the banner image
- `home.spacesSection.title` — "{{hubName}} Spaces" or equivalent
- `home.spacesSection.empty` — empty-state copy
- `home.allSpacesCta` — "Browse all Spaces on Alkemio" — translated to localised wording per glossary (Spaces stays English in Dutch)
- `settings.tabs.about` / `settings.tabs.spaces` — tab labels
- `settings.about.subdomain` / `name` / `tagline` / `description` / `tags` / `banner` — section labels and helper text
- `settings.about.save.idle` / `saving` / `saved` — inline status labels
- `settings.spaces.columns.name` / `visibility` / `host` / `actions` — table headers
- `settings.spaces.actions.add` / `remove` / `confirmRemove.title` / `confirmRemove.body` — action labels
- `settings.spaces.empty` — empty-state copy
- `settings.spaces.addDialog.*` — CRD add-by-URL dialog strings (placeholder, validation messages, submit label, etc.)
- `settings.header.viewHubAria` — "View hub" accessibility label on the view-hub icon button
- `settings.guard.redirecting` — sr-only message while the privilege guard redirects

**Rationale**: Follows the established pattern from `crd-exploreSpaces`, `crd-spaceSettings`, `crd-contributorSettings`. Lazy-loading keeps the chunk delta minimal for users who never open a hub. All 6 languages authored together so the namespace ships consistent across the platform on PR merge.

---

## Decision 10 — Banner image upload mechanics

**Decision**: Use the existing `useUploadVisualMutation` against the resolved hub's `BANNER_WIDE` visual id (already returned by `InnovationHubSettings` query via the `InnovationHubProfile` fragment's `visual(type: BANNER_WIDE)`). The CRD presentational About tab renders the hover-to-reveal "Change Banner" button per the prototype; the actual file-input + upload mutation lives in the integration hook (`useHubAboutTabData`), following the `useAboutTabData` pattern from Space Settings (`uploadVisualForField`).

**Rationale**:
- Same mutation, same auth, same storage bucket as the legacy page.
- The integration hook already exists as a precedent (Space Settings); the same shape transfers cleanly.
- The CRD layer never touches the upload mutation directly — it receives an `onBannerFileSelected: (file: File) => void` callback prop.

**File-type/size validation**: deferred to the existing mutation's server-side validation; client-side restriction is limited to the `<input type="file" accept="image/*" />` attribute (same as legacy).

---

## Decision 11 — Drag-reorder accessibility

**Decision**: Use `@dnd-kit/core` + `@dnd-kit/sortable` (existing dependencies, already used by the legacy `InnovationHubSpacesField`) with the same `useSensors` setup: `PointerSensor` (`activationConstraint: { distance: 5 }`) + `KeyboardSensor` (`coordinateGetter: sortableKeyboardCoordinates`). The CRD table rows expose drag handles via the `GripVertical` lucide icon with a visible `focus-visible:ring` and an `aria-label` from the i18n namespace.

**Rationale**:
- `@dnd-kit` is already in the bundle — no new dependency.
- The legacy implementation has been keyboard-accessible since launch; preserving the sensor setup carries that forward.
- Drag handles get focus rings per WCAG 2.1 AA, and keyboard users can reorder via arrow keys.

---

## Decision 12 — Where the data-mapping happens (defence against the GraphQL-in-CRD anti-pattern)

**Decision**: Every GraphQL → CRD prop conversion happens in a dedicated `dataMappers/*.ts` file inside `src/main/crdPages/innovationHub/`. CRD presentational components in `src/crd/components/innovationHub/` receive only plain TypeScript types defined alongside the component (e.g. `InnovationHubHomeData`, `HubSettingsSpaceRow`).

**Rationale**:
- Hard rule from CRD CLAUDE.md and from the migration guide: GraphQL types never leak into CRD prop interfaces.
- Centralising the mapping in one file per data flow makes the surface easy to unit-test (`dataMappers.test.ts`) — pure input/output transforms.

---

## Open questions

None. All decisions either inherited from existing CRD patterns or pinned by the three clarifications (Q1/Q2/Q3) in `spec.md`.
