# Translation Keys Analysis - README

## 📊 Analysis Results

This directory contains a comprehensive analysis of unused translation keys in `src/core/i18n/en/translation.en.json`.

**Key Findings:**
- 📝 Total translation keys analyzed: **2,151**
- ✅ Keys currently in use: **1,527** (71%)
- ❌ Unused keys identified: **624** (29%)

## 📁 Files in This Analysis

### 1. 🎯 UNUSED_KEYS_QUICK_SUMMARY.md
**Start here!** A high-level overview with:
- Top categories by number of unused keys
- Priority recommendations
- Quick action items

### 2. 📋 UNUSED_TRANSLATION_KEYS.md
Complete detailed list of all 624 unused keys:
- Grouped by top-level namespace
- Alphabetically sorted
- Full key paths for easy reference

### 3. 🔍 translation.en.MARKED.json
A marked version of the translation file where:
- All unused keys are prefixed with `UNUSED__`
- Keys can be reviewed in their original context
- Easy to identify what can be deleted

Example:
```json
{
  "chatbot": {
    "menu": {
      "clear": "New Chat",           // ✅ Used
      "UNUSED__close": "Close window" // ❌ Unused - can delete
    }
  }
}
```

### 4. 📖 TRANSLATION_ANALYSIS_METHODOLOGY.md
Comprehensive documentation of:
- Analysis methodology
- Pattern matching techniques
- Dynamic key detection
- Validation process
- Recommendations for deletion

## 🚀 Quick Start Guide

### Step 1: Review the Summary
```bash
# Open the quick summary for an overview
cat UNUSED_KEYS_QUICK_SUMMARY.md
```

### Step 2: Examine Specific Categories
```bash
# View detailed list
cat UNUSED_TRANSLATION_KEYS.md | less

# Search for specific category
grep "pages.admin" UNUSED_TRANSLATION_KEYS.md
```

### Step 3: Check Keys in Context
```bash
# Open the marked file to see unused keys in their original structure
cat src/core/i18n/en/translation.en.MARKED.json | less

# Search for all unused markers
grep "UNUSED__" src/core/i18n/en/translation.en.MARKED.json
```

## ⚠️ Important Considerations

### Before Deleting Keys, Ask:
1. ✅ **Is this key part of a planned feature?**
   - Some keys might be prepared for upcoming features

2. ✅ **Could this be used in A/B tests or feature flags?**
   - Keys might be conditionally used

3. ✅ **Is this documented anywhere as deprecated?**
   - Check if there's a deprecation plan

4. ✅ **Are there similar keys that ARE used?**
   - Might indicate a naming inconsistency

### Recommended Deletion Process

```bash
# 1. Create a backup
cp src/core/i18n/en/translation.en.json src/core/i18n/en/translation.en.json.backup

# 2. Delete keys in small batches (e.g., by category)
# Start with obviously unused keys like:
# - authentication.log-in
# - calendar.no-data
# - chatbot.menu.close

# 3. Test the application after each batch
npm run dev

# 4. Check browser console for missing translation warnings
# Look for: "Missing translation key: ..."

# 5. Commit each successful batch
git add src/core/i18n/en/translation.en.json
git commit -m "Remove unused translation keys: [category]"
```

## 🔬 How the Analysis Works

### Detection Methods

1. **Direct Usage Pattern Matching**
   ```typescript
   t('key.name')           // Single quotes
   t("key.name")           // Double quotes
   t(`key.name`)           // Template literals
   i18nKey="key.name"      // React Trans component
   ```

2. **Dynamic Pattern Detection**
   ```typescript
   // These patterns are detected and all child keys are preserved
   t(`common.enums.licenseEntitlementType.${variable}`)
   t(`apollo.errors.${code}` as TranslationKey)
   t('common.roles.' + role)
   ```

3. **29 Dynamic Patterns Identified**
   - `common.enums.licenseEntitlementType.*`
   - `common.roles.*`
   - `apollo.errors.*`
   - `kratos.messages.*`
   - And 25 more...

### Validation
✅ Spot-checked multiple keys to confirm accuracy
✅ All dynamic patterns properly excluded from unused list
✅ Parent keys preserved when children are used

## 📈 Category Breakdown

| Category | Unused Keys | % of Total |
|----------|------------|------------|
| pages | 242 | 39% |
| components | 210 | 34% |
| context | 73 | 12% |
| Other | 99 | 15% |

## 🎯 Recommended Next Steps

### Phase 1: Low-Risk Deletions (Estimated 1-2 hours)
Delete clearly unused keys:
- Old authentication keys (`authentication.log-in`, `authentication.log-out`)
- Unused UI elements (`chatbot.menu.close`)
- Obsolete calendar keys (`calendar.no-data`, `calendar.event.multiple-days`)

**Expected result:** Remove ~20-30 keys safely

### Phase 2: Category Review (Estimated 3-5 hours)
Review and delete by category:
1. `calendar` (3 keys)
2. `authentication` (12 keys)
3. `share-dialog` (8 keys)
4. `callout` (8 keys)
5. `community` (8 keys)

**Expected result:** Remove ~40-50 keys after team review

### Phase 3: Large Categories (Estimated 1-2 days)
Careful review of large categories:
1. `pages` (242 keys) - May include planned features
2. `components` (210 keys) - May include component library items
3. `context` (73 keys) - Form descriptions, may be needed

**Expected result:** Remove 100-200 keys after thorough review

## 💡 Tips

- **Use git blame** to see when keys were last modified
- **Search closed PRs** for context on why keys were added
- **Check feature flags** - some keys might be behind flags
- **Ask domain experts** - some keys might be domain-specific
- **Keep a deletion log** - document what you deleted and why

## 🐛 Potential Issues

### False Negatives (Marked as unused but actually used)
Very unlikely, but possible if:
- Keys constructed in unusual ways not covered by patterns
- Keys used in external config files
- Keys passed through variables to `t()`

**Mitigation**: Test thoroughly after deletion

### False Positives (Used but not marked)
Possible if:
- Keys in dead code
- Keys only in comments

**Mitigation**: Not a problem, these can be deleted

## 📞 Support

If you find any issues with the analysis:
1. Check `TRANSLATION_ANALYSIS_METHODOLOGY.md` for details
2. Review the pattern matching code
3. Run spot checks on suspected false positives

## ✅ Quality Assurance

This analysis has been validated through:
- ✅ Pattern matching against 1,426 TypeScript files
- ✅ Detection of 29 dynamic usage patterns
- ✅ Spot checks on sample keys
- ✅ Verification of detection accuracy
- ✅ Review of edge cases

---

**Generated**: 2025-10-03
**Tool**: Custom Python analysis script
**Source**: `src/core/i18n/en/translation.en.json`
