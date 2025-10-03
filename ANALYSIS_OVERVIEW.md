# 🎯 Translation Keys Analysis - Quick Overview

## What Was Done

Analyzed `src/core/i18n/en/translation.en.json` to identify unused translation keys that can be safely deleted.

## Results at a Glance

```
📊 Statistics:
   Total Keys:     2,151
   Used Keys:      1,527 (71%)
   Unused Keys:      624 (29%)
```

## 📁 Files You Should Review

### 1. Start Here: [TRANSLATION_ANALYSIS_README.md](TRANSLATION_ANALYSIS_README.md)
Complete guide with:
- Overview of the analysis
- How to use the results
- Step-by-step deletion guide
- Safety recommendations

### 2. Quick Summary: [UNUSED_KEYS_QUICK_SUMMARY.md](UNUSED_KEYS_QUICK_SUMMARY.md)
High-level overview with:
- Top categories by unused keys
- Priority recommendations
- Quick action items

### 3. Complete List: [UNUSED_TRANSLATION_KEYS.md](UNUSED_TRANSLATION_KEYS.md)
All 624 unused keys:
- Grouped by category
- Alphabetically sorted
- Easy to search

### 4. Marked File: [src/core/i18n/en/translation.en.MARKED.json](src/core/i18n/en/translation.en.MARKED.json)
Translation file with markers:
- Unused keys prefixed with `UNUSED__`
- Review keys in context
- See what can be deleted

### 5. Technical Details: [TRANSLATION_ANALYSIS_METHODOLOGY.md](TRANSLATION_ANALYSIS_METHODOLOGY.md)
Deep dive into:
- How the analysis works
- Pattern detection methods
- Validation process

## 📊 Breakdown by Category

| Category | Count | % of Unused |
|----------|-------|-------------|
| pages | 242 | 39% |
| components | 210 | 34% |
| context | 73 | 12% |
| templateLibrary | 14 | 2% |
| authentication | 12 | 2% |
| Others | 73 | 12% |

## ✨ Example: What "Unused" Looks Like

In the marked file, you'll see:
```json
{
  "chatbot": {
    "menu": {
      "clear": "New Chat",            // ✅ This is used - keep it
      "UNUSED__close": "Close window" // ❌ Not used - can delete
    }
  }
}
```

## 🎯 High-Confidence Unused Keys (Delete First)

These are definitely unused and safe to delete:

```
✅ authentication.log-in
✅ authentication.log-out  
✅ authentication.sign-out
✅ calendar.event.multiple-days
✅ calendar.no-data
✅ chatbot.menu.close
✅ actions.add-entity
```

## ⚠️ Medium-Confidence (Review First)

Large categories that need team review:

```
⚠️  pages.* (242 keys)         - May include planned features
⚠️  components.* (210 keys)    - May include component library
⚠️  context.* (73 keys)        - Form descriptions, might be needed
```

## 🔍 How Dynamic Keys Were Handled

The analysis detected **29 dynamic patterns** like:

```typescript
// Example 1: Enum values
t(`common.enums.licenseEntitlementType.${spaceSubscriptionLevel}`)
// All keys under common.enums.licenseEntitlementType.* are preserved

// Example 2: Error codes
const key = `apollo.errors.${code}` as TranslationKey;
// All keys under apollo.errors.* are preserved

// Example 3: Roles
t('common.roles.' + role)
// All keys under common.roles.* are preserved
```

## 🚀 Recommended Next Steps

### Phase 1: Quick Wins (1-2 hours)
Delete obviously unused keys like `authentication.log-in`
- **Target**: ~20-30 keys
- **Risk**: Very low

### Phase 2: Category Review (3-5 hours)  
Review and delete by category: `authentication`, `calendar`, `callout`, etc.
- **Target**: ~40-50 keys
- **Risk**: Low

### Phase 3: Large Categories (1-2 days)
Careful review of `pages` and `components`
- **Target**: 100-200 keys
- **Risk**: Medium (needs team input)

## ✅ Quality Checks

- ✅ Scanned 1,426 TypeScript files
- ✅ Detected 29 dynamic patterns
- ✅ Spot-checked sample keys
- ✅ Validated detection accuracy
- ✅ Preserved parent/structural keys

## 💡 Pro Tips

1. **Use git blame** to see when keys were added
2. **Check PRs** for context
3. **Test after each batch** of deletions
4. **Keep a log** of what you deleted
5. **Ask domain experts** for unclear cases

## 🎉 You're All Set!

Everything is documented and ready for review. Start with [TRANSLATION_ANALYSIS_README.md](TRANSLATION_ANALYSIS_README.md) for the complete guide.

---

**Questions?** Check the methodology document or review the marked translation file.
