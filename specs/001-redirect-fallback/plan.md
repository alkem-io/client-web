# Implementation Plan: Redirect Fallback Experience

**Branch**: `001-redirect-fallback` | **Date**: 2025-11-28 | **Spec**: [specs/001-redirect-fallback/spec.md](specs/001-redirect-fallback/spec.md)
**Input**: Feature specification from `/specs/001-redirect-fallback/spec.md`

## Summary

Implement a resilient navigation experience so every deep link guides the user to the closest accessible context. This plan adds a domain-level resolver facade backed by a new backend `resolveResource` operation, persists anonymous intent for post-login redirects, surfaces an unauthorized countdown overlay, and logs analytics for each fallback reason.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19 (Vite SPA)
**Primary Dependencies**: Apollo Client 3, React Router 6.28+, MUI 5 theme system, `react-i18next`
**Storage**: Apollo normalized cache plus `sessionStorage` adapter for ephemeral `returnTo` intents; no new persistent databases
**Testing**: Vitest + React Testing Library for hooks/components, Cypress for login + restricted routing flows, Storybook visual regression for restricted overlay
**Target Platform**: Modern Chromium, Firefox, and Safari browsers (desktop + responsive web)
**Project Type**: Web single-page application (client-only)
**Performance Goals**: 95% of login→destination redirects complete ≤3 s; 99% of unauthorized countdowns finish (auto or manual) ≤12 s; resolver hook resolves within 150 ms median
**Constraints**: Countdown must satisfy WCAG 2.1 AA (ARIA live region, focus trap, keyboard CTA); redirect graph depth capped at 5 ancestors to prevent loops; login `returnTo` expires on logout or 30 min
**Scale/Scope**: Impacts all deep-link entry points (Spaces, Sub-spaces, Callouts, Contributions) ~25k inbound clicks/day

**Outstanding Clarifications (captured for Phase 0, now resolved)**

1. ~~[NEEDS CLARIFICATION: Confirm backend `resolveResource` payload (auth states, fallback chain depth, deletion flag).]~~ → Resolved in Research Decision 1.
2. ~~[NEEDS CLARIFICATION: Determine how login callback accepts & expires a `returnTo` parameter without leaking stale redirects.]~~ → Resolved in Research Decision 2.
3. ~~[NEEDS CLARIFICATION: Align analytics schema for fallback reasons while avoiding sensitive identifiers.]~~ → Resolved in Research Decision 3.

## Constitution Check

- **Domain Alignment**: Create `src/domain/navigation/resourceResolver` exposing `useResolvedRoute` and `useRedirectIntent` hooks. UI shells under `src/main/routes` (login gate, restricted countdown, global redirect notice) remain orchestration-only, consuming typed data + commands from the domain facade.
- **React 19 Concurrency**: Resolver hook runs async fetches inside `useTransition` and exposes suspense-friendly state. Countdown overlay defers timers to `useEffect`, and navigation triggers fire from actions rather than render, keeping concurrency-safe flows. Legacy router guards touched by this work will be updated or documented with mitigations. **Gate: PASS.**
- **GraphQL Contract**: Introduce `ResolveResource` query + fragments in `src/domain/navigation/graphql/resolveResource.graphql`, run `pnpm run codegen`, and review schema diffs with backend #9001 before merge. No raw `useQuery` usage permitted. **Gate: PASS.**
- **State & Effects**: Resolver responses and fallback chains live in Apollo cache; redirect intent uses a small domain context + `sessionStorage` adapter within `src/core/routing`. Countdown timers and analytics events are emitted via effect hooks consuming domain signals, keeping components pure. **Gate: PASS.**
- **Experience Safeguards**: Accessibility (focus trap, ARIA live countdown, SR-friendly copy), performance budgets (≤150 ms resolver, ≤3 s login redirect), telemetry (`navigation.resolve.completed`, `navigation.resolve.fallback`), and automated tests (Vitest + Cypress) are all enumerated for sign-off. **Gate: PASS.**

## Project Structure

### Documentation (this feature)

```text
specs/001-redirect-fallback/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md  # via /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   ├── analytics/
│   └── routing/
├── domain/
│   └── navigation/
│       ├── graphql/resolveResource.graphql
│       ├── hooks/useResolvedRoute.ts
│       └── state/redirectIntent.store.ts
├── main/
│   ├── routes/
│   │   └── RestrictedAccessPage/
│   └── components/GlobalRedirectNotice/
└── shared/
    └── ui/CountdownOverlay/

tests/
├── unit/navigation/
├── integration/routing/
└── e2e/cypress/
```

**Structure Decision**: Single SPA structure. Domain logic is centralized under `src/domain/navigation`, shared routing/services stay under `src/core`, and UI orchestration plus surfaces (restricted page, global notice) live under `src/main`. Dedicated test folders mirror each layer (unit, integration, e2e) to satisfy constitution coverage expectations.

## Complexity Tracking

No constitution exceptions required; table intentionally left empty.
