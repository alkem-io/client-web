<!--
Sync Impact Report
Version change: 1.0.4 → 1.0.5 (expanded DRY to SOLID principles)
Modified principles: (none)
Modified sections: Architecture Standards #6
Added sections: Architecture Standards #6 (SOLID principles)
Removed sections: (none)
Templates requiring updates: (none)
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
   localization pipeline; hard-coded copy is forbidden. Only the English source file
   (`src/core/i18n/en/translation.en.json`) MAY be edited directly. All other locale files are
   generated downstream and MUST remain untouched in this repository.
4. Build artifacts remain deterministic: Vite config changes require documenting their impact on
   chunking, env exposure, and React Server Component compatibility.
5. Import transparency requires explicit module paths. Barrel exports via `index.ts` files are
   forbidden to maintain import traceability and prevent circular dependency issues. All imports
   MUST specify the direct file path to the exported module.
6. SOLID Principles & Code Quality: All code MUST adhere to SOLID design principles to ensure
   maintainability, testability, and extensibility:

   **a) Single Responsibility Principle (SRP)**: Each component, hook, or function MUST have one
   clear reason to change. Extract multi-purpose components into focused, composable units. Domain
   logic, UI presentation, and data fetching belong in separate modules. Example: Split a component
   that both fetches data and renders complex UI into a custom hook for data and a presentation
   component for UI.

   **b) Open/Closed Principle (OCP)**: Code MUST be open for extension but closed for modification.
   Use composition, hooks, and render props to extend behavior without altering existing code.
   Prefer configuration over conditionals. Example: Create configurable components via props rather
   than hardcoding variants; use strategy patterns via function props.

   **c) Liskov Substitution Principle (LSP)**: Derived components or implementations MUST be
   substitutable for their base types without breaking functionality. Props interfaces MUST honor
   contracts; overrides cannot violate parent expectations. Example: If a base component expects
   `onSubmit` to be async, all implementations must respect that contract.

   **d) Interface Segregation Principle (ISP)**: Components and hooks MUST NOT be forced to depend
   on props or parameters they don't use. Split large prop interfaces into focused subsets. Use
   TypeScript discriminated unions for variant-specific props. Example: Instead of one large
   `ButtonProps` with optional icon/loading/onClick, create `IconButton`, `LoadingButton`,
   `ActionButton` with specific, minimal interfaces.

   **e) Dependency Inversion Principle (DIP)**: High-level modules (UI components) MUST depend on
   abstractions (hooks, context), not concrete implementations (direct GraphQL queries). Domain
   hooks provide abstractions; components consume them. Example: Components use
   `useSpaceGuestContributions()` hook abstraction instead of directly calling
   `useSpaceSettingsQuery()`.

   **f) DRY (Don't Repeat Yourself)**: Repetitive logic, constants, or derived values MUST be
   extracted into shared utilities, hooks, or constants. Examples include boolean derivations
   (e.g., `isSubspace = level !== SpaceLevel.L0`), repeated calculations, or duplicated
   conditionals across components. When the same logic appears in multiple components within a
   feature domain, create a shared hook or helper in `src/domain/<context>/utils` or
   `src/core/utils`. For UI patterns, extract into reusable components in `src/core/ui`.

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

**Version**: 1.0.5 | **Ratified**: 2025-10-30 | **Last Amended**: 2025-11-04
