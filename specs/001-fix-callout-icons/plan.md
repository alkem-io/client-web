# Implementation Plan: Fix Callout Icon Display

**Branch**: `001-fix-callout-icons` | **Date**: November 12, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-callout-icons/spec.md`

## Summary

Update callout icon display logic to dynamically reflect both additional content (framing) type and response option types, replacing the current framing-only approach. This involves updating GraphQL fragments to fetch `settings.contribution.allowedTypes`, modifying the icon selection logic in `calloutIcons.ts`, adjusting icon sizing from 24px to 20px, reducing spacing between icon and text, and ensuring tooltips use the existing i18n system. The implementation follows existing patterns in the codebase with minimal risk.

## Technical Context

**Language/Version**: TypeScript 5.x (via React 19 + Vite)
**Primary Dependencies**: React 19, Apollo Client 3.x, MUI 5.x, Emotion (CSS-in-JS), Vite 5.x, GraphQL Code Generator
**Storage**: Apollo Client in-memory cache (normalized GraphQL data)
**Testing**: Vitest (unit tests), React Testing Library (component tests), visual regression via existing CI
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - SPA served via Vite
**Project Type**: Web application (React SPA with GraphQL backend)
**Performance Goals**: Page load performance within 5% of current baseline after adding `allowedTypes` field to queries
**Constraints**: WCAG 2.1 AA accessibility compliance, 20px icon size (down from 24px), reduced spacing per Figma design
**Scale/Scope**: Affects all pages displaying callout lists (Preview, Manage Flow, Template dialogs); ~4 GraphQL fragments, 1 icon utility module, multiple callout display components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Domain Alignment ✅

**Affected Domain Contexts**:

- `src/domain/collaboration/callout` - Primary domain context for callout display logic
- `src/domain/collaboration/calloutsSet` - List queries that need fragment updates

**Façade Updates**:

- `src/domain/collaboration/callout/icons/calloutIcons.ts` - Icon selection logic (already exists, needs enhancement)
- `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` - Fragment updates to include `settings.contribution.allowedTypes`

**React Component Orchestration**:

- Components remain orchestration-only; they consume icon selection logic via existing `calloutIcons` utilities
- No business logic added to components; icon determination logic stays in domain utility
- UI components simply render icons returned by domain logic

### React 19 Concurrency ✅

**New Components**: None - modifying existing callout display components

**Existing Component Updates**:

- Callout list items in Preview, Manage Flow, Template dialogs
- No new async patterns required; icon selection is synchronous based on cached data
- No Suspense boundary changes needed; icons render immediately from available data

**Legacy Surface Risks**:

- Existing callout components already handle loading states
- Icon size change from 24px to 20px is pure styling (no concurrency impact)
- Spacing reduction is CSS-only (no concurrency impact)

**Mitigation**: None required - changes are synchronous UI updates based on cached GraphQL data

### GraphQL Contract ✅

**Operations Touched**:

1. **Fragment**: `Callout` in `CalloutsSetQueries.graphql` (add `settings { contribution { allowedTypes } }`)
2. **Fragment**: `CalloutDetails` in `CalloutsSetQueries.graphql` (verify includes settings)
3. **Fragment**: `CalloutSettingsFull` in `CalloutSettingsFragment.graphql` (already includes `contribution.allowedTypes` ✅)
4. **Query**: Any queries using the `Callout` fragment for list views

**Schema Changes**: None - `settings.contribution.allowedTypes` already exists in schema

**Codegen Process**:

1. Update GraphQL fragments to include `settings { contribution { allowedTypes } }`
2. Run `pnpm run codegen` to regenerate hooks
3. Verify generated types include `CalloutContributionType[]` for `allowedTypes`
4. No schema diff review needed (using existing fields)

**Generated Types Usage**:

- Icon logic will use `CalloutFramingType` and `CalloutContributionType` enums from generated schema
- Component props remain explicitly typed (no direct export of generated types to UI contracts)
- Fragments explicitly request only needed fields

### State & Effects ✅

**State Sources**:

- **Apollo Cache**: Normalized callout data including `framing.type` and `settings.contribution.allowedTypes`
- **No React Context Changes**: Icon selection is pure function of cached data

**Adapters Required**: None

- Icon selection logic in `calloutIcons.ts` is already a pure function
- Takes `framingType` and will be extended to take `allowedTypes` parameter
- No side effects; returns icon component and i18n key

**Side-Effect Isolation**:

- Icon tooltips use existing i18n system (no new effects)
- MUI Tooltip component handles hover interactions (existing pattern)
- No direct DOM manipulation required

### Experience Safeguards ✅

**Accessibility**:

- Icons must have `aria-label` attributes describing their meaning ✅ (via i18n keys)
- Tooltips must be keyboard-accessible ✅ (MUI Tooltip provides this)
- Color contrast must meet WCAG AA ✅ (existing MUI theme provides compliant colors)
- Screen reader compatibility ✅ (existing icon components already support this)

**Performance**:

- Baseline: Current page load time for callout lists
- Target: Within 5% of baseline after adding `allowedTypes` field
- Measurement: Lighthouse performance scores, Network panel payload sizes
- Mitigation: Monitor query payload size; consider pagination if needed

**Testing Evidence Required**:

1. **Unit Tests**: Icon selection logic for all 4 type combinations (None/None, None/Response, Framing/None, Framing/Response)
2. **Visual Regression**: Icon size (20px), spacing reduction, tooltip display
3. **Integration Tests**: Correct icons appear in Preview, Manage Flow, Template dialogs
4. **Accessibility Tests**: Tooltips keyboard-navigable, aria-labels present

**Observability**:

- Log any fallback scenarios where `allowedTypes` is missing or undefined
- Track icon render performance (should be negligible - pure function)
- Monitor GraphQL query performance for lists

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-callout-icons/
├── spec.md              # Feature specification (complete)
├── clarifications.md    # Clarification Q&A (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (GraphQL fragments)
├── checklists/
│   ├── requirements.md  # Requirements validation (complete)
│   └── clarification.md # Clarification checklist (complete)
└── README.md            # Quick reference (complete)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   │   ├── generated/
│   │   │   ├── graphql-schema.ts       # Contains CalloutFramingType, CalloutContributionType enums
│   │   │   └── apollo-hooks.ts         # Generated hooks (regenerated via codegen)
│   │   └── [other apollo files]
│   └── ui/                              # MUI theme, shared UI components
│
├── domain/
│   └── collaboration/
│       ├── callout/
│       │   ├── icons/
│       │   │   └── calloutIcons.ts     # MODIFY: Icon selection logic
│       │   ├── graphql/
│       │   │   └── CalloutContent.graphql  # Verify includes settings
│       │   └── settings/
│       │       └── graphql/
│       │           └── CalloutSettingsFragment.graphql  # Already has allowedTypes ✅
│       └── calloutsSet/
│           └── useCalloutsSet/
│               └── CalloutsSetQueries.graphql  # MODIFY: Add settings to Callout fragment
│
└── main/
    └── [routing shells]                # Components consuming callout icons (no changes needed)

tests/
└── [existing test structure]            # Add tests for icon selection logic
```

