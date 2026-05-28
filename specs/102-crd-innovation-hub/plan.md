# Implementation Plan: CRD Innovation Hub & Innovation Hub Settings

**Branch**: `102-crd-innovation-hub` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/102-crd-innovation-hub/spec.md`

## Summary

Migrate two existing MUI pages — the public **Innovation Hub home** (rendered at the hub's subdomain root AND at `/hub/<slug>`) and the **Innovation Hub Settings** page — to the CRD design system (shadcn/ui + Tailwind), per the Figma Make prototype. The migration is purely UI-layer: every GraphQL operation, every mutation contract, every URL family stays unchanged. The new pages live behind the existing per-user `UserSettings.designVersion` toggle (`1` = MUI / `2` = CRD), gated by `useCrdEnabled()`; legacy MUI files are left in place. The settings page splits into two tabs — **About** (subdomain, name, tagline, description, tags, banner; per-section inline save) and **Spaces** (table with drag-reorder, Add via the existing "Add Space by URL" flow, Remove with `ConfirmationDialog`). The home-route dispatcher (`CrdHomePage`) is updated to render the new CRD hub home when a subdomain resolves to a hub on `designVersion=2` — fixing a latent bug where the dispatcher currently always falls back to the legacy MUI hub page regardless of the design preference. Non-admins who land on the settings URL are redirected to the hub home (fail-closed).

Technical approach: three layers per the CRD migration guide. (1) Pure presentational CRD components in `src/crd/components/innovationHub/` — no MUI, no GraphQL types, no domain imports, no `useNavigate`. (2) Integration layer in `src/main/crdPages/innovationHub/` — GraphQL queries/mutations, data mappers, routing, the privilege guard, the lazy AddSpaceByUrl flow port. (3) Route dispatch in `TopLevelRoutes.tsx` (and the existing `CrdHomePage` dispatcher) — chooses between legacy MUI and CRD via `useCrdEnabled()`. The per-section save behaviour mirrors the existing `useAboutTabData` pattern in the CRD Space Settings (status map + dirty map + ref-stable values).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 with React Compiler enabled (no manual `useMemo`/`useCallback`/`React.memo`).
**Primary Dependencies**: shadcn/ui + Tailwind CSS v4 + Radix UI (existing, via `@/crd/primitives/*`); `class-variance-authority`, `lucide-react`, `react-i18next` (all existing). Apollo Client + generated hooks (`useInnovationHubByIdQuery`, `useInnovationHubQuery`, `useInnovationHubSettingsQuery`, `useUpdateInnovationHubMutation`, `useUploadVisualMutation` — all already generated). **GraphQL change**: the `InnovationHubHomeInnovationHub` fragment is extended with `spaceListFilter { id }` (the only schema-adjacent change in the feature, introduced for FR-004 — see T004a). Per project guidelines, any `.graphql` edit MUST run `pnpm codegen` and commit the regenerated `src/core/apollo/generated/*` outputs in this PR, with a short schema/operation diff summary in the PR description. `@dnd-kit/core` + `@dnd-kit/sortable` (existing, used by the legacy Spaces field — reused for CRD drag-reorder). `date-fns` only for any date formatting (no `dayjs` in CRD/crdPages layers). No new runtime dependencies.
**Storage**: N/A — frontend SPA. Server-side persistence via existing `updateInnovationHub` mutation and `uploadVisual` mutation. Client-side persistence limited to the existing `localStorage('alkemio-design-version')` mirror for the design-version toggle (unchanged).
**Testing**: Vitest + jsdom (existing). New tests focus on: (a) the per-section save reducer in the About tab integration hook; (b) the route guard that redirects non-admins; (c) the data mappers (GraphQL → CRD prop types). Component-level a11y is verified via code review checklist; visual fidelity via the standalone CRD app at `pnpm crd:dev` against the prototype.
**Target Platform**: Modern evergreen browsers (≥90% caniuse coverage per CLAUDE.md). No CSS `@container`, no `Array.prototype.at()`, no `Object.hasOwn()`, no `structuredClone()`.
**Project Type**: Single-project SPA (`src/` layout). Three-layer CRD migration pattern (CRD presentational + crdPages integration + routes wiring).
**Performance Goals**: SC-003 — anonymous visitor sees banner, name, description, and the first row of Space cards within 1 second of HTML response on broadband. SC-006 — both legacy and CRD versions lazy-loaded; the inactive version's chunk is never fetched in a session. No render-blocking dependencies in the new pages (Apollo hooks fire on mount; loading states render through CRD skeletons).
**Constraints**:
- CRD golden rules: zero MUI imports under `src/crd/`; no GraphQL types in CRD props; all event handlers are props; Tailwind-only styling; semantic typography tokens; WCAG 2.1 AA on every interactive element.
- React Compiler is on — write plain expressions, do not add manual memoization.
- All new strings go through `useTranslation('crd-innovationHub')` and are authored in all 6 supported languages (en, nl, es, bg, de, fr) in the same PR. Do-not-translate platform terms (Space, Subspace, Post, template, Layout, Virtual Contributor) stay in English for Dutch.
- URLs are produced via `@/main/routing/urlBuilders`; no inline path templating in the CRD layer.
- All deletions confirmed via `ConfirmationDialog` (CRD rule); discard-on-close for dirty dialogs via `useDialogCloseGuard`.
- Legacy MUI hub files must remain in the codebase, untouched, until the design-version toggle is retired.
**Scale/Scope**: Two pages, ~6 new CRD presentational components, ~5 new integration files, ~30–45 i18n keys across 6 languages, no new GraphQL operations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Domain-Driven Frontend Boundaries — ✅ PASS

The feature does not introduce new domain rules. All business logic stays in existing surfaces: the `useInnovationHub*` hook family in `src/domain/innovationHub/`, the `updateInnovationHub` mutation, the `uploadVisual` mutation, the visibility filtering. The CRD components in `src/crd/components/innovationHub/` are strictly presentational. The integration layer in `src/main/crdPages/innovationHub/` orchestrates existing domain hooks; it does not duplicate or relocate business rules. No new domain façade is required.

### II. React 19 Concurrent UX Discipline — ✅ PASS

Per-section save UX in the About tab uses `useTransition` for non-urgent state updates (status flash → idle) — mirroring the proven pattern in `useAboutTabData.ts` (Space Settings CRD). Loading states use Suspense boundaries (already in route dispatch) and `<Loading />` fallbacks. The home-route dispatcher avoids race conditions (no flash of dashboard → flash of hub home) by gating on `innovationHubLoading === false`. No new legacy lifecycle patterns introduced. No manual memoization (React Compiler).

### III. GraphQL Contract Fidelity — ✅ PASS

No schema changes. All generated hooks (`useInnovationHubByIdQuery`, `useInnovationHubQuery`, `useInnovationHubSettingsQuery`, `useUpdateInnovationHubMutation`, `useUploadVisualMutation`) already exist in `src/core/apollo/generated/apollo-hooks.ts`. The existing `InnovationHubHomeInnovationHub`, `InnovationHubSettings`, `InnovationHubSpace` fragments are reused as-is. The integration layer maps GraphQL types to plain CRD prop types in dedicated mapper files; CRD components never see generated types. Optimistic update for `spaceListFilter` reorder preserves the existing pattern from `InnovationHubSettingsPage.tsx`.

### IV. State & Side-Effect Isolation — ✅ PASS

CRD presentational components hold only visual state (`useState` for dialog open/close, tab active state, controlled inputs). Per-section save state lives in the integration-layer hook (`useHubAboutTabData`), not in the presentational component. Apollo cache is the source of truth for hub data. No DOM manipulation. The privilege guard is a small hook in the integration layer; it gates rendering via `<Navigate>` from `react-router-dom`. All cross-cutting concerns (routing, GraphQL, navigation) funnel through `src/core` and `src/domain` adapters — the CRD layer only consumes props.

### V. Experience Quality & Safeguards — ✅ PASS

- **WCAG 2.1 AA**: every icon button has `aria-label`; decorative icons are `aria-hidden`; lists render as `<ul>`/`<li>`; the Spaces table uses semantic `<table>`/`<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>`; the tabs use Radix `Tabs` primitives (keyboard-accessible, arrow-key navigation); focus-visible rings on all interactive elements; loading states use `<output>` or `role="status"` with `aria-label`; the per-section "Saved" status has `aria-live="polite"` so screen readers announce save completions.
- **Performance**: both versions are lazy-loaded via `lazyWithGlobalErrorHandler`; the CRD page imports zero MUI; bundle delta is minimal (~6 new presentational components + integration layer).
- **Testing**: 3 unit-test surfaces (per-section save reducer, privilege guard, data mappers) using Vitest. Visual fidelity verified against the prototype via the standalone preview app.
- **Observability**: routes wrapped in `WithApmTransaction` (existing); no new observability requirements.

### Architecture Standards — ✅ PASS

- §1 Feature directories: new CRD components under `src/crd/components/innovationHub/` (presentational); new integration under `src/main/crdPages/innovationHub/`. Routing composition stays thin in `TopLevelRoutes.tsx` — delegates to the integration layer.
- §2 CRD design system: new pages use CRD; existing MUI pages remain.
- §3 i18n: all strings via `react-i18next` namespace `crd-innovationHub`; all 6 supported languages authored in the same PR.
- §5 Import transparency: explicit file paths only; no barrel `index.ts` exports.
- §6 SOLID:
  - **SRP**: CRD `InnovationHubHome.tsx` (presentational) ↔ `useInnovationHubHomeData` (integration hook) ↔ `mapInnovationHubToHomeData` (mapper); three distinct responsibilities.
  - **OCP**: per-section save status uses a discriminated `'idle' | 'saving' | 'saved'` union — adding a new status (`'error'`) extends the type without modifying existing handlers.
  - **LSP**: the CRD Space card prop type (`SpaceCardData`) is reused — hub-selected Spaces produce the same shape as platform Spaces, satisfying the substitutability contract for `SpaceCard`.
  - **ISP**: separate prop types for `HubHomeProps`, `HubSettingsHeaderProps`, `HubAboutTabProps`, `HubSpacesTabProps` — components don't receive props they don't use.
  - **DIP**: presentational components depend on plain TS types and callbacks (abstractions); integration layer depends on Apollo hooks (concrete impls); routing depends on `useCrdEnabled()` abstraction.
  - **DRY**: the per-section save pattern is extracted into a shared `useSectionSave` hook in the integration layer (reusable for any future tab); the `pickColorFromId` fallback comes from `@/crd/lib/pickColorFromId` (shared).

**Result**: No constitution violations. Complexity Tracking section is empty.

## Project Structure

### Documentation (this feature)

```text
specs/102-crd-innovation-hub/
├── plan.md                  # This file
├── research.md              # Phase 0 output
├── data-model.md            # Phase 1 output
├── quickstart.md            # Phase 1 output
├── contracts/               # Phase 1 output (component + GraphQL contracts)
│   ├── crd-components.md
│   └── graphql-operations.md
├── checklists/
│   └── requirements.md      # Spec quality checklist (created during /speckit.specify)
└── spec.md                  # Feature specification
```

### Source Code (repository root)

```text
src/crd/components/innovationHub/                    # NEW — pure CRD presentational layer
├── InnovationHubHome.tsx                            # Public hub home page (banner, info bar, description, spaces grid, footer CTA)
├── InnovationHubSettingsShell.tsx                   # Sticky header (avatar thumbnail + name + tagline) + tab strip + content slot
├── InnovationHubAboutTab.tsx                        # About tab — subdomain, name, tagline, description, tags, banner sections
├── InnovationHubSpacesTab.tsx                       # Spaces tab — table with drag-reorder, Add button, Remove action
├── InnovationHubBanner.tsx                          # Full-width banner header used on the home page (banner image with -64px top offset to tuck under CRD header)
├── HubSettingsHeaderThumbnail.tsx                   # The circular thumbnail (cropped BANNER_WIDE or pickColorFromId fallback) used in the Settings sticky header
└── InlineSectionSave.tsx                            # idle/saving/saved indicator + Save button (reusable across About sections)

src/crd/i18n/innovationHub/                          # NEW — i18n namespace 'crd-innovationHub'
├── innovationHub.en.json                            # Source of truth (English)
├── innovationHub.nl.json                            # Manual + Dutch glossary terms preserved in English
├── innovationHub.es.json
├── innovationHub.bg.json
├── innovationHub.de.json
└── innovationHub.fr.json

src/main/crdPages/innovationHub/                     # NEW — integration layer
├── CrdInnovationHubHomePage.tsx                     # Hub home page: data fetch (by id OR subdomain), maps to CRD props, renders InnovationHubHome
├── CrdInnovationHubSettingsPage.tsx                 # Settings page: privilege guard, data fetch, tab routing, renders InnovationHubSettingsShell
├── routing/
│   ├── CrdHubRoute.tsx                              # /hub/<slug> + /hub/<slug>/settings + /hub/<slug>/settings/<tab>
│   └── useHubAccessGuard.ts                         # Reads `Update` privilege; returns redirect target or null
├── hooks/
│   ├── useInnovationHubHomeData.ts                  # Wraps useInnovationHubByIdQuery / useInnovationHubQuery (subdomain branch)
│   ├── useInnovationHubSettingsData.ts              # Wraps useInnovationHubSettingsQuery
│   ├── useHubAboutTabData.ts                        # Per-section save state machine (status map + dirty map + valuesRef)
│   └── useHubSpacesTabData.ts                       # spaceListFilter add/remove/reorder via useUpdateInnovationHubMutation
├── dataMappers/
│   ├── mapInnovationHubToHomeData.ts                # GraphQL hub → InnovationHubHomeData (props for InnovationHubHome)
│   ├── mapInnovationHubToSettingsData.ts            # GraphQL hub → settings shell + about tab + spaces tab prop shapes
│   └── mapInnovationHubSpaceToTableRow.ts           # InnovationHubSpace fragment → SpacesTableRow prop type
├── dialogs/
│   └── CrdAddSpaceByUrlDialog.tsx                   # CRD port of the MUI AddSpaceByUrlDialog (reuses useResolveSpaceUrl domain hook)
└── __tests__/
    ├── useHubAboutTabData.test.ts                   # Per-section save reducer
    ├── useHubAccessGuard.test.ts                    # Privilege guard logic
    └── dataMappers.test.ts                          # GraphQL → CRD prop mapping

src/main/routing/TopLevelRoutes.tsx                  # MODIFIED — gate /hub/<slug>* on useCrdEnabled (CRD route vs legacy HubRoute)
src/main/topLevelPages/Home/CrdHomePage.tsx          # MODIFIED — when crdEnabled AND hub resolved, render CRD hub home (NOT legacy)
src/core/i18n/config.ts                              # MODIFIED — register 'crd-innovationHub' in crdNamespaceImports + lazy backend
@types/i18next.d.ts                                  # MODIFIED — register the namespace + key types

# UNCHANGED — legacy MUI files remain in place until toggle retirement
src/domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage.tsx
src/domain/innovationHub/InnovationHubsSettings/InnovationHubSettingsPage.tsx
src/domain/innovationHub/InnovationHubsSettings/InnovationHubForm.tsx
src/domain/innovationHub/InnovationHubsSettings/InnovationHubSpacesField.tsx
src/domain/innovationHub/InnovationHubsSettings/InnovationHubProfileLayout.tsx
src/domain/innovationHub/InnovationHubsSettings/AddSpaceByUrlDialog.tsx       # Legacy version kept; CRD has its own port
src/domain/innovationHub/InnovationHubsSettings/useResolveSpaceUrl.ts         # REUSED by CrdAddSpaceByUrlDialog (headless hook — OK to import from integration layer)
src/domain/innovationHub/routing/HubRoute.tsx                                 # Legacy /hub route — kept for designVersion=1
src/main/topLevelPages/Home/HomePage.tsx                                      # Legacy home dispatcher — kept for designVersion=1
```

**Structure Decision**: Three-layer CRD migration pattern, matching the precedent set by every previous CRD spec (042-crd-space-page, 087-crd-space-about-dialog, 096-crd-user-pages, 097-crd-user-settings, 098-crd-templates, 101-crd-auth-pages). The CRD presentational components are co-located by feature (`src/crd/components/innovationHub/`); the integration layer mirrors that name (`src/main/crdPages/innovationHub/`). The route dispatcher diff is intentionally small: gate two route blocks on `useCrdEnabled()` + update the one branch in `CrdHomePage` that currently always falls back to the legacy MUI hub page.

## Complexity Tracking

No constitution violations to justify. This section is intentionally empty.
