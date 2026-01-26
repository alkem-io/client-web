# Implementation Plan: Default Post Template for Flow Steps

**Branch**: `009-flow-post-template` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-flow-post-template/spec.md`

## Summary

The admin flow has been fully implemented, allowing admins to configure default post templates for innovation flow steps. The remaining work focuses on the member-facing experience: when a member clicks "Add Post" in a flow step with a configured template, the post creation dialog should automatically pre-fill with the template's content.

**Technical Approach**: Create a new hook `useFlowStateDefaultTemplate` that queries the template content for a given template ID, then pass this template data through the component hierarchy from `CalloutPage` → `CalloutView` → `ContributionsCardsExpandable` → `CreateContributionButtonPost` → `PostCreationDialog`. The template's `contributionDefaults.postDescription` will be used as the `defaultDescription` prop.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19
**Primary Dependencies**: Apollo Client 3.x, MUI 5.x, React Router 6.x, GraphQL Code Generator
**Storage**: GraphQL API (backend handles persistence)
**Testing**: Vitest with jsdom, manual testing via dev server
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application (React SPA)
**Performance Goals**: Template content loading <500ms, no UI blocking during template fetch
**Constraints**: Must use generated GraphQL hooks, maintain React 19 concurrent rendering compatibility, follow domain-driven architecture
**Scale/Scope**: Low-medium complexity feature affecting 5-7 files, single data flow path

## Constitution Check

### Analysis Against Alkemio Client Web Constitution v1.0.5

**Status**: ✅ PASSES with minor considerations

#### Principle I: Domain-Driven Frontend Boundaries ✓

- **Compliance**: The new `useFlowStateDefaultTemplate` hook will reside in `src/domain/collaboration/InnovationFlow/hooks/` as a domain façade, properly separating template fetching logic from UI components.
- **Rationale**: Template loading is domain logic that belongs in the collaboration domain, not in presentation components.

#### Principle II: React 19 Concurrent UX Discipline ✓

- **Compliance**: Template fetching will use Apollo's `useQuery` which is Suspense-compatible. Loading states will be explicit via the hook's `loading` return value.
- **Consideration**: Template loading is non-blocking - the dialog opens immediately with a loading state, then populates when data arrives. This maintains concurrent rendering safety.

#### Principle III: GraphQL Contract Fidelity ✓

- **Compliance**: Will use generated `TemplateContentQuery` hook from `apollo-hooks.ts`. Template content is already available in the GraphQL schema via the `InnovationFlowStates` fragment which includes `defaultCalloutTemplate.id`.
- **Action Required**: Run `pnpm codegen` after creating the new GraphQL query document for template content retrieval.

#### Principle IV: State & Side-Effect Isolation ✓

- **Compliance**: Template data flows via props through the component tree. No new global state or side effects. Apollo cache handles data persistence.
- **Pattern**: Pure data flow from domain hook → container → presentation component.

#### Principle V: Experience Quality & Safeguards ✓

- **Compliance**: Template pre-filling is a progressive enhancement - if template loading fails or is slow, users see an empty form (existing behavior). No accessibility regressions.
- **Consideration**: Dialog remains keyboard-navigable, screen-reader accessible. Template content is markdown which is already handled by existing form components.

#### Architecture Standards Compliance

**Standard 1 - Directory Mapping**: ✓

- New hook in `src/domain/collaboration/InnovationFlow/hooks/`
- GraphQL query in `src/domain/collaboration/InnovationFlow/graphql/`
- No new directories required

**Standard 2 - Styling**: ✓ (No new UI components)

**Standard 3 - i18n**: ✓ (No new user-facing strings needed for data flow)

**Standard 4 - Build**: ✓ (GraphQL codegen only)

**Standard 5 - Import Transparency**: ✓

- All imports will use direct file paths (no barrel exports)

**Standard 6 - SOLID Principles**: ✓

- **SRP**: `useFlowStateDefaultTemplate` has single responsibility (fetch template content)
- **DIP**: Components depend on hook abstraction, not GraphQL query implementation
- **ISP**: Hook returns minimal interface: `{ templateContent, loading, error }`
- **DRY**: Centralizes template content fetching logic in one hook

**Conclusion**: This implementation adheres to all constitutional principles. No violations or mitigations required.

## Project Structure

### Documentation (this feature)

```text
specs/009-flow-post-template/
├── spec.md              # Feature specification (existing)
├── plan.md              # This file (implementation plan)
├── research.md          # Data flow research and decisions
├── data-model.md        # Entity relationships and GraphQL schema
├── quickstart.md        # Setup and testing instructions
├── contracts/           # GraphQL operations
│   └── FlowStateTemplateContent.graphql
└── checklists/
    └── requirements.md  # Spec quality checklist (existing)
```

### Source Code (repository root)

```text
src/domain/collaboration/
├── InnovationFlow/
│   ├── graphql/
│   │   ├── InnovationFlowStates.fragment.graphql  # (existing, has defaultCalloutTemplate)
│   │   ├── UpdateInnovationFlowStateDefaultTemplate.graphql  # (existing, admin mutations)
│   │   └── FlowStateTemplateContent.graphql  # NEW: Query for template content
│   ├── hooks/
│   │   └── useFlowStateDefaultTemplate.ts  # NEW: Hook to load template content
│   └── InnovationFlowDialogs/
│       ├── SetDefaultTemplateDialog.tsx  # (existing, admin UI)
│       └── useInnovationFlowSettings.tsx  # (existing, admin actions)
├── callout/
│   ├── CalloutView/
│   │   └── CalloutView.tsx  # MODIFY: Pass flow state template ID to children
│   └── models/
│       └── CalloutDetailsModel.ts  # (existing, has classification.flowState)
├── calloutContributions/
│   ├── contributionsCardsExpandable/
│   │   └── ContributionsCardsExpandable.tsx  # MODIFY: Pass template ID to CreateButton
│   └── post/
│       ├── CreateContributionButtonPost.tsx  # MODIFY: Load & pass template content
│       └── PostCreationDialog.tsx  # (existing, accepts defaultDescription)
└── CalloutPage/
    └── CalloutPage.tsx  # (existing, provides callout with classification)

src/core/apollo/generated/
├── apollo-hooks.ts  # REGENERATED: New template content query hook
├── apollo-helpers.ts  # REGENERATED
└── graphql-schema.ts  # (existing, schema types)
```

**Structure Decision**: This is a React 19 SPA following domain-driven design. The implementation follows the existing pattern of domain-first architecture where:

1. Domain logic (template fetching) lives in `src/domain/collaboration/InnovationFlow/hooks/`
2. GraphQL operations live in `src/domain/collaboration/InnovationFlow/graphql/`
3. UI components in `src/domain/collaboration/calloutContributions/` consume domain hooks
4. Data flows via props through the component tree: `CalloutView` → `ContributionsCardsExpandable` → `CreateContributionButtonPost`

## Complexity Tracking

> No constitution violations detected. This section is intentionally empty.
