# Clarification Checklist: Fix Callout Icon Display

**Purpose**: Track resolution of specification ambiguities and coverage gaps
**Created**: November 12, 2025
**Feature**: [spec.md](../spec.md)
**Status**: ✅ Complete

---

## Ambiguity Resolution

### Domain & Data Model

- [x] **Callout Type Enums** - RESOLVED
  - ✅ Framing types confirmed: `CalloutFramingType` (None, Memo, Whiteboard, Link)
  - ✅ Contribution types confirmed: `CalloutContributionType` (Post, Memo, Whiteboard, Link)
  - Source: GraphQL schema + codebase analysis + user confirmation

### Integration & External Dependencies

- [x] **GraphQL Field Names** - RESOLVED
  - ✅ Response options field: `settings.contribution.allowedTypes`
  - ✅ Fragment required: `CalloutSettingsFull` from `CalloutSettingsFragment.graphql`
  - ✅ Current list queries DO NOT include this field (need to add)
  - Source: GraphQL schema analysis

### Functional Scope & Behavior

- [x] **Icon Precedence Logic** - RESOLVED
  - ✅ Framing takes precedence over contribution types
  - ✅ Rationale: Display what IS present (framing) over what COULD BE added (contributions)
  - ✅ Aligns with existing implementation in `calloutIcons.ts`
  - Source: Codebase analysis

### Interaction & UX Flow

- [x] **Spacing Values** - PARTIALLY RESOLVED
  - ⚠️ Exact pixel value requires Figma design access (authenticated)
  - ✅ Assumption added: Will be confirmed during implementation
  - ✅ Recommendation: Use visual regression testing to prevent regressions
  - Status: Acceptable for planning phase

- [x] **Tooltip Text** - RESOLVED
  - ✅ Uses existing i18n pattern: `common.calloutType.{TYPE}`
  - ✅ No new translations needed (keys already exist)
  - ✅ Context can be added if user testing shows confusion
  - Source: Codebase analysis of `calloutIcons.ts`

---

## Coverage Verification

### Functional Coverage

- [x] Core flows documented (4 user stories, all P1/P2)
- [x] Edge cases identified (5 scenarios)
- [x] Error handling specified (fallback to Post icon)
- [x] Loading states mentioned

### Data Coverage

- [x] All callout type combinations documented
- [x] GraphQL fields identified
- [x] Data structure understood

### Integration Coverage

- [x] GraphQL query updates required (identified)
- [x] Component updates scoped (`calloutIcons.ts`)
- [x] i18n integration confirmed (existing pattern)

### Quality Coverage

- [x] Accessibility requirements defined (WCAG AA, aria-labels)
- [x] Performance targets set (5% baseline)
- [x] Testing strategy outlined (unit, visual regression, integration)

---

## Specification Updates

### Assumptions Added

- **A-008**: Tooltip text i18n pattern
- **A-009**: Spacing values from Figma (TBD)
- **A-010**: Callout type enums

### Requirements Refined

- **FR-008**: Updated to reference i18n pattern
- **FR-010**: Clarified to `settings.contribution.allowedTypes` field
- **FR-013**: NEW - GraphQL fragment update requirement

### Key Entities Updated

- Added specific enum values
- Added GraphQL field names
- Added implementation file reference

---

## Risk Assessment

### Technical Risks

| Risk                                                   | Severity | Mitigation                                       | Status        |
| ------------------------------------------------------ | -------- | ------------------------------------------------ | ------------- |
| Performance impact of adding `allowedTypes` to queries | Medium   | Measure actual impact; use pagination if needed  | ✅ Monitored  |
| Missing i18n keys for new combinations                 | Low      | Keys already exist; verify during implementation | ✅ Acceptable |
| Spacing values unavailable without Figma               | Low      | Designer confirmation during implementation      | ✅ Acceptable |

### Implementation Risks

| Risk                                  | Severity | Mitigation                                      | Status      |
| ------------------------------------- | -------- | ----------------------------------------------- | ----------- |
| Icon logic complexity                 | Low      | Existing pattern in `calloutIcons.ts` to follow | ✅ Low risk |
| Breaking changes to GraphQL fragments | Medium   | Schema diff review; staged rollout              | ✅ Planned  |
| Visual regression                     | Medium   | Visual regression tests in CI                   | ✅ Planned  |

---

## Readiness Assessment

### Ready for Planning: ✅ YES

**Confidence Level**: High

**Reasoning**:

1. All critical ambiguities resolved
2. Implementation approach clear from codebase analysis
3. Aligns with existing patterns (low risk)
4. Only minor design detail (spacing) pending - can be finalized during implementation
5. GraphQL changes scoped and understood

**Blockers**: None

**Dependencies**:

- Figma design access for exact spacing values (designer can provide during implementation)

---

## Next Steps

1. **Proceed to Planning Phase** (`/speckit.plan`)
   - Break down into implementation tasks
   - Estimate effort
   - Identify subtasks for GraphQL, component, and styling changes

2. **Design Validation** (parallel to planning)
   - Get Figma access or designer confirmation on spacing values
   - Validate icon size change (24px → 20px)

3. **Pre-Implementation**
   - Review updated spec with team
   - Confirm performance expectations are realistic
   - Set up visual regression testing infrastructure if not existing

---

## Validation Summary

✅ **Ambiguity Scan**: Complete (5 questions resolved)
✅ **Coverage Scan**: Complete (all areas covered)
✅ **Specification Updates**: Applied (3 assumptions, 2 requirements updated)
✅ **Risk Assessment**: Complete (low-medium risks, all mitigated)
✅ **Readiness Check**: PASSED

**Status**: 🟢 Ready for `/speckit.plan`
