# Clarification Report: Fix Callout Icon Display

**Feature**: Fix Callout Icon Display
**Spec**: `specs/001-fix-callout-icons/spec.md`
**Date**: November 12, 2025
**Status**: Clarifications Complete

---

## Executive Summary

After analyzing the specification against the actual codebase and GraphQL schema, I identified 5 areas needing clarification. All clarifications have been resolved through codebase analysis and user input.

**Resolution**: ✅ All critical ambiguities resolved. Specification ready for planning phase.

---

## Clarification 1: Callout Type Enums (RESOLVED)

**Category**: Domain & Data Model
**Priority**: Critical
**Status**: ✅ Resolved via codebase analysis + user confirmation

**Question**: What are the possible values for callout framing types and response option types?

**Answer**:

- **Framing Types**: `CalloutFramingType` enum with values:
  - `None` (displays as Post)
  - `Memo`
  - `Whiteboard`
  - `Link`

- **Contribution Types** (response options): `CalloutContributionType` enum with values:
  - `Post`
  - `Memo`
  - `Whiteboard`
  - `Link`

**Source**:

- Enum definitions in `src/core/apollo/generated/graphql-schema.ts`
- Icon mappings in `src/domain/collaboration/callout/icons/calloutIcons.ts`
- User confirmation

**Impact on Spec**: Spec correctly references these types generically. No changes needed.

---

## Clarification 2: GraphQL Field for Response Options (RESOLVED)

**Category**: Integration & External Dependencies
**Priority**: High
**Status**: ✅ Resolved via GraphQL schema analysis

**Question**: What is the exact GraphQL field name that provides response option type data?

**Answer**:

- **Field Path**: `callout.settings.contribution.allowedTypes`
- **Type**: `[CalloutContributionType!]!` (array of allowed contribution types)
- **Fragment**: `CalloutSettingsFull` in `CalloutSettingsFragment.graphql`

**Current State**:

- The `Callout` fragment in `CalloutsSetQueries.graphql` (lines 21-42) does NOT include settings
- Only fetches `framing.type` and basic callout info
- Need to add `settings { contribution { allowedTypes } }` to list queries

**Impact on Spec**:

- Confirms FR-010 requirement to fetch response option type data
- Validates performance concern in original issue (additional field needed in lists)
- Planning phase must include updating GraphQL fragments

---

## Clarification 3: Icon Precedence Logic (RESOLVED)

**Category**: Functional Scope & Behavior
**Priority**: High
**Status**: ✅ Resolved via existing implementation analysis

**Question**: Why does additional content (framing) take precedence over response options in the decision matrix?

**Answer**:
The existing implementation in `calloutIcons.ts` already follows this precedence:

```typescript
if (framingType !== CalloutFramingType.None) {
  return calloutFramingIcons[framingType];
}
if (contributionType && contributionIcons[contributionType]) {
  return contributionIcons[contributionType];
}
```

**Rationale**:

- Framing represents the **primary content** of the callout
- Response options represent **allowed contributions** (future/potential content)
- Showing what _is_ present takes precedence over what _could be_ added
- Aligns with existing codebase behavior

**Impact on Spec**: Spec's decision matrix is correct. No changes needed.

---

## Clarification 4: Exact Spacing Values (PARTIALLY RESOLVED)

**Category**: Interaction & UX Flow
**Priority**: Medium
**Status**: ⚠️ Partial - Figma design requires authentication

**Question**: What is the exact spacing/gap value between icon and text (currently described as "reduced per Figma")?

**Current State**:

- Figma design link requires authentication to view exact pixel values
- Issue description mentions "Reduced gap between icon and text" but no specific value

**Recommended Resolution**:

1. Designer or team member with Figma access should provide exact spacing value
2. Or, implement with standard MUI spacing reduction (e.g., from `spacing(2)` to `spacing(1)`)
3. Include visual regression test to catch spacing regressions

**Impact on Spec**:

- Add assumption: "Exact spacing values will be confirmed from Figma design during implementation"
- Mark as design validation requirement in planning phase

---

## Clarification 5: Tooltip Text Content (RESOLVED)

**Category**: Interaction & UX Flow
**Priority**: Medium
**Status**: ✅ Resolved via i18n pattern analysis

**Question**: What is the exact tooltip text for each callout type combination?

**Answer**:
The existing implementation uses i18n keys:

- Pattern: `common.calloutType.{TYPE}`
- Examples:
  - `common.calloutType.MEMO`
  - `common.calloutType.POST`
  - `common.calloutType.WHITEBOARD`
  - `common.calloutType.LINK`

**Resolution**:

- Tooltips are already internationalized
- Planning phase should verify i18n keys exist for all combinations
- Issue example "Memo as content or response option" suggests tooltips may need context
- Recommendation: Keep existing i18n pattern, add context only if user testing shows confusion

**Impact on Spec**:

- Add assumption: "Tooltip text follows existing i18n pattern `common.calloutType.{TYPE}`"
- FR-008 should reference i18n system for implementation

---

## Updated Assumptions

Based on clarifications, adding these assumptions to the spec:

- **A-008**: Tooltip text follows existing i18n pattern `common.calloutType.{TYPE}` (keys already exist in translation system)
- **A-009**: Exact spacing values will be confirmed from Figma design during implementation (design requires authentication)
- **A-010**: GraphQL field `settings.contribution.allowedTypes` contains response option types and must be added to list queries

---

## Updated Requirements

Based on clarifications, refining these requirements:

- **FR-010** (refined): System MUST fetch `settings.contribution.allowedTypes` from GraphQL API to determine allowed contribution types for icon selection
- **FR-013** (new): System MUST add `settings { contribution { allowedTypes } }` to callout list fragments where icon determination is needed

---

## Impact Assessment

### Minimal Changes Required

- ✅ Framing types already supported
- ✅ Contribution types already supported
- ✅ Icon precedence logic already correct
- ✅ Tooltip i18n system already in place

### Changes Needed

- 🔧 Add `settings.contribution.allowedTypes` to list query fragments
- 🔧 Update icon size from 24px to 20px
- 🔧 Reduce spacing (exact value TBD from Figma)
- 🔧 Update icon selection logic to check `allowedTypes` instead of just `contributionType`

### Performance Validation Needed

- ⚠️ Adding `settings.contribution.allowedTypes` to lists increases query payload
- ⚠️ Need to measure actual performance impact vs. 5% baseline target

---

## Next Steps for Planning

1. **Design Validation**:
   - Get Figma design access to confirm exact spacing values
   - Verify icon size change (24px → 20px) specifications

2. **GraphQL Updates**:
   - Update `Callout` fragment to include `settings.contribution.allowedTypes`
   - Test query performance impact
   - Run `pnpm codegen` to regenerate types

3. **Component Updates**:
   - Modify `calloutIcons.ts` to accept `allowedTypes` parameter
   - Update icon size in component props
   - Adjust spacing based on Figma specs

4. **Testing Strategy**:
   - Unit tests for icon selection logic with all type combinations
   - Visual regression tests for size and spacing
   - Performance tests for query changes

---

## Conclusion

**Readiness**: ✅ Ready for `/speckit.plan`

All critical clarifications resolved. Minor design detail (exact spacing) can be finalized during implementation with designer input. The specification is comprehensive and implementation approach is clear based on existing codebase patterns.

**Risk Level**: Low
**Implementation Confidence**: High (aligns with existing patterns)
