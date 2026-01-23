# Implementation Plan: Dynamic Page Title in Browser Tabs

**Branch**: `6557-dynamic-page-title` | **Date**: 2026-01-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/6557-dynamic-page-title/spec.md`

## Summary

Implement dynamic browser tab titles that reflect the current page context. The solution will provide a `usePageTitle` hook in `src/core/routing` that components can use to set their page title. Static pages will call the hook with i18n translation keys, while dynamic pages (spaces, profiles) will pass entity names from their existing contexts. The title format follows "[Page Context] | Alkemio" pattern for all pages except the home page, which displays just "Alkemio".

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: react-i18next (existing), react-router-dom (existing)
**Storage**: N/A (client-side only, no persistence)
**Testing**: Vitest (existing)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web SPA (React + Vite)
**Performance Goals**: Title update within 100ms of navigation or data load
**Constraints**: Must follow React 19 concurrent rendering patterns; side effects isolated to dedicated hooks
**Scale/Scope**: ~20 page types requiring title updates (per Page Title Matrix)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                         | Status  | Notes                                                                                                                                                                                                                                          |
| ------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I. Domain-Driven Frontend Boundaries**          | ✅ PASS | The `usePageTitle` hook is cross-cutting infrastructure → `src/core/routing`. Page-specific titles are set by domain components using their existing contexts (e.g., `SpaceContext.about.profile.displayName`). No business logic in the hook. |
| **II. React 19 Concurrent UX Discipline**         | ✅ PASS | Hook uses `useEffect` for side effects (DOM title update). Pure rendering preserved. Fallback to "Alkemio" when data loading.                                                                                                                  |
| **III. GraphQL Contract Fidelity**                | ✅ PASS | No new GraphQL queries needed. Entity names already available via existing contexts/queries.                                                                                                                                                   |
| **IV. State & Side-Effect Isolation**             | ✅ PASS | `document.title` manipulation isolated to a single dedicated hook in `src/core/routing`. Wrapper provides testability.                                                                                                                         |
| **V. Experience Quality & Safeguards**            | ✅ PASS | Feature enhances UX (tab identification). No accessibility concerns (title is semantic HTML). Unit tests required for hook logic.                                                                                                              |
| **Architecture Standard 3 (i18n)**                | ✅ PASS | Static titles use i18n translation keys via `react-i18next`. New keys added to `translation.en.json`.                                                                                                                                          |
| **Architecture Standard 5 (Import Transparency)** | ✅ PASS | No barrel exports; direct imports.                                                                                                                                                                                                             |
| **SOLID - SRP**                                   | ✅ PASS | `usePageTitle` has single responsibility: set document title. Each page component decides its own title.                                                                                                                                       |
| **SOLID - DIP**                                   | ✅ PASS | Components depend on `usePageTitle` abstraction, not direct `document.title` manipulation.                                                                                                                                                     |
| **SOLID - DRY**                                   | ✅ PASS | Title formatting logic (suffix, separator) centralized in hook.                                                                                                                                                                                |

**Gate Result**: ✅ All checks PASS. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/6557-dynamic-page-title/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal for this feature)
├── quickstart.md        # Phase 1 output
├── checklists/          # Requirements checklist
│   └── requirements.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── routing/
│   │   └── usePageTitle.ts          # NEW: Core hook for setting page title
│   └── i18n/
│       └── en/
│           └── translation.en.json   # MODIFIED: Add page title translation keys
├── domain/
│   ├── space/
│   │   ├── layout/
│   │   │   └── SpacePageLayout.tsx   # MODIFIED: Call usePageTitle with space name
│   │   └── routing/
│   │       └── SubspaceRoutes.tsx    # MODIFIED: Call usePageTitle with subspace name
│   ├── community/
│   │   ├── user/
│   │   │   └── layout/UserPageLayout.tsx      # MODIFIED: Call usePageTitle with user name
│   │   ├── organization/
│   │   │   └── layout/OrganizationPageLayout.tsx # MODIFIED: Call usePageTitle with org name
│   │   └── virtualContributor/
│   │       └── VCRoute.tsx           # MODIFIED: Call usePageTitle with VC name
│   ├── InnovationPack/
│   │   └── InnovationPackRoute.tsx   # MODIFIED: Call usePageTitle with pack name
│   └── communication/
│       └── discussion/
│           └── pages/ForumPage.tsx   # MODIFIED: Call usePageTitle
├── main/
│   ├── topLevelPages/
│   │   ├── Home/HomePage.tsx         # MODIFIED: Call usePageTitle("Alkemio")
│   │   ├── InnovationLibraryPage/    # MODIFIED: Call usePageTitle
│   │   └── topLevelSpaces/SpaceExplorerPage.tsx # MODIFIED: Call usePageTitle
│   ├── documentation/
│   │   └── DocumentationPage.tsx     # MODIFIED: Call usePageTitle
│   └── admin/
│       └── PlatformAdminRoute.tsx    # MODIFIED: Call usePageTitle

tests/
└── unit/
    └── core/
        └── routing/
            └── usePageTitle.test.ts  # NEW: Unit tests for hook
```