**Structure Decision**: Single web application project. Changes isolated to `src/domain/collaboration/callout` (icon logic) and GraphQL fragments in `src/domain/collaboration/calloutsSet`. No new directories required; follows existing domain-driven structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All changes align with constitution principles:

- Domain logic stays in `src/domain/collaboration/callout/icons`
- Components remain orchestration-only
- GraphQL contract maintained via codegen
- No new state management or side effects
- Accessibility and performance safeguards documented

---

## Phase 0: Research & Unknowns Resolution

**Status**: Ready to execute

### Research Tasks

1. **Figma Design Specifications** (NEEDS CLARIFICATION → RESOLVED)
   - **Question**: Exact pixel value for spacing reduction between icon and text
   - **Research Needed**: Get Figma design access or designer confirmation
   - **Priority**: Medium (can use standard MUI spacing reduction as fallback)
   - **Output**: Document in `research.md`

2. **GraphQL Query Performance Impact** (NEEDS VALIDATION)
   - **Question**: What is the actual payload size increase when adding `settings.contribution.allowedTypes` to list queries?
   - **Research Needed**: Test query with/without field on dev environment
   - **Priority**: High (original issue notes this as concern)
   - **Output**: Document baseline vs. new payload sizes in `research.md`

3. **Icon Component Sizing Strategy** (NEEDS INVESTIGATION)
   - **Question**: How do current icon components accept size props? Is it `size` prop or `sx` prop?
   - **Research Needed**: Review existing callout icon usage patterns
   - **Priority**: High (affects implementation approach)
   - **Output**: Document sizing pattern in `research.md`

4. **Tooltip I18n Keys Validation** (NEEDS VERIFICATION)
   - **Question**: Do all required i18n keys exist for callout types? Pattern: `common.calloutType.{TYPE}`
   - **Research Needed**: Search i18n files for existing keys
   - **Priority**: Medium (keys likely exist based on existing implementation)
   - **Output**: List all keys in `research.md`

5. **Visual Regression Testing Setup** (NEEDS CONFIRMATION)
   - **Question**: Does the project have visual regression testing infrastructure? If so, what tool?
   - **Research Needed**: Check CI/CD pipelines and test configuration
   - **Priority**: Low (can use manual verification if not available)
   - **Output**: Document available tools in `research.md`

### Best Practices Research

1. **MUI Tooltip Best Practices**
   - Research: Keyboard navigation patterns for tooltips
   - Context: Ensure accessibility compliance
   - Output: Document in `research.md`

2. **Apollo Cache Update Patterns**
   - Research: Best practices for fragment updates that affect list queries
   - Context: Ensure cache consistency when adding new fields
   - Output: Document in `research.md`

3. **GraphQL Fragment Composition**
   - Research: How to add nested fields to existing fragments without breaking consumers
   - Context: Adding `settings { contribution { allowedTypes } }` to Callout fragment
   - Output: Document in `research.md`

### Integration Patterns

1. **Icon Selection Logic Pattern**
   - Research: Review existing `calloutIcons.ts` implementation
   - Context: Understand current precedence logic and extend it
   - Output: Document current pattern and proposed changes in `research.md`

