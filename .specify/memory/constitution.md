<!--
Sync Impact Report
Version change: 1.0.1 → 1.0.2 (aligned templates + clarified principles)
Modified principles: I, II, III, IV, V
Modified sections: Architecture Standards #1, Engineering Workflow #2
Added sections: (none)
Removed sections: (none)
Templates requiring updates:
 - .specify/templates/plan-template.md (Constitution Check gates) ✅
 - .specify/templates/spec-template.md (story guidance alignment) ✅
 - .specify/templates/tasks-template.md (task structuring guidance) ✅
Deferred TODOs: None
-->

# Alkemio Client Web Engineering Constitution

This constitution governs the Alkemio Client Web project. It translates our domain-driven
contract with the Alkemio platform into enforceable frontend engineering guardrails for React 19.

## Core Principles

### I. Domain-Driven Frontend Boundaries

UI experiences MUST align with explicit domain contexts. Business rules, entity transformations,
and invariants belong in `src/domain` (domain logic) or `src/core` (cross-cutting services), never
inside React components. Components and hooks MAY orchestrate domain services, but they MUST NOT
create ad-hoc state shape or bypass domain rules. New capabilities require a façade in
`src/domain/<context>` that exposes typed hooks/selectors consumed by UI shells under `src/main`.

**Rationale**: Keeps the client consistent with the server’s domain model, enabling reuse of domain
language, predictable testing, and safe evolution of business logic.

### II. React 19 Concurrent UX Discipline

All new components MUST treat rendering as pure and concurrency-safe. Long-running mutations or data
fetches use React 19 primitives (`useTransition`, `useOptimistic`, Actions) or Suspense boundaries to
avoid blocking paint. Existing legacy components MAY defer refactors but MUST document concurrency
risks in planning artifacts. Fallback UI states MUST be explicit and accessible. Server data access
MUST prefer React Server Components when introduced; client components MAY wrap them only for
interactivity. Deprecated legacy lifecycle patterns (e.g., `componentWillMount`, ad-hoc async in
render) are forbidden when touching related code.

**Rationale**: React 19 schedules rendering concurrently; respecting purity ensures predictable UX,
smooth transitions, and compatibility with Server Components.

### III. GraphQL Contract Fidelity

The GraphQL schema in `src/core/apollo/generated/graphql-schema.ts` is the external contract.
Client code MUST use generated hooks from `src/core/apollo/generated/apollo-hooks.ts`; raw
`useQuery` or unchecked responses are prohibited. Schema-breaking changes REQUIRE regeneration via
`pnpm run codegen` in the same PR and a reviewed schema diff. Cache updates MUST respect normalized
IDs and shared fragments to avoid divergent domain shapes. Component prop types MUST be explicitly
declared—do not export generated GraphQL types directly through UI contracts.

**Rationale**: Enforces alignment with the platform API and safeguards typed data flows across the
DDD boundary.

### IV. State & Side-Effect Isolation

Persistent state lives in Apollo caches or React context modules that reside under `src/core` or
`src/domain`. Components MUST remain side-effect free except for React hooks dedicated to effects.
Cross-cutting concerns (telemetry, feature flags, routing) funnel through shared adapters in
`src/core` to keep features deterministic. Any direct DOM manipulation or browser API usage requires
justification and wrappers to preserve testability.

**Rationale**: Isolating effects prevents React concurrency regressions and anchors observability and
testing to well-defined modules.

### V. Experience Quality & Safeguards

Accessibility criteria (WCAG 2.1 AA) MUST be met for every interactive element—semantic HTML,
keyboard navigation, and ARIA where needed. Performance regressions demand an optimization plan
before release. Tests covering non-trivial logic and structured observability for high-risk
interactions are mandatory evidence in the PR description.

**Rationale**: Product reliability and inclusivity depend on measurable quality gates; these
safeguards ensure sustainable delivery.

## Architecture Standards

1. Feature directories map to domain contexts: `src/domain/<context>` for domain orchestrators,
   `src/main/<feature>` for routed UI shells that stitch domain façades into navigable experiences,
   `src/core` for shared infrastructure, and `src/core/apollo` for data access. The `src/main`
   surface owns routing composition, layout shells, and entry points for feature toggles; it MUST
   remain thin, delegating domain logic back into `src/domain` or `src/core`. New directories require
   alignment with this taxonomy.
2. Styling standardizes on MUI theming. Any addition to the design system must pass through
   `src/core/ui` with tokens documented in the theme.
3. Internationalization uses `react-i18next`. All user-visible strings MUST be declared via the
   localization pipeline; hard-coded copy is forbidden.
4. Build artifacts remain deterministic: Vite config changes require documenting their impact on
   chunking, env exposure, and React Server Component compatibility.

## Engineering Workflow

1. Planning MUST document affected domain contexts, React 19 features involved, and GraphQL
   operations touched. The Constitution Check in plans MUST confirm no principle violations or list
   explicit mitigations.
2. Every PR MUST run `pnpm run codegen`, commit generated artifacts, and provide a schema diff
   summary whenever the API schema changes.
3. Feature work progresses domain-first: define or adjust domain façade → update GraphQL fragments →
   implement UI. Skip steps only with documented exceptions approved during review.
4. Accessibility, performance, and testing artifacts MUST be included in the PR description with
   evidence (e.g., screenshots, Lighthouse numbers, Jest results). Missing evidence blocks merge.

## Governance

This constitution supersedes other frontend guidelines. Amendments require a PR describing impacted
principles, rationale, expected risks, and proposed version bump.

Semantic versioning applies as follows:

- MAJOR: Removing/redefining a principle or governance rule.
- MINOR: Adding a new principle or architecture standard, or materially expanding guidance.
- PATCH: Clarifications or editorial updates that do not alter expectations.

Compliance expectations:

- Plan and spec templates MUST document Constitution Check outcomes. Unresolved violations require a
  mitigation task before implementation begins.
- Code reviews MUST reference relevant principles; reviewers block merges when evidence is missing or
  violations remain unmitigated.
- CI workflows SHOULD enforce linting, testing, and type generation steps aligned with these rules.

**Version**: 1.0.2 | **Ratified**: 2025-10-30 | **Last Amended**: 2025-10-30
