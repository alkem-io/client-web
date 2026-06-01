# Feature Specification: Translation Glossary Management

**Spec ID:** 101-translation-glossary
**Status:** Draft
**Created:** 2026-05-27

---

## Problem Statement

Currently, the application uses AI-based translation tools to generate translations for the CRD (new design system). This creates inconsistencies where:

1. **Domain terminology** is translated in ways that conflict with product branding (e.g., "Space" translated to "ruimte" instead of remaining "Space")
2. **Technical or product-specific terms** receive unwanted translations (e.g., "template" → "sjabloon" instead of staying "template")
3. **No centralized control** exists over which terms should be locked or have preferred translations in the CRD i18n layer
4. **Future language additions** require manual intervention to enforce the same glossary rules

This leads to a fragmented user experience where key product concepts are inconsistently named across the CRD UI.

---

## Goal & Outcomes

Enable the Alkemio team to:

1. **Define a translation glossary** that specifies which terms must remain untranslated or use a preferred translation
2. **Enforce glossary rules** automatically during AI translation workflows and CRD i18n codegen
3. **Support multiple languages** with language-specific overrides where needed
4. **Manage glossary lifecycle** through version control and documentation

**Measurable Outcomes:**

- A centralized, version-controlled glossary file exists in the CRD i18n structure
- 100% of locked terms remain untranslated across all supported languages in CRD translation files
- All preferred translations are applied consistently (verified via CRD i18n files)
- AI translation updates can be processed without manual intervention for glossary compliance

---

## User Scenarios & Acceptance Criteria

### Scenario 1: AI Translation Respects Glossary
**Actor:** AI translation tool / CI automation

**Flow:**
1. Developer commits code with new/updated CRD strings to `src/crd/i18n/exploreSpaces/`
2. CI automatically detects new English source strings
3. CI triggers AI translation with current glossary constraints
4. AI tool loads the CRD glossary (locked and preferred terms)
5. AI translation applies glossary constraints (locked terms remain untranslated, preferred translations enforced)
6. Translated strings are generated and validated in CI against glossary rules

**Acceptance Criteria:**
- Glossary rules are applied automatically during CI translation process
- Validation in CI gates prevents glossary mismatches from reaching production
- Documentation guides developers on glossary usage and CI workflow

---

### Scenario 2: Developer Adds New Product Term to CRD
**Actor:** Developer working on a CRD feature

**Flow:**
1. Developer adds a new feature in CRD using a term that should be locked (e.g., "Integration")
2. Adds the term to the glossary file with lock status
3. Commits the glossary update to the branch
4. On next AI translation run, the new term is locked for all languages

**Acceptance Criteria:**
- New glossary entries apply to all CRD translations in subsequent builds
- Locked terms are not translated in generated CRD i18n files
- Glossary file can be reviewed in PR before merge

---

### Scenario 3: Future Language Addition with CRD Support
**Actor:** Product manager preparing CRD launch in a new language (e.g., German)

**Flow:**
1. Product manager identifies new target language for CRD
2. Glossary rules automatically apply to the new language
3. AI translation is run for CRD strings with glossary constraints
4. Developers add language files to `src/crd/i18n/` with glossary compliance

**Acceptance Criteria:**
- Glossary rules are language-agnostic (not hardcoded for Dutch + English)
- New languages inherit all glossary settings without manual reconfiguration
- Documentation shows how to add language-specific overrides if needed

---

### Scenario 4: Glossary Review & Update for CRD
**Actor:** Product owner or language lead

**Flow:**
1. Product owner reviews glossary for CRD as part of quarterly planning
2. Proposes new locked terms or preferred translations based on user feedback
3. Updates glossary file with rationale
4. Changes are reviewed in PR and merged
5. Updated glossary is applied to next CRD translation build

**Acceptance Criteria:**
- Glossary file is human-readable and easy to edit
- Changes to glossary can be tracked via Git history
- Rationale/context for each glossary entry is documented
- Update process is clear and doesn't require technical expertise

---

## Functional Requirements

### F1. Glossary File Format
- **File location:** Central glossary file `src/crd/i18n/glossary.json` (shared across all CRD languages)
- **Rationale:** Single source of truth for CRD glossary rules; easier to maintain and review; applies uniformly to all CRD translation files
- **Structure:**
  ```json
  {
    "glossary": [
      {
        "term": "Space",
        "status": "locked",
        "translations": {
          "en": "Space",
          "nl": "Space",
          "de": "Space"
        },
        "rationale": "Product branding; must remain unchanged across all languages"
      },
      {
        "term": "template",
        "status": "preferred",
        "translations": {
          "en": "template",
          "nl": "template",
          "de": "template"
        },
        "rationale": "Technical term; avoid translated alternatives like 'sjabloon'"
      }
    ]
  }
  ```
- Glossary supports both **locked terms** (must not translate) and **preferred translations** (suggested, may be overridden by context)
- Each term includes rationale for maintainability
- Language-specific notes can be added if needed

