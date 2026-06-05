# Implementation Plan: About Dialog Redesign (Prototype → CRD)

**Branch**: `104-about-dialog-redesign` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/104-about-dialog-redesign/spec.md`

## Summary

Re-skin the existing CRD Space About dialog so its visual layout matches the updated prototype (`prototype/src/app/components/space/AboutThisSpaceDialog.tsx`), while preserving every current behavior (apply-to-join, member status, per-section editing with the same settings destinations, community guidelines with read-more, references, host contact, private-space lock, level-aware Why/Who headings).

The change is concentrated in the **CRD presentational layer**: `SpaceAboutView.tsx` (the body) and `SpaceAboutDialog.tsx` (the dialog shell + header). Because both the L0 `/about` route (`CrdSpaceAbout`) and the subspace `/about` route (`CrdSubspaceAbout`) — and the sidebar trigger via `CrdSpaceAboutDialogConnector` — all render these same two components, redesigning them delivers parity to every entry point at once. The integration layer (`CrdSpaceAbout`, `CrdSubspaceAbout`) changes only where the prototype layout needs an additional prop or callback (e.g. a profile/community edit affordance on the space-info panel). No GraphQL, no data-model, and no backend changes.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: shadcn/ui + Tailwind CSS v4 + Radix UI (CRD layer, via `@/crd/primitives/*`); `lucide-react`; `react-i18next`; Apollo Client (generated hooks only, consumed in the integration layer — unchanged)
**Storage**: N/A (frontend SPA). No new client cache fields; reuses the existing `useSpaceAboutDetailsQuery` + `useCommunityGuidelinesQuery` responses already wired into `CrdSpaceAbout`/`CrdSubspaceAbout`.
**Testing**: Vitest + jsdom. Existing `src/crd/i18n/space/space.parity.test.ts` enforces identical key sets across all 6 language files — any new key must be added to all of them.
**Target Platform**: Modern browsers (>90% global support per `caniuse`), main app + standalone CRD preview (`pnpm crd:dev`).
**Project Type**: Web (single-page React app).
**Performance Goals**: No regression; dialog open/scroll stays smooth (60 fps). Both detail queries remain gated by `skip: !open` so nothing fetches until the dialog opens.
**Constraints**: Zero MUI/Emotion in `src/crd/`; props are plain TypeScript (no GraphQL types); event handlers are props; Tailwind + semantic typography tokens only; WCAG 2.1 AA; sticky dialog header with independently-scrolling body.
**Scale/Scope**: 2 CRD presentational files redesigned; up to 2 integration files lightly adjusted; 1 standalone preview page kept building; 6 i18n files updated for any new keys. No new runtime dependencies.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | PASS | Business logic stays in the integration layer (`src/main/crdPages/space|subspace/about`) and domain hooks; CRD components remain purely presentational with plain-TS props. |
| II. React 19 Concurrent UX Discipline | PASS | Pure render; visual-only `useState` (expand/scroll). No manual memoization (React Compiler). Loading states already provided by `CommunityGuidelinesBlock` and gated queries. |
| III. GraphQL Contract Fidelity | PASS | No schema or query changes; existing generated hooks reused. No generated types exported through CRD prop contracts (mapping stays in the integration layer). |
| IV. State & Side-Effect Isolation | PASS | No new global state; navigation/permissions/data come via props/callbacks from the integration layer. CRD components manage only visual toggles. |
| V. Experience Quality & Safeguards | PASS | WCAG 2.1 AA: icon-only buttons get `aria-label`, decorative icons `aria-hidden`, focus-visible rings, sticky/reachable close. All strings via `t()` in `crd-space`. No destructive actions introduced (Rule 9 N/A). |
| Arch. Std 2 (CRD design system) | PASS | New/changed UI lives in `src/crd/`; Tailwind + semantic typography tokens; reuses existing `tooltip`, `scroll-area`, `avatar`, `separator`, `button` primitives (all present). |
| Arch. Std 3 (i18n) | PASS | CRD `crd-space` namespace; new keys added to all 6 language files (manual/AI-assisted, not Crowdin); parity test guards completeness. |
| Arch. Std 5 (no barrel exports) | PASS | Explicit file-path imports only. |
| Arch. Std 6 (SOLID/DRY) | PASS | Single shared view drives all entry points (DRY); section sub-components keep SRP; prototype's host-message novelty deferred to avoid scope creep. |

**Result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/104-about-dialog-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (view-model shapes; no DB)
├── quickstart.md        # Phase 1 output (how to run/verify)
├── contracts/           # Phase 1 output (component prop contracts)
│   └── SpaceAboutView.contract.ts
└── checklists/
    └── requirements.md  # Created by /speckit.specify
```

### Source Code (repository root)

```text
src/crd/components/space/
├── SpaceAboutView.tsx          # PRIMARY redesign — body layout to match prototype
├── SpaceAboutDialog.tsx        # Header (name + tagline) + sticky shell tweaks
└── CommunityGuidelinesBlock.tsx# Reused as the guidelines slot (read-more already present)

src/crd/primitives/             # Reused as-is (no new primitives needed)
├── tooltip.tsx · scroll-area.tsx · avatar.tsx · separator.tsx · button.tsx · dialog.tsx

src/crd/i18n/space/
├── space.en.json               # New tooltip/label keys (source)
├── space.{nl,es,bg,de,fr}.json # Same keys translated (parity test enforces)
└── space.parity.test.ts        # Guards key parity (unchanged)

src/main/crdPages/space/about/
├── CrdSpaceAbout.tsx           # Integration — adjust props/callbacks if layout needs them
├── CrdSpaceAboutPage.tsx       # Route wrapper (unchanged)
└── ../dialogs/CrdSpaceAboutDialogConnector.tsx  # Sidebar trigger (unchanged)

src/main/crdPages/subspace/about/
└── CrdSubspaceAbout.tsx        # Integration — mirror any CrdSpaceAbout prop changes

src/crd/app/pages/
└── SpacePage.tsx               # Standalone preview consumer — keep building with mock data
```

**Structure Decision**: Web SPA, CRD design-system layer. The redesign lives in `src/crd/components/space/`; data wiring stays in `src/main/crdPages/{space,subspace}/about/`. No new directories. The single-shared-view architecture (both routes + sidebar consume `SpaceAboutView`/`SpaceAboutDialog`) is preserved so parity is automatic.

## Complexity Tracking

No constitution violations — section intentionally empty.
</content>