2. **Callout List Component Pattern**
   - Research: Identify all components rendering callout lists
   - Context: Ensure consistent icon display across all views
   - Output: List components in `research.md`

**Next Step**: Generate `research.md` with findings from all research tasks

---

## Phase 1: Design & Contracts

**Status**: Pending (awaits Phase 0 completion)

### Outputs Expected

1. **data-model.md**
   - Callout entity with `framing.type` and `settings.contribution.allowedTypes`
   - Icon mapping logic (input → output)
   - State transitions: None (stateless icon selection)

2. **contracts/** (GraphQL Fragments)
   - Updated `Callout` fragment in `CalloutsSetQueries.graphql`
   - Verification that `CalloutSettingsFull` includes `allowedTypes`
   - Type definitions for icon selection function signature

3. **quickstart.md**
   - How to test icon selection locally
   - How to verify GraphQL changes
   - How to run visual regression tests

4. **Agent Context Update**
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
   - Add: GraphQL Code Generator, Apollo Client fragment patterns, MUI icon sizing
   - Preserve: Existing technology stack entries

**Next Step**: Execute after Phase 0 research complete

---

## Phase 2: Task Breakdown

**Status**: Not started (handled by `/speckit.tasks` command)

This phase is executed by the `/speckit.tasks` command, not by `/speckit.plan`. It will generate `tasks.md` with implementation tasks broken down by:

- GraphQL fragment updates
- Icon logic enhancement
- Styling changes (size, spacing)
- Testing tasks
- Documentation updates

---

## Risk Register

| Risk                                              | Severity | Mitigation                                          | Owner          |
| ------------------------------------------------- | -------- | --------------------------------------------------- | -------------- |
| Performance degradation from `allowedTypes` field | Medium   | Measure baseline; optimize queries if >5% impact    | Dev + QA       |
| Figma spacing values unavailable                  | Low      | Use standard MUI spacing (8px → 4px) as fallback    | Designer + Dev |
| Breaking changes to GraphQL fragments             | Medium   | Schema diff review; test all consuming components   | Dev            |
| Visual regression not detected                    | Medium   | Add visual regression tests; manual QA verification | QA             |
| Missing i18n keys for new combinations            | Low      | Verify keys exist; add if missing                   | Dev            |

---

## Success Criteria Validation

Mapping spec success criteria to implementation validation:

- **SC-001**: Users distinguish callout types within 2 seconds → Manual UX testing with callout samples
- **SC-002**: 100% icon accuracy → Integration tests covering all type combinations
- **SC-003**: 20px icons, consistent spacing → Visual regression tests
- **SC-004**: Accessible tooltips → Accessibility audit (keyboard nav, screen readers)
- **SC-005**: "(n)" marker accuracy → Unit tests for response count display
- **SC-006**: Performance within 5% → Lighthouse scores before/after
- **SC-007**: Zero missing/incorrect icons → Fallback logic tests, production monitoring

---

## Notes

- **Existing Implementation Advantage**: `calloutIcons.ts` already has icon selection logic; we're extending it, not creating from scratch
- **Low Risk**: Changes align with existing patterns; no new architectural components
- **GraphQL Safety**: Using existing schema fields; no breaking changes
- **Performance**: Adding one field (`allowedTypes`) to queries; impact expected to be minimal
- **Design Dependency**: Exact spacing value requires Figma access; fallback available

**Plan Status**: ✅ Constitution Check Passed | ✅ Phase 0 Complete | ✅ Phase 1 Complete | 🔄 Ready for Phase 2 (`/speckit.tasks`)

# Implementation Plan: Fix Callout Icon Display

**Branch**: `001-fix-callout-icons` | **Date**: November 12, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-callout-icons/spec.md`

## Summary

Update callout icon display logic to dynamically reflect both additional content (framing) type and response option types, replacing the current framing-only approach. This involves updating GraphQL fragments to fetch `settings.contribution.allowedTypes`, modifying the icon selection logic in `calloutIcons.ts`, adjusting icon sizing from 24px to 20px, reducing spacing between icon and text, and ensuring tooltips use the existing i18n system. The implementation follows existing patterns in the codebase with minimal risk.

## Technical Context

**Language/Version**: TypeScript 5.x (via React 19 + Vite)
**Primary Dependencies**: React 19, Apollo Client 3.x, MUI 5.x, Emotion (CSS-in-JS), Vite 5.x, GraphQL Code Generator
**Storage**: Apollo Client in-memory cache (normalized GraphQL data)
**Testing**: Vitest (unit tests), React Testing Library (component tests), visual regression via existing CI
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - SPA served via Vite
**Project Type**: Web application (React SPA with GraphQL backend)
**Performance Goals**: Page load performance within 5% of current baseline after adding `allowedTypes` field to queries
**Constraints**: WCAG 2.1 AA accessibility compliance, 20px icon size (down from 24px), reduced spacing per Figma design
**Scale/Scope**: Affects all pages displaying callout lists (Preview, Manage Flow, Template dialogs); ~4 GraphQL fragments, 1 icon utility module, multiple callout display components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Domain Alignment ✅

**Affected Domain Contexts**:

- `src/domain/collaboration/callout` - Primary domain context for callout display logic
- `src/domain/collaboration/calloutsSet` - List queries that need fragment updates

**Façade Updates**:

- `src/domain/collaboration/callout/icons/calloutIcons.ts` - Icon selection logic (already exists, needs enhancement)
- `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` - Fragment updates to include `settings.contribution.allowedTypes`

**React Component Orchestration**:

- Components remain orchestration-only; they consume icon selection logic via existing `calloutIcons` utilities
- No business logic added to components; icon determination logic stays in domain utility
- UI components simply render icons returned by domain logic

### React 19 Concurrency ✅

**New Components**: None - modifying existing callout display components

**Existing Component Updates**:

- Callout list items in Preview, Manage Flow, Template dialogs
- No new async patterns required; icon selection is synchronous based on cached data
- No Suspense boundary changes needed; icons render immediately from available data

**Legacy Surface Risks**:

- Existing callout components already handle loading states
- Icon size change from 24px to 20px is pure styling (no concurrency impact)
- Spacing reduction is CSS-only (no concurrency impact)

**Mitigation**: None required - changes are synchronous UI updates based on cached GraphQL data

### GraphQL Contract ✅

**Operations Touched**:

1. **Fragment**: `Callout` in `CalloutsSetQueries.graphql` (add `settings { contribution { allowedTypes } }`)
2. **Fragment**: `CalloutDetails` in `CalloutsSetQueries.graphql` (verify includes settings)
3. **Fragment**: `CalloutSettingsFull` in `CalloutSettingsFragment.graphql` (already includes `contribution.allowedTypes` ✅)
4. **Query**: Any queries using the `Callout` fragment for list views

**Schema Changes**: None - `settings.contribution.allowedTypes` already exists in schema

**Codegen Process**:

1. Update GraphQL fragments to include `settings { contribution { allowedTypes } }`
2. Run `pnpm run codegen` to regenerate hooks
3. Verify generated types include `CalloutContributionType[]` for `allowedTypes`
4. No schema diff review needed (using existing fields)

**Generated Types Usage**:

- Icon logic will use `CalloutFramingType` and `CalloutContributionType` enums from generated schema
- Component props remain explicitly typed (no direct export of generated types to UI contracts)
- Fragments explicitly request only needed fields

### State & Effects ✅

**State Sources**:

- **Apollo Cache**: Normalized callout data including `framing.type` and `settings.contribution.allowedTypes`
- **No React Context Changes**: Icon selection is pure function of cached data

**Adapters Required**: None

- Icon selection logic in `calloutIcons.ts` is already a pure function
- Takes `framingType` and will be extended to take `allowedTypes` parameter
- No side effects; returns icon component and i18n key

**Side-Effect Isolation**:

- Icon tooltips use existing i18n system (no new effects)
- MUI Tooltip component handles hover interactions (existing pattern)
- No direct DOM manipulation required

### Experience Safeguards ✅

**Accessibility**:

- Icons must have `aria-label` attributes describing their meaning ✅ (via i18n keys)
- Tooltips must be keyboard-accessible ✅ (MUI Tooltip provides this)
- Color contrast must meet WCAG AA ✅ (existing MUI theme provides compliant colors)
- Screen reader compatibility ✅ (existing icon components already support this)

**Performance**:

- Baseline: Current page load time for callout lists
- Target: Within 5% of baseline after adding `allowedTypes` field
- Measurement: Lighthouse performance scores, Network panel payload sizes
- Mitigation: Monitor query payload size; consider pagination if needed

**Testing Evidence Required**:

1. **Unit Tests**: Icon selection logic for all 4 type combinations (None/None, None/Response, Framing/None, Framing/Response)
2. **Visual Regression**: Icon size (20px), spacing reduction, tooltip display
3. **Integration Tests**: Correct icons appear in Preview, Manage Flow, Template dialogs
4. **Accessibility Tests**: Tooltips keyboard-navigable, aria-labels present

**Observability**:

- Log any fallback scenarios where `allowedTypes` is missing or undefined
- Track icon render performance (should be negligible - pure function)
- Monitor GraphQL query performance for lists

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-callout-icons/
├── spec.md              # Feature specification (complete)
├── clarifications.md    # Clarification Q&A (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (GraphQL fragments)
├── checklists/
│   ├── requirements.md  # Requirements validation (complete)
│   └── clarification.md # Clarification checklist (complete)
└── README.md            # Quick reference (complete)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   │   ├── generated/
│   │   │   ├── graphql-schema.ts       # Contains CalloutFramingType, CalloutContributionType enums
│   │   │   └── apollo-hooks.ts         # Generated hooks (regenerated via codegen)
│   │   └── [other apollo files]
│   └── ui/                              # MUI theme, shared UI components
│
├── domain/
│   └── collaboration/
│       ├── callout/
│       │   ├── icons/
│       │   │   └── calloutIcons.ts     # MODIFY: Icon selection logic
│       │   ├── graphql/
│       │   │   └── CalloutContent.graphql  # Verify includes settings
│       │   └── settings/
│       │       └── graphql/
│       │           └── CalloutSettingsFragment.graphql  # Already has allowedTypes ✅
│       └── calloutsSet/
│           └── useCalloutsSet/
│               └── CalloutsSetQueries.graphql  # MODIFY: Add settings to Callout fragment
│
└── main/
    └── [routing shells]                # Components consuming callout icons (no changes needed)

tests/
└── [existing test structure]            # Add tests for icon selection logic
```

**Structure Decision**: Single web application project. Changes isolated to `src/domain/collaboration/callout` (icon logic) and GraphQL fragments in `src/domain/collaboration/calloutsSet`. No new directories required; follows existing domain-driven structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All changes align with constitution principles:

- Domain logic stays in `src/domain/collaboration/callout/icons`
- Components remain orchestration-only
- GraphQL contract maintained via codegen
- No new state management or side effects
- Accessibility and performance safeguards documented

---

## Phase 0: Research & Unknowns Resolution

**Status**: Ready to execute

### Research Tasks

1. **Figma Design Specifications** (NEEDS CLARIFICATION → RESOLVED)
   - **Question**: Exact pixel value for spacing reduction between icon and text
   - **Research Needed**: Get Figma design access or designer confirmation
   - **Priority**: Medium (can use standard MUI spacing reduction as fallback)
   - **Output**: Document in `research.md`

2. **GraphQL Query Performance Impact** (NEEDS VALIDATION)
   - **Question**: What is the actual payload size increase when adding `settings.contribution.allowedTypes` to list queries?
   - **Research Needed**: Test query with/without field on dev environment
   - **Priority**: High (original issue notes this as concern)
   - **Output**: Document baseline vs. new payload sizes in `research.md`

3. **Icon Component Sizing Strategy** (NEEDS INVESTIGATION)
   - **Question**: How do current icon components accept size props? Is it `size` prop or `sx` prop?
   - **Research Needed**: Review existing callout icon usage patterns
   - **Priority**: High (affects implementation approach)
   - **Output**: Document sizing pattern in `research.md`

4. **Tooltip I18n Keys Validation** (NEEDS VERIFICATION)
   - **Question**: Do all required i18n keys exist for callout types? Pattern: `common.calloutType.{TYPE}`
   - **Research Needed**: Search i18n files for existing keys
   - **Priority**: Medium (keys likely exist based on existing implementation)
   - **Output**: List all keys in `research.md`

5. **Visual Regression Testing Setup** (NEEDS CONFIRMATION)
   - **Question**: Does the project have visual regression testing infrastructure? If so, what tool?
   - **Research Needed**: Check CI/CD pipelines and test configuration
   - **Priority**: Low (can use manual verification if not available)
   - **Output**: Document available tools in `research.md`

### Best Practices Research

1. **MUI Tooltip Best Practices**
   - Research: Keyboard navigation patterns for tooltips
   - Context: Ensure accessibility compliance
   - Output: Document in `research.md`

2. **Apollo Cache Update Patterns**
   - Research: Best practices for fragment updates that affect list queries
   - Context: Ensure cache consistency when adding new fields
   - Output: Document in `research.md`

3. **GraphQL Fragment Composition**
   - Research: How to add nested fields to existing fragments without breaking consumers
   - Context: Adding `settings { contribution { allowedTypes } }` to Callout fragment
   - Output: Document in `research.md`

### Integration Patterns

1. **Icon Selection Logic Pattern**
   - Research: Review existing `calloutIcons.ts` implementation
   - Context: Understand current precedence logic and extend it
   - Output: Document current pattern and proposed changes in `research.md`

2. **Callout List Component Pattern**
   - Research: Identify all components rendering callout lists
   - Context: Ensure consistent icon display across all views
   - Output: List components in `research.md`

**Next Step**: Generate `research.md` with findings from all research tasks

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

All design artifacts have been created:

### Outputs Expected

1. **data-model.md**
   - Callout entity with `framing.type` and `settings.contribution.allowedTypes`
   - Icon mapping logic (input → output)
   - State transitions: None (stateless icon selection)

2. **contracts/** (GraphQL Fragments)
   - Updated `Callout` fragment in `CalloutsSetQueries.graphql`
   - Verification that `CalloutSettingsFull` includes `allowedTypes`
   - Type definitions for icon selection function signature

3. **quickstart.md**
   - How to test icon selection locally
   - How to verify GraphQL changes
   - How to run visual regression tests

4. **Agent Context Update**
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
   - Add: GraphQL Code Generator, Apollo Client fragment patterns, MUI icon sizing
   - Preserve: Existing technology stack entries

**Next Step**: Execute after Phase 0 research complete

---

## Phase 2: Task Breakdown

**Status**: Not started (handled by `/speckit.tasks` command)

This phase is executed by the `/speckit.tasks` command, not by `/speckit.plan`. It will generate `tasks.md` with implementation tasks broken down by:

- GraphQL fragment updates
- Icon logic enhancement
- Styling changes (size, spacing)
- Testing tasks
- Documentation updates

---

## Risk Register

| Risk                                              | Severity | Mitigation                                          | Owner          |
| ------------------------------------------------- | -------- | --------------------------------------------------- | -------------- |
| Performance degradation from `allowedTypes` field | Medium   | Measure baseline; optimize queries if >5% impact    | Dev + QA       |
| Figma spacing values unavailable                  | Low      | Use standard MUI spacing (8px → 4px) as fallback    | Designer + Dev |
| Breaking changes to GraphQL fragments             | Medium   | Schema diff review; test all consuming components   | Dev            |
| Visual regression not detected                    | Medium   | Add visual regression tests; manual QA verification | QA             |
| Missing i18n keys for new combinations            | Low      | Verify keys exist; add if missing                   | Dev            |

---

## Success Criteria Validation

Mapping spec success criteria to implementation validation:

- **SC-001**: Users distinguish callout types within 2 seconds → Manual UX testing with callout samples
- **SC-002**: 100% icon accuracy → Integration tests covering all type combinations
- **SC-003**: 20px icons, consistent spacing → Visual regression tests
- **SC-004**: Accessible tooltips → Accessibility audit (keyboard nav, screen readers)
- **SC-005**: "(n)" marker accuracy → Unit tests for response count display
- **SC-006**: Performance within 5% → Lighthouse scores before/after
- **SC-007**: Zero missing/incorrect icons → Fallback logic tests, production monitoring

---

## Notes

- **Existing Implementation Advantage**: `calloutIcons.ts` already has icon selection logic; we're extending it, not creating from scratch
- **Low Risk**: Changes align with existing patterns; no new architectural components
- **GraphQL Safety**: Using existing schema fields; no breaking changes
- **Performance**: Adding one field (`allowedTypes`) to queries; impact expected to be minimal
- **Design Dependency**: Exact spacing value requires Figma access; fallback available

**Plan Status**: ✅ Constitution Check Passed | 🔄 Ready for Phase 0 Research

# Implementation Plan: Fix Callout Icon Display

**Branch**: `001-fix-callout-icons` | **Date**: November 12, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-callout-icons/spec.md`

## Summary

Update callout icon display logic to dynamically reflect both additional content (framing) type and response option types, replacing the current framing-only approach. This involves updating GraphQL fragments to fetch `settings.contribution.allowedTypes`, modifying the icon selection logic in `calloutIcons.ts`, adjusting icon sizing from 24px to 20px, reducing spacing between icon and text, and ensuring tooltips use the existing i18n system. The implementation follows existing patterns in the codebase with minimal risk.

## Technical Context

**Language/Version**: TypeScript 5.x (via React 19 + Vite)
**Primary Dependencies**: React 19, Apollo Client 3.x, MUI 5.x, Emotion (CSS-in-JS), Vite 5.x, GraphQL Code Generator
**Storage**: Apollo Client in-memory cache (normalized GraphQL data)
**Testing**: Vitest (unit tests), React Testing Library (component tests), visual regression via existing CI
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - SPA served via Vite
**Project Type**: Web application (React SPA with GraphQL backend)
**Performance Goals**: Page load performance within 5% of current baseline after adding `allowedTypes` field to queries
**Constraints**: WCAG 2.1 AA accessibility compliance, 20px icon size (down from 24px), reduced spacing per Figma design
**Scale/Scope**: Affects all pages displaying callout lists (Preview, Manage Flow, Template dialogs); ~4 GraphQL fragments, 1 icon utility module, multiple callout display components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Domain Alignment ✅

**Affected Domain Contexts**:

- `src/domain/collaboration/callout` - Primary domain context for callout display logic
- `src/domain/collaboration/calloutsSet` - List queries that need fragment updates

**Façade Updates**:

- `src/domain/collaboration/callout/icons/calloutIcons.ts` - Icon selection logic (already exists, needs enhancement)
- `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` - Fragment updates to include `settings.contribution.allowedTypes`

**React Component Orchestration**:

- Components remain orchestration-only; they consume icon selection logic via existing `calloutIcons` utilities
- No business logic added to components; icon determination logic stays in domain utility
- UI components simply render icons returned by domain logic

### React 19 Concurrency ✅

**New Components**: None - modifying existing callout display components

**Existing Component Updates**:

- Callout list items in Preview, Manage Flow, Template dialogs
- No new async patterns required; icon selection is synchronous based on cached data
- No Suspense boundary changes needed; icons render immediately from available data

**Legacy Surface Risks**:

- Existing callout components already handle loading states
- Icon size change from 24px to 20px is pure styling (no concurrency impact)
- Spacing reduction is CSS-only (no concurrency impact)

**Mitigation**: None required - changes are synchronous UI updates based on cached GraphQL data

### GraphQL Contract ✅

**Operations Touched**:

1. **Fragment**: `Callout` in `CalloutsSetQueries.graphql` (add `settings { contribution { allowedTypes } }`)
2. **Fragment**: `CalloutDetails` in `CalloutsSetQueries.graphql` (verify includes settings)
3. **Fragment**: `CalloutSettingsFull` in `CalloutSettingsFragment.graphql` (already includes `contribution.allowedTypes` ✅)
4. **Query**: Any queries using the `Callout` fragment for list views

**Schema Changes**: None - `settings.contribution.allowedTypes` already exists in schema

**Codegen Process**:

1. Update GraphQL fragments to include `settings { contribution { allowedTypes } }`
2. Run `pnpm run codegen` to regenerate hooks
3. Verify generated types include `CalloutContributionType[]` for `allowedTypes`
4. No schema diff review needed (using existing fields)

**Generated Types Usage**:

- Icon logic will use `CalloutFramingType` and `CalloutContributionType` enums from generated schema
- Component props remain explicitly typed (no direct export of generated types to UI contracts)
- Fragments explicitly request only needed fields

### State & Effects ✅

**State Sources**:

- **Apollo Cache**: Normalized callout data including `framing.type` and `settings.contribution.allowedTypes`
- **No React Context Changes**: Icon selection is pure function of cached data

**Adapters Required**: None

- Icon selection logic in `calloutIcons.ts` is already a pure function
- Takes `framingType` and will be extended to take `allowedTypes` parameter
- No side effects; returns icon component and i18n key

**Side-Effect Isolation**:

- Icon tooltips use existing i18n system (no new effects)
- MUI Tooltip component handles hover interactions (existing pattern)
- No direct DOM manipulation required

### Experience Safeguards ✅

**Accessibility**:

- Icons must have `aria-label` attributes describing their meaning ✅ (via i18n keys)
- Tooltips must be keyboard-accessible ✅ (MUI Tooltip provides this)
- Color contrast must meet WCAG AA ✅ (existing MUI theme provides compliant colors)
- Screen reader compatibility ✅ (existing icon components already support this)

**Performance**:

- Baseline: Current page load time for callout lists
- Target: Within 5% of baseline after adding `allowedTypes` field
- Measurement: Lighthouse performance scores, Network panel payload sizes
- Mitigation: Monitor query payload size; consider pagination if needed

**Testing Evidence Required**:

1. **Unit Tests**: Icon selection logic for all 4 type combinations (None/None, None/Response, Framing/None, Framing/Response)
2. **Visual Regression**: Icon size (20px), spacing reduction, tooltip display
3. **Integration Tests**: Correct icons appear in Preview, Manage Flow, Template dialogs
4. **Accessibility Tests**: Tooltips keyboard-navigable, aria-labels present

**Observability**:

- Log any fallback scenarios where `allowedTypes` is missing or undefined
- Track icon render performance (should be negligible - pure function)
- Monitor GraphQL query performance for lists

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-callout-icons/
├── spec.md              # Feature specification (complete)
├── clarifications.md    # Clarification Q&A (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (GraphQL fragments)
├── checklists/
│   ├── requirements.md  # Requirements validation (complete)
│   └── clarification.md # Clarification checklist (complete)
└── README.md            # Quick reference (complete)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   │   ├── generated/
│   │   │   ├── graphql-schema.ts       # Contains CalloutFramingType, CalloutContributionType enums
│   │   │   └── apollo-hooks.ts         # Generated hooks (regenerated via codegen)
│   │   └── [other apollo files]
│   └── ui/                              # MUI theme, shared UI components
│
├── domain/
│   └── collaboration/
│       ├── callout/
│       │   ├── icons/
│       │   │   └── calloutIcons.ts     # MODIFY: Icon selection logic
│       │   ├── graphql/
│       │   │   └── CalloutContent.graphql  # Verify includes settings
│       │   └── settings/
│       │       └── graphql/
│       │           └── CalloutSettingsFragment.graphql  # Already has allowedTypes ✅
│       └── calloutsSet/
│           └── useCalloutsSet/
│               └── CalloutsSetQueries.graphql  # MODIFY: Add settings to Callout fragment
│
└── main/
    └── [routing shells]                # Components consuming callout icons (no changes needed)

tests/
└── [existing test structure]            # Add tests for icon selection logic
```

**Structure Decision**: Single web application project. Changes isolated to `src/domain/collaboration/callout` (icon logic) and GraphQL fragments in `src/domain/collaboration/calloutsSet`. No new directories required; follows existing domain-driven structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All changes align with constitution principles:

- Domain logic stays in `src/domain/collaboration/callout/icons`
- Components remain orchestration-only
- GraphQL contract maintained via codegen
- No new state management or side effects
- Accessibility and performance safeguards documented

---

## Phase 0: Research & Unknowns Resolution

**Status**: ✅ Complete

All research tasks have been completed and documented in `research.md`.

### Research Tasks

1. **Figma Design Specifications** (NEEDS CLARIFICATION → RESOLVED)
   - **Question**: Exact pixel value for spacing reduction between icon and text
   - **Research Needed**: Get Figma design access or designer confirmation
   - **Priority**: Medium (can use standard MUI spacing reduction as fallback)
   - **Output**: Document in `research.md`

2. **GraphQL Query Performance Impact** (NEEDS VALIDATION)
   - **Question**: What is the actual payload size increase when adding `settings.contribution.allowedTypes` to list queries?
   - **Research Needed**: Test query with/without field on dev environment
   - **Priority**: High (original issue notes this as concern)
   - **Output**: Document baseline vs. new payload sizes in `research.md`

3. **Icon Component Sizing Strategy** (NEEDS INVESTIGATION)
   - **Question**: How do current icon components accept size props? Is it `size` prop or `sx` prop?
   - **Research Needed**: Review existing callout icon usage patterns
   - **Priority**: High (affects implementation approach)
   - **Output**: Document sizing pattern in `research.md`

4. **Tooltip I18n Keys Validation** (NEEDS VERIFICATION)
   - **Question**: Do all required i18n keys exist for callout types? Pattern: `common.calloutType.{TYPE}`
   - **Research Needed**: Search i18n files for existing keys
   - **Priority**: Medium (keys likely exist based on existing implementation)
   - **Output**: List all keys in `research.md`

5. **Visual Regression Testing Setup** (NEEDS CONFIRMATION)
   - **Question**: Does the project have visual regression testing infrastructure? If so, what tool?
   - **Research Needed**: Check CI/CD pipelines and test configuration
   - **Priority**: Low (can use manual verification if not available)
   - **Output**: Document available tools in `research.md`

### Best Practices Research

1. **MUI Tooltip Best Practices**
   - Research: Keyboard navigation patterns for tooltips
   - Context: Ensure accessibility compliance
   - Output: Document in `research.md`

2. **Apollo Cache Update Patterns**
   - Research: Best practices for fragment updates that affect list queries
   - Context: Ensure cache consistency when adding new fields
   - Output: Document in `research.md`

3. **GraphQL Fragment Composition**
   - Research: How to add nested fields to existing fragments without breaking consumers
   - Context: Adding `settings { contribution { allowedTypes } }` to Callout fragment
   - Output: Document in `research.md`

### Integration Patterns

1. **Icon Selection Logic Pattern**
   - Research: Review existing `calloutIcons.ts` implementation
   - Context: Understand current precedence logic and extend it
   - Output: Document current pattern and proposed changes in `research.md`

2. **Callout List Component Pattern**
   - Research: Identify all components rendering callout lists
   - Context: Ensure consistent icon display across all views
   - Output: List components in `research.md`

**Next Step**: Generate `research.md` with findings from all research tasks

---

## Phase 1: Design & Contracts

**Status**: Pending (awaits Phase 0 completion)

### Outputs Expected

1. **data-model.md**
   - Callout entity with `framing.type` and `settings.contribution.allowedTypes`
   - Icon mapping logic (input → output)
   - State transitions: None (stateless icon selection)

2. **contracts/** (GraphQL Fragments)
   - Updated `Callout` fragment in `CalloutsSetQueries.graphql`
   - Verification that `CalloutSettingsFull` includes `allowedTypes`
   - Type definitions for icon selection function signature

3. **quickstart.md**
   - How to test icon selection locally
   - How to verify GraphQL changes
   - How to run visual regression tests

4. **Agent Context Update**
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
   - Add: GraphQL Code Generator, Apollo Client fragment patterns, MUI icon sizing
   - Preserve: Existing technology stack entries

**Next Step**: Execute after Phase 0 research complete

---

## Phase 2: Task Breakdown

**Status**: Not started (handled by `/speckit.tasks` command)

This phase is executed by the `/speckit.tasks` command, not by `/speckit.plan`. It will generate `tasks.md` with implementation tasks broken down by:

- GraphQL fragment updates
- Icon logic enhancement
- Styling changes (size, spacing)
- Testing tasks
- Documentation updates

---

## Risk Register

| Risk                                              | Severity | Mitigation                                          | Owner          |
| ------------------------------------------------- | -------- | --------------------------------------------------- | -------------- |
| Performance degradation from `allowedTypes` field | Medium   | Measure baseline; optimize queries if >5% impact    | Dev + QA       |
| Figma spacing values unavailable                  | Low      | Use standard MUI spacing (8px → 4px) as fallback    | Designer + Dev |
| Breaking changes to GraphQL fragments             | Medium   | Schema diff review; test all consuming components   | Dev            |
| Visual regression not detected                    | Medium   | Add visual regression tests; manual QA verification | QA             |
| Missing i18n keys for new combinations            | Low      | Verify keys exist; add if missing                   | Dev            |

---

## Success Criteria Validation

Mapping spec success criteria to implementation validation:

- **SC-001**: Users distinguish callout types within 2 seconds → Manual UX testing with callout samples
- **SC-002**: 100% icon accuracy → Integration tests covering all type combinations
- **SC-003**: 20px icons, consistent spacing → Visual regression tests
- **SC-004**: Accessible tooltips → Accessibility audit (keyboard nav, screen readers)
- **SC-005**: "(n)" marker accuracy → Unit tests for response count display
- **SC-006**: Performance within 5% → Lighthouse scores before/after
- **SC-007**: Zero missing/incorrect icons → Fallback logic tests, production monitoring

---

## Notes

- **Existing Implementation Advantage**: `calloutIcons.ts` already has icon selection logic; we're extending it, not creating from scratch
- **Low Risk**: Changes align with existing patterns; no new architectural components
- **GraphQL Safety**: Using existing schema fields; no breaking changes
- **Performance**: Adding one field (`allowedTypes`) to queries; impact expected to be minimal
- **Design Dependency**: Exact spacing value requires Figma access; fallback available

**Plan Status**: ✅ Constitution Check Passed | 🔄 Ready for Phase 0 Research