### F2. AI Translation Integration
- **Tool:** Claude API (or similar LLM) with glossary passed in system prompt during translation request
- **Trigger:** Automated CI job runs when new/updated English strings are detected in `src/crd/i18n/**/*.json`
- Glossary is provided as constraints in the system prompt to enforce locked and preferred terms
- AI translation process respects locked terms (no translation applied) and preferred translations (enforced in output)
- Developers do not manually trigger translations; CI handles it automatically after glossary is locked by product team
- Fallback: Manual review process in case AI output does not comply with glossary

### F3. CRD i18n File Validation
- Post-translation validation runs as a **strict CI gate** and fails the build if glossary mismatches are detected in CRD translation files
- Rationale: Ensures 100% glossary compliance in CRD; prevents accidental mismatches from reaching production; guards against AI translation errors
- Validation checks:
  - All locked glossary terms appear untranslated across all CRD language files (`src/crd/i18n/**/*.json`)
  - All preferred translations match the glossary definition exactly in CRD files
  - No glossary term appears with alternate translations in any CRD language file
- Failure details are logged for developer review and correction
- Process supports quick re-translation if needed

### F4. Documentation
- README or guide documents:
  - Glossary file format and how to add/update entries
  - When to lock vs. prefer a translation
  - How the glossary integrates with AI translation tools for CRD
  - Process for adding new languages with glossary support
  - Validation error handling and remediation steps

### F5. Glossary Ownership & Review Process
- **Ownership:** Product/Product Design team
- **Rationale:** Product decisions determine which terms are critical to brand identity (e.g., "Space") or product terminology (e.g., "template")
- **Review workflow:**
  - Product proposes glossary updates with rationale
  - Changes are reviewed in PR by product stakeholders
  - Development reviews for technical feasibility and AI translation integration
  - Once approved and merged, glossary is applied to next CRD translation build
  - Developers are notified of glossary changes

### F5. Version Control
- Glossary file is committed to Git alongside code
- Changes to glossary are reviewable in PRs with clear rationale

---

## Success Criteria

1. **Glossary is authoritative and enforced:**
   - 100% of locked glossary terms appear untranslated in all CRD language files
   - 100% of preferred translations match the glossary definition in CRD files
   - CI validation gates prevent glossary mismatches from reaching production

2. **Workflow is clear and scalable:**
   - Adding a new locked term takes <5 minutes (edit JSON, commit)
   - Adding a new language to CRD does not require glossary reconfiguration (inherits existing rules)
   - Non-technical stakeholders can propose and review glossary changes

3. **Documentation is complete:**
   - Developer guide explains how glossary integrates with AI translation and CRD
   - Developer guide explains validation errors and remediation steps
   - At least 3 example terms are documented with rationale

4. **Integration is robust:**
   - Validation catches glossary mismatches in CRD i18n files
   - CI process is documented and tested
   - Process handles future CRD language additions without manual glossary overhead

---

## Key Entities & Data Model

### Glossary Entry
- **term** (string): English term to control
- **status** (enum): "locked" or "preferred"
- **translations** (object): Language code → target translation
- **rationale** (string): Explanation for this entry
- **addedDate** (ISO 8601): When entry was added
- **addedBy** (string): Who added it (for audit trail)
- **notes** (optional, string): Language-specific notes or context

### Supported Languages
- **en** (English) – default/source language for CRD
- **nl** (Dutch) – first priority for CRD
- **de**, **fr**, **es**, etc. – future extensibility for CRD

---

## Constraints & Assumptions

### Assumptions
1. **AI tools are the translation source** – Glossary is managed in Git and used by AI translation tools (not SSOT itself)
2. **Locked terms remain identical across languages** – E.g., "Space" in all languages is "Space" (no transliteration)
3. **Glossary applies to CRD UI strings only** – Not to backend APIs, GraphQL schema names, old MUI design, or internal code
4. **CRD is the design system in focus** – Glossary initially supports CRD i18n layers; legacy MUI design is out of scope
5. **One glossary per product** – Not per-space or per-feature; Alkemio-wide standards apply to CRD

### Constraints
- Glossary updates must be reviewed before AI translation is re-run to avoid disrupting consistency
- Retroactively locking a term may require re-translating already-generated CRD strings
- Language-specific overrides add complexity; limit to edge cases
- Glossary file must remain small and human-readable for maintainability

---

## Dependencies & External Factors

- **AI Translation Tools:** Glossary integration depends on the AI tool's ability to accept and enforce constraints
- **CI/CD Pipeline:** Automation for glossary validation and integration testing
- **CRD i18n Layer:** Glossary is applied to CRD translation files in `src/crd/i18n/`
- **Developers:** Glossary requires developer awareness and discipline during feature development

---

## Out of Scope

- Automated generation of glossary entries (human review is required)
- Machine learning or context-aware translation suggestions
- Real-time translation QA across the entire application
- Backfill of historical translations (glossary applies only to new/updated CRD strings)
- Legacy MUI design system translations (focus is CRD only)

---

## Clarifications Resolved

✅ **Q1 – Glossary File Structure:** Single central glossary file in CRD i18n (see F1 update)

✅ **Q2 – Validation Strictness:** Strict CI gate that fails the build for CRD i18n mismatches (see F3 update)

