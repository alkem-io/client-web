# Implementation Plan: Show publisher (not creator) on callout meta

**Branch**: `094-callout-publisher-meta` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/094-callout-publisher-meta/spec.md`

## Summary

Switch the author + date metadata that appears on callout surfaces — the MUI callout-dialog header (`CalloutHeader`), the three CRD presentation paths produced by `calloutDataMapper.ts` (`PostCard`, `CalloutDetailDialog`), and the CRD callout search-result mapping in `searchDataMapper.ts` — from `(createdBy, publishedDate)` (or `Unknown` / empty in search) to `(publishedBy ?? createdBy, publishedDate ?? createdDate)`. The two fields fall back independently per the Q1 clarification. Backend already exposes `publishedBy` and `publishedDate` on the `Callout` type, so the data-layer changes are: (a) extend the existing Callout fragment in `CalloutsSetQueries.graphql` to query `publishedBy` and `createdDate`, (b) extend the `SearchResultCallout` fragment in `SearchQueries.graphql` to query the same four fields (none are currently selected for search), (c) propagate the two new fields through the `CalloutModelExtension` view model and the `useCalloutDetails` hook, then (d) update the five presentation call sites (one MUI, three CRD mappers, one CRD search mapper). No visual change. Out of scope: post/whiteboard/memo contribution cards (no `publishedBy` in schema), comments/calendar/messages (different domain).

## Technical Context

**Language/Version**: TypeScript 5.x · React 19 (with React Compiler) · Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: Apollo Client (existing — unchanged), MUI 5 + Emotion (legacy UI surface), shadcn/ui + Tailwind v4 (CRD surface), `react-i18next` (existing)
**Storage**: N/A — presentation + GraphQL fragment extension; no client-side persistence and no backend schema change (`publishedBy` / `publishedDate` already exist on `Callout`)
**Testing**: Vitest (jsdom). No targeted unit tests exist for the affected components/mappers; the suite must remain green
**Target Platform**: Vite-built single-page web app served from `localhost:3001` against the Alkemio backend at `localhost:3000` (dev) / production deployment (prod)
**Project Type**: Web application (single React frontend, no in-repo backend)
**Performance Goals**: N/A — adding two scalar/object fields to one Apollo fragment; payload increment is one extra `User` selection per cached `Callout` and one DateTime scalar
**Constraints**: FR-005 — visual presentation must not change (avatar / name / separator / formatted date layout preserved); FR-004 — both UIs must behave identically
**Scale/Scope**: 7 source files touched (2 GraphQL fragments, 1 model, 1 hook, 1 MUI component, 1 CRD mapper with three call sites, 1 CRD search mapper with one call site, plus regenerated Apollo files). No new dependencies, no new components, no new translation keys.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Evidence |
|-----------|---------|----------|
| I. Domain-Driven Frontend Boundaries | **Pass** | All data-shape changes live in `src/domain/collaboration/callout/` (model + hook) and `src/domain/collaboration/calloutsSet/` (GraphQL fragment). UI shells in `src/main/crdPages/space/dataMappers/` and `src/domain/.../calloutBlock/` consume the updated façade. No new ad-hoc state shape, no business rule introduced in components. |
| II. React 19 Concurrent UX Discipline | **Pass** | Pure presentational change: no new effects, no `useTransition`, no Suspense changes. Existing components are untouched apart from the prop expressions. |
| III. GraphQL Contract Fidelity | **Pass** | Extending an existing fragment with fields already present on the schema. `pnpm codegen` will be run in the same PR; generated outputs committed. No raw `useQuery` introduced; component prop types remain explicit (the `Authorship` component takes a structural author shape, not a generated GraphQL type). |
| IV. State & Side-Effect Isolation | **Pass** | No new effects, no DOM manipulation, no new context. Apollo cache shape gains two fields on the Callout entity — both keyed by the same normalized ID, so cache integrity is preserved. |
| V. Experience Quality & Safeguards | **Pass** | Accessibility unchanged: same `<Authorship>` markup with the same `aria-label` (avatar of `<displayName>`). Performance impact negligible. No tests existed for the affected mappers; this plan does not add tests because the existing suite covers the type-level contract via `pnpm lint`, and the user-facing change is verifiable via the browser scenarios in [quickstart.md](./quickstart.md). |

**Result**: All gates pass. No `Complexity Tracking` entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/094-callout-publisher-meta/
├── plan.md              # This file
├── spec.md              # Feature specification (with Clarifications)
├── research.md          # Phase 0 output — technical decisions
├── data-model.md        # Phase 1 output — Callout entity + view-model deltas
├── quickstart.md        # Phase 1 output — dev/verification steps
├── contracts/
│   └── callout-fragment.graphql  # Phase 1 — fragment delta
└── checklists/
    └── requirements.md  # Spec quality checklist (already passing)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   │   └── generated/                                  # regenerated by `pnpm codegen`
│   ├── ui/
│   │   └── authorship/Authorship.tsx                   # unchanged consumer of new fields
│   └── i18n/                                           # untouched
├── domain/
│   └── collaboration/
│       ├── callout/
│       │   ├── calloutBlock/CalloutHeader.tsx          # MUI callout-dialog header binding switch (FR-001..004)
│       │   ├── models/CalloutModelLight.ts             # extend CalloutModelExtension
│       │   └── useCalloutDetails/useCalloutDetails.ts  # propagate publishedBy + createdDate
│       └── calloutsSet/
│           └── useCalloutsSet/CalloutsSetQueries.graphql  # extend Callout fragment
└── main/
    ├── search/
    │   └── SearchQueries.graphql                       # extend SearchResultCallout fragment
    └── crdPages/
        ├── space/
        │   └── dataMappers/
        │       └── calloutDataMapper.ts                # CRD binding switch (3 call sites)
        └── search/
            └── searchDataMapper.ts                     # CRD search-result binding switch (1 call site, replaces Unknown/empty)
```

**Structure Decision**: Single-project web app. Domain-driven layout already defined by `CLAUDE.md`. Changes follow the established "domain owns data shape, `src/main/crdPages` owns the GraphQL → CRD prop mapping, `src/core/ui` and `src/crd/components` are dumb presentation" boundary. The only domain-layer additions are two fields on an existing model and a fragment; no new files are introduced.

## Complexity Tracking

> *Not applicable* — Constitution Check passes without violations.