**Structure Decision**: Follows existing Alkemio architecture with cross-cutting hook in `src/core/routing`. Page-level integration happens at layout/route components where entity data is available via context.

## Phase 0: Research Summary

### R-001: React Page Title Patterns

**Decision**: Custom `usePageTitle` hook using `useEffect` for `document.title` manipulation
**Rationale**:

- React 19 does not include built-in title management
- Libraries like `react-helmet` add unnecessary bundle size (~10KB) for simple title updates
- Custom hook aligns with existing codebase patterns (no external dependencies for simple tasks)
- `useEffect` is the appropriate primitive for side effects in concurrent mode

**Alternatives considered**:

- `react-helmet-async`: Rejected (overkill for single feature, bundle bloat)
- Direct `document.title` in components: Rejected (violates SRP, no central control)

### R-002: Title Format Consistency

**Decision**: Use pipe separator with spaces: `"[Context] | Alkemio"`
**Rationale**:

- Standard web convention (Google, GitHub, etc. use similar patterns)
- Pipe clearly separates context from brand
- Consistent with existing Alkemio design patterns

### R-003: i18n Integration

**Decision**: Static titles use i18n keys; dynamic titles concatenate entity names with i18n suffix
**Rationale**:

- Allows translation of static pages (Forum, Contributors, etc.)
- Entity names (space names, user names) are user-generated and should not be translated
- Hook accepts either a translation key (prefixed with `pages.titles.`) or raw string

### R-004: Fallback Strategy

**Decision**: Default to "Alkemio" when no title provided or during loading states
**Rationale**:

- Clean fallback for error states
- Matches home page title for consistency
- Prevents flash of empty/undefined title

## Phase 1: Design

### Hook Interface

```typescript
// src/core/routing/usePageTitle.ts
interface UsePageTitleOptions {
  suffix?: string; // Override default "Alkemio" suffix
  skipSuffix?: boolean; // For home page: just "Alkemio"
}

function usePageTitle(title: string | undefined, options?: UsePageTitleOptions): void;
```

### Usage Patterns

**Static pages** (translated):

```typescript
// In ForumPage.tsx
const { t } = useTranslation();
usePageTitle(t('pages.titles.forum'));
```

**Dynamic pages** (entity name):

```typescript
// In SpacePageLayout.tsx
const { space } = useSpace();
usePageTitle(space.about.profile.displayName);
```

**Home page** (no suffix):

```typescript
// In HomePage.tsx
usePageTitle('Alkemio', { skipSuffix: true });
```

### i18n Keys Structure

```json
{
  "pages": {
    "titles": {
      "forum": "Forum",
      "spaces": "Spaces",
      "contributors": "Contributors",
      "templateLibrary": "Template Library",
      "globalAdmin": "Global Administration",
      "admin": "Administration",
      "documentation": "Documentation",
      "signIn": "Sign In",
      "signUp": "Sign Up",
      "notFound": "Page Not Found",
      "restricted": "Access Restricted"
    }
  }
}
```

### Entity Name Sources

| Page Type           | Context/Hook           | Property Path                        |
| ------------------- | ---------------------- | ------------------------------------ |
| Space (L0)          | `useSpace()`           | `space.about.profile.displayName`    |
| Subspace (L1/L2)    | `useSubSpace()`        | `subspace.about.profile.displayName` |
| User Profile        | `UserPageLayout`       | profile data from query              |
| Organization        | `OrganizationProvider` | organization profile                 |
| Virtual Contributor | VC context             | VC profile name                      |
| Innovation Pack     | Pack query data        | pack profile name                    |

## Complexity Tracking

> No Constitution Check violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |

## Implementation Approach

### Phase 1: Core Infrastructure

1. Create `usePageTitle` hook in `src/core/routing/usePageTitle.ts`
2. Add i18n keys to `translation.en.json`
3. Write unit tests for hook

### Phase 2: Static Page Integration

4. Integrate with home page (no suffix)
5. Integrate with static top-level pages (Forum, Spaces, Contributors, etc.)
6. Integrate with admin pages
7. Integrate with auth pages (Sign In, Sign Up)
8. Integrate with error pages (404, Restricted)

### Phase 3: Dynamic Page Integration

9. Integrate with Space pages (L0)
10. Integrate with Subspace pages (L1, L2)
11. Integrate with User profile pages
12. Integrate with Organization pages
13. Integrate with Virtual Contributor pages
14. Integrate with Innovation Pack pages

### Phase 4: Validation

15. Manual testing across all page types
16. Verify no default title appears post-load
17. PR with evidence

## Risk Assessment

| Risk                                    | Likelihood | Impact | Mitigation                                                         |
| --------------------------------------- | ---------- | ------ | ------------------------------------------------------------------ |
| Missing pages in initial implementation | Medium     | Low    | Page Title Matrix serves as checklist; can add pages incrementally |
| Title flash during loading              | Low        | Low    | Default fallback prevents empty titles                             |
| i18n key mismatches                     | Low        | Low    | TypeScript + ESLint catch missing keys                             |

## Next Steps

Run `/speckit.tasks` to generate the detailed task breakdown for implementation.
