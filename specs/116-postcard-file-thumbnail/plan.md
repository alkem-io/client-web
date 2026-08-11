# Implementation Plan: Render File Thumbnail / Preview in Post Cards

**Branch**: `story/9872-render-file-thumbnail-preview-in-post-cards` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/116-postcard-file-thumbnail/spec.md`
**Story**: alkem-io/client-web#9872

## Summary

Close the outstanding #9575 acceptance criterion: OfficeDocs (Docs/Sheets/Slides) Post
cards currently show a flat, undifferentiated "empty memo"-style icon box instead of a
recognizable preview. Both consumers — the Post card feed (`PostCard`, `size="compact"`)
and the post/callout detail dialog (`CollaboraFramingConnector`, `size="default"`) —
delegate to one shared component, `CalloutCollaboraPreview`. This plan enhances that
single component: (1) a type-differentiated icon color per document kind (blue/green/
orange for Wordprocessing/Spreadsheet/Presentation, applied to both the centered
fallback icon and the existing top-right badge icon), and (2) a forward-compatible
`previewImageUrl` prop that renders a real image in place of the icon treatment the
moment one is supplied, with graceful onError fallback — mirroring the exact
image-else-icon pattern `PostCard` already uses for whiteboards. `PostCardData` gains a
matching optional `framingDocumentPreviewUrl` field, threaded from `calloutDataMapper.ts`
exactly like the existing `framingImageUrl` (whiteboard) mechanism; it is `undefined`
today because no backend field yet exists to populate it (confirmed: `VisualType` has no
document-preview equivalent to `WHITEBOARD_PREVIEW`). No GraphQL, schema, or new
dependency is introduced.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: CRD layer (`@/crd/primitives/*`, `@/crd/lib/utils` `cn()`), `lucide-react` (existing `FileText`/`Sheet`/`Presentation`/`RefreshCw` icons, no new icon import), `react-i18next` (existing `crd-space` namespace, no new keys — see Research R4). All existing — **no new runtime dependencies**.
**Storage**: N/A (frontend SPA, presentational-only change). No GraphQL query changes.
**Testing**: Vitest + @testing-library/react (jsdom). `pnpm vitest run` (non-interactive), `pnpm lint` (TypeScript + Biome + ESLint).
**Target Platform**: Modern evergreen browsers (>90% global support per `caniuse.com`, per CLAUDE.md).
**Project Type**: Web frontend (single SPA). CRD-only for new UI.
**Performance Goals**: N/A — no new data fetch; the only new work is a conditional icon-color class and an optional `<img>` render inside an already fixed-geometry box (no layout shift).
**Constraints**: CRD-only rule — the changed component lives in `src/crd/components/callout/` (presentational, props-only); zero `@mui/*`/`@emotion/*`; no new GraphQL fields/schema change (spec FR-010); accent colors from existing Tailwind tokens only (no new hex literals).
**Scale/Scope**: One presentational component edit (`CalloutCollaboraPreview.tsx` + new test), one data-mapper edit (`calloutDataMapper.ts`) + one prop-type edit (`PostCard.tsx`'s `PostCardData`), one new mapper test file. No route, GraphQL, or dependency changes. ~5 files touched/created.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against `.specify/memory/constitution.md` (v1.1.0) and CLAUDE.md / `src/crd/CLAUDE.md`:

- **I. Domain-Driven Frontend Boundaries** — PASS. No business rules added to the component; the type→visual mapping is pure presentation data, not domain logic. Data mapping (`framingDocumentPreviewUrl` derivation) stays in `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`, the existing integration layer — never inside `src/crd/`.
- **II. React 19 Concurrent UX Discipline** — PASS. Pure rendering; the one new `useState` (`imageErrored`) is visual-only (image-load-failure UI state), not memoized manually, and does not block paint.
- **III. GraphQL Contract Fidelity** — PASS/N/A. No GraphQL query or schema change (FR-010); `previewImageUrl`/`framingDocumentPreviewUrl` are plain `string | undefined`, never a generated GraphQL type, consistent with the existing `framingImageUrl` precedent.
- **IV. State & Side-Effect Isolation** — PASS. The only new state is the local, visual-only `imageErrored` flag inside the presentational component (mirrors the existing `isCommentsOpen`-style local UI state already present in `PostCard`); no new side effects, no direct DOM/browser API usage.
- **Architecture Standards #2 (MUI frozen, CRD-only for new features)** — PASS. Zero `@mui/*`/`@emotion/*` touched; the only edited/created files are under `src/crd/components/callout/` and `src/main/crdPages/space/dataMappers/`.
- **Architecture Standards #3 (new strings in CRD per-feature namespaces)** — PASS/N/A. No new i18n keys: the (future) preview image's alt text reuses the *existing* `typeLabel` string (`callout.document`/`documentSpreadsheet`/`documentPresentation`, already in `crd-space`, all six locales) rather than adding new keys — see Research R4.
- **`src/crd/CLAUDE.md` Golden Rules** — PASS. No MUI; no business logic (`onError`/`useState` are visual-only); props are plain TypeScript; styling is Tailwind-only (`text-blue-600`/`text-green-600`/`text-orange-600`, no inline `style`); icons stay `lucide-react`; no barrel exports; event handlers (`onOpen`, `onReplace`) remain consumer-supplied props, unchanged.
- **Accessibility (WCAG 2.1 AA)** — PASS. Decorative centered icon stays `aria-hidden="true"` (redundant with the accessible badge label, per Clarifications); the (future) preview `<img>` gets non-empty, localized `alt` text (reusing `typeLabel`); the `-600` Tailwind shades clear the 3:1 non-text-contrast bar against `bg-muted`/`bg-muted/30` (see Clarifications session 2026-08-06).
- **SOLID / DRY (Architecture Standards #6f)** — PASS. The type→`{icon, color}` mapping is defined exactly once inside `CalloutCollaboraPreview` and consumed by both existing call sites (badge, centered fallback) and both existing size variants (compact/default) — no duplicated conditionals (FR-002).
- **Testing gate** — PASS. New unit coverage on `CalloutCollaboraPreview` (per-type icon/color × all 4 `CollaboraDocumentType` values via the existing `mapCollaboraDocumentTypeToPreviewType`, image-present vs image-absent, image-load-failure fallback) and a new `calloutDataMapper.test.ts` covering the new field threading; `pnpm lint` + `pnpm vitest run` are the exit gates.

**Result: PASS, no violations.** Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/116-postcard-file-thumbnail/
├── plan.md                          # This file
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/
│   └── CalloutCollaboraPreview.md   # Phase 1 output (component contract)
├── checklists/
│   └── requirements.md              # from /speckit-specify
└── tasks.md                         # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/crd/components/callout/
├── CalloutCollaboraPreview.tsx       # EDIT — type→{icon,color} map, previewImageUrl prop, image-else-icon fallback, onError→icon
└── CalloutCollaboraPreview.test.tsx  # NEW — unit tests (per-type color, image present/absent/error, size variants)

src/main/crdPages/space/dataMappers/
├── calloutDataMapper.ts              # EDIT — PostCardData.framingDocumentPreviewUrl threading (mirrors framingImageUrl)
└── calloutDataMapper.test.ts         # NEW — unit test for mapCalloutDetailsToPostCard's new field (+ existing framingDocumentType threading, for regression safety)

src/crd/components/space/
└── PostCard.tsx                      # EDIT — PostCardData.framingDocumentPreviewUrl field + pass-through to CalloutCollaboraPreview
```

No changes to `src/main/crdPages/space/callout/CollaboraFramingConnector.tsx` (the dialog
connector): it already renders through the same `CalloutCollaboraPreview`, so the P1/P2
icon-color treatment applies to the dialog automatically with zero connector changes. The
P3 `previewImageUrl` seam is wired only where a concrete typed carrier exists today
(`PostCardData`, feeding `PostCard`); extending it to the dialog is a documented,
one-line follow-up once a real backend field exists (see data-model.md) — adding a
permanently-`undefined` prop pass-through today would be speculative dead code.

No changes to `src/core/apollo/generated/*`, `*.graphql` files, `codegen.yml`, or any
`package.json` dependency.

**Structure Decision**: Web frontend SPA, CRD-only, presentational-component-scoped
change. All logic lives in the single shared `CalloutCollaboraPreview` (presentational,
`src/crd/`) plus its one upstream data source (`calloutDataMapper.ts`, integration layer,
`src/main/crdPages/`) — mirroring the exact split already established by the whiteboard
`framingImageUrl` precedent it is modeled on. No new files outside these two areas.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
