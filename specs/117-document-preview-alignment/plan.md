# Implementation Plan: Document Preview Alignment

**Branch**: `story/9872-file-thumbnail-preview` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/117-document-preview-alignment/spec.md`

## Summary

Align document contribution previews with the existing whiteboard and memo contribution patterns on two surfaces: (1) include document contributions in the overlay "+N more" card pattern in the contributions grid, and (2) add an optional `previewUrl` image branch to `ContributionDocumentCard` so it matches `ContributionWhiteboardCard`'s image-or-icon rendering. No backend changes, no new dependencies, no new i18n keys.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled)
**Primary Dependencies**: CRD layer (`@/crd/*`), `lucide-react` (existing icons), `react-i18next` (existing `crd-space` namespace)
**Storage**: N/A (frontend SPA, no persisted storage changes)
**Testing**: Vitest with jsdom, `@testing-library/react`
**Target Platform**: Browser (SPA)
**Project Type**: Single-repo frontend
**Performance Goals**: No new network requests, no bundle size increase beyond the test file
**Constraints**: No new runtime dependencies (FR-008), no GraphQL changes (FR-008), no new i18n keys (R4)
**Scale/Scope**: 3 files modified, 1 file created (test)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | PASS | Changes are in CRD (presentational) and integration layer (connector) — no domain boundary crossed |
| II. React 19 Concurrent UX Discipline | PASS | Pure rendering, no async state, no effects — concurrency-safe by construction |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes; no new queries or schema modifications |
| IV. State & Side-Effect Isolation | PASS | Only visual `useState` (error tracking for image fallback) — allowed per CRD rules |
| V. Experience Quality & Safeguards | PASS | Existing a11y patterns preserved; new test coverage added |
| Arch 1. Feature directory taxonomy | PASS | CRD component in `src/crd/components/contribution/`, connector in `src/main/crdPages/` |
| Arch 2. CRD-only design system | PASS | All changes in CRD + crdPages integration layer; no MUI |
| Arch 3. CRD i18n | PASS | No new i18n keys — all strings reused from existing namespace |
| Arch 5. No barrel exports | PASS | All imports use explicit file paths |
| Arch 6. SOLID / DRY | PASS | Shared `collaboraDocumentPreview.ts` module reused (DRY); image-or-icon pattern from `ContributionWhiteboardCard` (OCP) |

**Post-design re-check**: All gates still PASS. No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/117-document-preview-alignment/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── contribution-document-card.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (affected files)

```text
src/
├── crd/
│   ├── components/
│   │   └── contribution/
│   │       ├── ContributionDocumentCard.tsx        # MODIFY: add previewUrl prop + image branch
│   │       └── ContributionDocumentCard.test.tsx   # CREATE: unit tests for image/fallback
│   └── lib/
│       └── collaboraDocumentPreview.ts             # READ-ONLY: reuse iconByType, colorByType
└── main/
    └── crdPages/
        └── space/
            └── callout/
                └── ContributionsPreviewConnector.tsx  # MODIFY: overlay pattern + OverlayMoreCard branch
```

**Structure Decision**: Single-repo frontend SPA. All changes in `src/crd/` (presentational) and `src/main/crdPages/` (integration glue).

## Design Decisions

### D1: Overlay Pattern Inclusion

Add `CalloutContributionType.CollaboraDocument` to the `usesOverlayPattern` check in `ContributionsPreviewConnector`. This is a one-condition boolean extension, not a new abstraction.

### D2: OverlayMoreCard Document Branch

Add a third content branch to `OverlayMoreCard`:
- `showDocumentIcon`: when `contributionType === CollaboraDocument`, render the type icon centered with accent color
- Import `iconByType`, `colorByType` from the shared `collaboraDocumentPreview.ts` module
- Use `lastContribution.documentType ?? 'text'` for fallback (same pattern as the existing `ContributionCard` switch)

### D3: ContributionDocumentCard Image Branch

Mirror `ContributionWhiteboardCard`'s structure:
- Add `previewUrl?: string` to props
- Image branch: `<img>` with `object-cover`, `transition-transform duration-500 group-hover/doc:scale-105`
- Icon branch: unchanged (existing type-icon treatment)
- Error fallback: `useState<string | undefined>` tracking errored URL (same as `CalloutCollaboraPreview`)

### D4: No Mapper Changes

`contributionDataMapper.ts`'s `collaboraDocument` branch does not populate `previewUrl` today — the `ContributionCardData.previewUrl` field already exists, and the card receives `undefined`. When a backend visual field ships, only the mapper needs a one-line change.

## Complexity Tracking

No constitution violations to justify. All changes are minimal, pattern-following modifications.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Image error fallback not triggering correctly | Low | Low | Unit test covers `onError` → icon fallback |
| OverlayMoreCard layout regression | Low | Medium | Existing whiteboard/memo overlay tests serve as regression baseline |
| ContributionDocumentCard visual regression | Low | Medium | Before/after test comparison in ContributionDocumentCard.test.tsx |

## Implementation Approach

Two parallel tracks (can be implemented independently and committed separately):

1. **Track A (P1)**: `ContributionsPreviewConnector.tsx` — overlay pattern + OverlayMoreCard document branch
2. **Track B (P2)**: `ContributionDocumentCard.tsx` + test file — image branch + fallback

Both tracks are independent (Track A uses the existing card as-is; Track B modifies the card but the connector doesn't need to pass `previewUrl` since it's always `undefined` today). They can be committed in either order.

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/117-document-preview-alignment/plan.md`.