✅ **Q3 – Glossary Ownership:** Product/Product Design team (see F5 update)

✅ **Q4 – Translation Source (Session 2026-05-27):** AI-based translations only (no Crowdin); all Crowdin references removed

✅ **Q5 – Design System Scope (Session 2026-05-27):** Focus on CRD only; legacy MUI design out of scope

✅ **Q6 – AI Tool & Integration Method (Session 2026-05-27):** Claude API with glossary in system prompt (see F2 update)

✅ **Q7 – Translation Workflow Trigger (Session 2026-05-27):** Automated CI job when English strings detected; glossary managed separately by product team (see Scenario 1 & F2 update)

---

## Initial Glossary Draft

**Purpose:** Starting reference for developers and product team during planning & implementation. This list will be expanded based on CRD codebase audit.

```json
{
  "glossary": [
    {
      "term": "Subspaces",
      "status": "locked",
      "translations": {
        "en": "Subspaces",
        "nl": "Subspaces",
        "de": "Subspaces"
      },
      "rationale": "Product branding; core organizational unit. Must remain unchanged across all languages."
    },
    {
      "term": "Post",
      "status": "locked",
      "translations": {
        "en": "Post",
        "nl": "Post",
        "de": "Post"
      },
      "rationale": "Product branding; content creation unit. Avoid translations like 'artikel' or 'beitrag'."
    },
    {
      "term": "Posts",
      "status": "locked",
      "translations": {
        "en": "Posts",
        "nl": "Posts",
        "de": "Posts"
      },
      "rationale": "Plural of Post; product branding consistency."
    },
    {
      "term": "Callout",
      "status": "locked",
      "translations": {
        "en": "Post",
        "nl": "Post",
        "de": "Post"
      },
      "rationale": "Legacy term mapped to 'Post' for consistency. Users see 'Post' across UI."
    },
    {
      "term": "Callouts",
      "status": "locked",
      "translations": {
        "en": "Posts",
        "nl": "Posts",
        "de": "Posts"
      },
      "rationale": "Legacy plural term mapped to 'Posts' for consistency."
    },
    {
      "term": "template",
      "status": "preferred",
      "translations": {
        "en": "template",
        "nl": "template",
        "de": "template"
      },
      "rationale": "Technical term; avoid localized alternatives like 'sjabloon', 'Vorlage', 'plantilla'."
    },
    {
      "term": "templates",
      "status": "preferred",
      "translations": {
        "en": "templates",
        "nl": "templates",
        "de": "templates"
      },
      "rationale": "Plural technical term; maintain consistency with singular."
    },
    {
      "term": "Layout",
      "status": "locked",
      "translations": {
        "en": "Layout",
        "nl": "Layout",
        "de": "Layout"
      },
      "rationale": "Product feature term; UX consistency across languages."
    },
    {
      "term": "Virtual Contributor",
      "status": "locked",
      "translations": {
        "en": "Virtual Contributor",
        "nl": "Virtual Contributor",
        "de": "Virtual Contributor"
      },
      "rationale": "Product feature branding; AI agent role. Must remain consistent."
    },
    {
      "term": "Virtual Contributors",
      "status": "locked",
      "translations": {
        "en": "Virtual Contributors",
        "nl": "Virtual Contributors",
        "de": "Virtual Contributors"
      },
      "rationale": "Plural product feature branding."
    }
  ]
}
```

**Notes for developers:**
- This is a **starting point**; expect 50–100+ entries in final glossary
- **Status breakdown:** 8 locked (product branding), 2 preferred (technical terms)
- Product team will review and propose additions during planning
- Validation should catch any deviations in generated CRD i18n files

**Important translation notes:**
- **Dutch consistency:** "Post" is locked as "Post" (not "bericht" or any other variant). Legacy translations used "dit bericht"; CRD uses only "deze post". Validation must prevent regression to old term.
- **Legacy term mapping:** "Callout" and "Callouts" are legacy terms that map to "Post" and "Posts" respectively. ANY occurrence of "callout" (including compounds like "callout-index") should be translated/converted to use "post" terminology instead.
- **Compound terms rule (applies to ALL locked terms):** Any compound formed with locked glossary terms must retain the English term intact. Examples:
  - "post-index" → stays "post-index" (not "berichtenindex")
  - "callout-index" → becomes "post-index" (legacy term converted; not "berichtenindex")
  - "subspace-settings" → stays "subspace-settings" (not "deelruimte-instellingen")
  - "template-library" → stays "template-library" (not "sjabloonbibliotheek")
  - "layout-editor" → stays "layout-editor" (not "layouteditor")
  - "virtual-contributor-role" → stays "virtual-contributor-role" (not "virtuele-bijdrager-rol")
  - Validation should catch any translated compounds and flag them as glossary violations.

---

## Next Steps

1. Draft initial glossary entries (20–30 critical terms to lock/prefer for CRD)
2. Finalize AI translation integration method and prompt guidance
3. Plan CRD i18n validation process and CI gating strategy
4. Proceed to `/speckit.plan` for implementation planning
