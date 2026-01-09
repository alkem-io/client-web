# Translation Keys Analysis - Methodology and Results

## Overview

This analysis identifies unused translation keys in `src/core/i18n/en/translation.en.json` that can be safely marked for deletion.

## Analysis Methodology

### 1. Key Extraction
- Analyzed only **leaf keys** (actual translation strings)
- Excluded parent/structural keys that organize the JSON hierarchy
- Total leaf keys analyzed: **2,151**

### 2. Usage Detection

The analysis scans all TypeScript/TSX source files for key usage in multiple patterns:

#### Direct Usage Patterns
- `t('key.name')` - Standard translation function
- `t("key.name")` - Double quotes
- `t(\`key.name\`)` - Template literals
- `i18nKey="key.name"` - React Trans component

#### Dynamic Usage Patterns
The analysis identifies 29 dynamic patterns where keys are constructed at runtime:

Examples:
```typescript
// Pattern: t(`common.enums.licenseEntitlementType.${spaceSubscriptionLevel}`)
t(`common.enums.licenseEntitlementType.${var}` as const)

// Pattern: t(`apollo.errors.${code}`)
const key = `apollo.errors.${code}` as TranslationKey;

// Pattern: t('common.roles.' + role)
t('common.roles.' + dynamicRole)
```

### Dynamic Patterns Found
The following base patterns are used dynamically in the code:
1. `buttons`
2. `common`
3. `common.blocks`
4. `common.enums.innovationFlowState`
5. `common.enums.licenseEntitlementType`
6. `common.enums.roleSetContributorType`
7. `common.enums.searchVisibility`
8. `common.enums.templateType`
9. `common.roles`
10. `community.invitations.inviteButton`
11. `community.invitations.inviteContributorsDialog.users.results`
12. `components.activityLogView.description`
13. `components.backdrop`
14. `components.card.privacy`
15. `components.search.searchScope`
16. `components.shareSettings.editableBy.options`
17. `fields`
18. `kratos.fields`
19. `kratos.messages`
20. `languages`
21. `pages.exploreSpaces.membershipFilter`
22. `pages.memo.readonlyDialog.reason`
23. `pages.whiteboard.readonlyDialog.reason`
24. `pages.whiteboard.readonlyReason`
25. `spaceDialog`
26. And 4 more...

**Important**: All child keys under these dynamic patterns are considered "used" even if not found directly in the code, because they may be accessed at runtime.

## Results

### Summary Statistics
- **Total leaf keys analyzed**: 2,151
- **Used keys**: 1,527 (71.0%)
- **Unused keys**: 624 (29.0%)

### Key Findings

#### Top Categories with Unused Keys
1. **components**: 210 unused keys
2. **context**: 73 unused keys
3. **pages**: 181 unused keys
4. **common**: 45 unused keys
5. **templateLibrary**: 22 unused keys

## Output Files

### 1. UNUSED_TRANSLATION_KEYS.md
A comprehensive markdown report listing all unused keys:
- Grouped by top-level namespace
- Complete alphabetical list
- Analysis metadata

### 2. translation.en.MARKED.json
A copy of the translation file with unused keys marked:
- Keys prefixed with `UNUSED__` are not used in the codebase
- Entire subtrees are marked if all child keys are unused
- This file is for review purposes only and should not be committed

## How to Use This Analysis

### Reviewing Marked Keys

1. Open `src/core/i18n/en/translation.en.MARKED.json`
2. Search for `UNUSED__` prefix
3. Each marked key can be safely deleted

### Examples of Marked Keys

```json
{
  "chatbot": {
    "menu": {
      "clear": "New Chat",
      "UNUSED__close": "Close window"  // Safe to delete
    }
  },
  "UNUSED__actions": {  // Entire subtree unused
    "UNUSED__add-entity": "Add {{entity}}"
  }
}
```

### Deletion Process

**Important**: Before deleting any keys, consider:

1. **Future use**: Is this key part of a planned feature?
2. **External references**: Could this key be used in external tools or documentation?
3. **A/B tests**: Is this key used in experimental features?

**Recommended approach**:
1. Review each key or category individually
2. Confirm with the team for domain-specific keys
3. Delete in batches by category
4. Test the application after each batch

## Validation

### Spot Checks Performed
Sample keys verified as truly unused:
- ✅ `chatbot.menu.close` - Not found in codebase
- ✅ `calendar.event.multiple-days` - Not found in codebase
- ✅ `authentication.log-in` - Not found in codebase
- ✅ `actions.add-entity` - Not found in codebase

## Notes and Limitations

### False Negatives (Actually Used but Marked as Unused)
Unlikely, but possible if:
- Keys are constructed in very unusual ways not covered by the patterns
- Keys are used in external files not scanned (.js, .json config files, etc.)
- Keys are used in string variables that are then passed to `t()`

### False Positives (Unused but Not Marked)
Possible if:
- Keys are used in dead code that's never executed
- Keys are referenced in comments only

## Recommendations

1. **Delete in phases**: Start with clear categories like `authentication.log-in`, `calendar.no-data`
2. **Test thoroughly**: Run the application and check i18n console warnings
3. **Keep backup**: The original `translation.en.json` is unchanged
4. **Consider migration**: Some keys might need to be migrated rather than deleted

## Technical Details

- **Analysis date**: 2025-10-03
- **Source files scanned**: 1,426 TypeScript/TSX files
- **Total source code**: ~5.9 million characters
- **Analysis tool**: Custom Python script with regex pattern matching
- **JSON structure**: Preserves original nested structure
