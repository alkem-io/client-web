# Implementation Plan: Tag Cloud Filter for Knowledge Base

**Branch**: `002-tag-cloud-filter` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-tag-cloud/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Introduce a tag cloud and result-summary filter experience on the knowledge base tab of space-level layouts. We will extend the callouts data query to surface callout-assigned tags, provide a domain-level façade to compute tag frequencies and selection state, render a two-row responsive chip cloud above the callouts list, and apply client-side filtering plus a "X results – clear filter" summary row that keeps CalloutsView orchestration-only.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (Vite, Node 20.15.1 via Volta)
**Primary Dependencies**: Apollo Client (GraphQL), React Router, MUI + Emotion, lodash utilities
**Storage**: Remote GraphQL API via Apollo (no local persistence changes)
**Testing**: Vitest with @testing-library/react; Storybook visual checks available but optional
**Target Platform**: Web SPA served by Vite (desktop + mobile browsers, WCAG 2.1 AA)
**Project Type**: React single-page application (domain-driven frontend)
**Performance Goals**: Tag cloud render ≤200 ms, filter interaction ≤300 ms, count updates ≤150 ms, maintain existing callout load times
**Constraints**: Two-row chip layout, React 19 concurrent safety (useTransition for filter state), avoid blocking Apollo cache updates, keep generated GraphQL fragments deterministic
**Scale/Scope**: Spaces with 100+ callouts (multiple flow-state tabs), support nested space hierarchy but feature applies only to level 0

## Constitution Check

- **Domain Alignment**: Tag aggregation and filtering logic will live in a new façade under `src/domain/collaboration/calloutsSet` (e.g., `useCalloutTagCloud.ts`) reusing `useCalloutsSet`. React surfaces (`FlowStateTabPage` and eventual tag cloud component under `src/domain/space/layout/tabbedLayout/Tabs`) will orchestrate domain hooks without embedding business rules. No changes required in `src/main` beyond wiring existing shells.
- **React 19 Concurrency**: Filtering transitions will use `useTransition` to keep CalloutsView rendering non-blocking. Existing Suspense boundary for `CalloutsGroupView` remains intact; we will document any legacy blocking patterns and ensure new components are pure, deriving filtered lists via memoization.
- **GraphQL Contract**: We will extend `CalloutsOnCalloutsSetUsingClassification` (and related fragments) to include `framing.profile.tagset { tags { name displayName } }`. This requires regenerating types via `pnpm run codegen` and reviewing the generated diff. No schema changes expected server-side; client fragments only.
- **State & Effects**: Tag selection state will be managed within the new domain hook using React state + Apollo-derived data. Filtering operates on in-memory callout arrays; Apollo cache remains source of truth. No direct DOM effects; side effects limited to transitional state updates.
- **Experience Safeguards**: All chips will be keyboard focusable, expose ARIA pressed state, and respect theme contrast. We will add Vitest unit tests for tag extraction/filtering, and integration tests for UI behavior via @testing-library/react. Performance checks will assert memoization and transition usage. Observability: ensure existing analytics hooks (if any) remain untouched; surfaces will emit accessible text for counts.

## Project Structure

### Documentation (this feature)

```text
specs/002-tag-cloud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   ├── routing/
│   └── ui/
├── domain/
│   ├── collaboration/
│   │   ├── callout/
│   │   │   └── calloutsList/
│   │   └── calloutsSet/
│   │       ├── CalloutsInContext/
│   │       └── useCalloutsSet/
│   └── space/
│       ├── layout/
│       │   ├── tabbedLayout/
│       │   │   ├── Tabs/
│       │   │   │   └── FlowStateTabPage/
│       │   │   └── layout/
│       └── context/
└── main/
    └── routing/

tests/
└── unit/ (Vitest colocated with sources under __tests__ where needed)
```

**Structure Decision**: Single React SPA; work stays within existing domain slices (`src/domain/collaboration` and `src/domain/space`). No new top-level packages required; tests colocate beside implementations.

## Complexity Tracking

No constitution violations expected; table not required.
