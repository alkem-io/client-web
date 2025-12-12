# Quick Summary: Unused Translation Keys by Category

## Top Categories with Unused Keys

| Category | Unused Keys | Examples |
|----------|------------|----------|
| **pages** | 242 | pages.admin, pages.space, pages.exploreSpaces, etc. |
| **components** | 210 | components.activity-log-section, components.application-button, etc. |
| **context** | 73 | context.L0.description, context.L1.vision, etc. |
| **authentication** | 12 | authentication.log-in, authentication.sign-out, etc. |
| **templateLibrary** | 14 | templateLibrary.calloutTemplates, etc. |
| **createVirtualContributorWizard** | 8 | Wizard-related keys |
| **share-dialog** | 8 | Sharing functionality keys |
| **community** | 8 | community.members, community.communityGuidelines, etc. |
| **callout** | 8 | callout.alkemio-link, callout.callout-location, etc. |
| **virtualContributorSpaceSettings** | 6 | Virtual contributor settings |
| **calendar** | 3 | calendar.event.multiple-days, calendar.no-data |
| **dashboard-discussions-section** | 3 | Dashboard discussion keys |
| **spaces-filter** | 3 | Space filter keys |
| **Others** | 20 | Various smaller categories |

## Total: 624 Unused Keys

## Quick Action Items

### High Priority (Definitely Unused)
1. ✅ `authentication.log-in`, `authentication.log-out` - Old authentication keys
2. ✅ `calendar.no-data`, `calendar.event.multiple-days` - Unused calendar messages
3. ✅ `chatbot.menu.close` - Missing chatbot menu item
4. ✅ `actions.add-entity` - Unused action

### Medium Priority (Review Needed)
1. ⚠️ **pages** category (242 keys) - Large number, needs careful review
2. ⚠️ **components** category (210 keys) - Large number, needs careful review
3. ⚠️ **context** category (73 keys) - Form field descriptions, may be planned features

### Low Priority (May be Future Features)
1. 🔍 **templateLibrary** (14 keys) - May be part of template system
2. 🔍 **virtualContributorSpaceSettings** (6 keys) - May be work in progress
3. 🔍 **createVirtualContributorWizard** (8 keys) - May be incomplete feature

## How to Proceed

1. **Review** the `UNUSED_TRANSLATION_KEYS.md` file for the complete list
2. **Check** `translation.en.MARKED.json` to see keys in context
3. **Verify** with your team which keys are truly obsolete vs. planned features
4. **Delete** in batches, testing after each batch

## Files to Review

- 📄 `UNUSED_TRANSLATION_KEYS.md` - Complete categorized list
- 📄 `translation.en.MARKED.json` - Translation file with UNUSED__ markers
- 📄 `TRANSLATION_ANALYSIS_METHODOLOGY.md` - Detailed methodology
