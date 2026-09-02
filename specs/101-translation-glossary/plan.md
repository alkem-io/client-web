# Implementation Plan: CRD Translation Glossary — Search & Replace Remediation

**Branch**: `101-translation-glossary` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/101-translation-glossary/spec.md`
**Scope note**: This plan covers the **concrete remediation pass** requested by the user — enforce
the glossary across **all existing** CRD translation files in **all** languages, plus a validation
gate to prevent regression. The broader glossary-management *system* described in the spec
(automated CI translation of new strings — F2 trigger automation, product-team review workflow F5)
is **deferred** and explicitly out of scope here. See "Scope Boundaries" below.

## Summary

Today every CRD locale file translates Alkemio's brand terms (Space, Subspace, Post/Callout,
Template, Layout, Virtual Contributor) into the target language — `space` is "Ruimte"/"Raum"/
"Espacio"/"Espace"/"Пространство", `template` is "sjabloon"/"Vorlage"/"Plantilla"/"Modèle"/"Шаблон",
and so on. These are brand-specific English terms that must never be translated (see
[glossary.md](./glossary.md) / [glossary.json](./glossary.json)).

The remediation: (1) seed a canonical term set in all six `common.*.json` files, (2) replace the
localized brand-term occurrences across all 18 feature namespaces × 6 languages with the English
term while preserving the surrounding translated grammar, and (3) add a **glossary-compliance
Vitest** that fails the build if any brand term that appears in the English source is rendered in a
localized form in a target language.

**Technical approach — why not a single `sed`:** investigation showed the localized forms are
numerous, inflected, compounded, inconsistent, and ambiguous:

- One concept → multiple target words (German "Space" = *Raum* **and** *Bereich*; "Home Space" =
  *Hauptbereich*).
- Inflection & compounds (nl *ruimtepagina*, de *Raumeinstellungen*) — not token-replaceable.
- False-positive risk: es *Aviso*/*Publicación*, fr *Appel*/*Publication*, es *Diseño* also have
  generic non-brand meanings.
- Some keys are **already** English (de/nl `subspaces` = "Subspaces"), so a blind pass would be both
  incomplete and over-eager.

Therefore the replacement is **context-aware, driven off the English source**, file-by-file, and
the validation contract keys off the English value (a key whose `en` contains a brand token must
have the same English token in every target language). This is precise and low-false-positive.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (data files only — no component code)
**Primary Dependencies**: `react-i18next` / `i18next` (consume the JSON); Vitest (validation test);
optionally the Claude API for LLM-assisted per-file rewriting (per spec F2) — no new runtime deps
**Storage**: Static JSON under `src/crd/i18n/<feature>/<feature>.<lang>.json` — **108 files**
(6 languages × 18 feature namespaces) + the shared `common` namespace
**Testing**: Vitest (`pnpm vitest run`); extend the existing `*.parity.test.ts` pattern with a
glossary-compliance test
**Target Platform**: Build-time / CI gate; browser runtime consumes the JSON at i18n init
**Project Type**: Single (frontend SPA)
**Performance Goals**: N/A (static data). Validation test must run in the existing ~9s suite budget
**Constraints**: MUST preserve i18next interpolation (`{{count}}`, `$t(...)`, `<library>` tags) and
key parity across languages; English (`*.en.json`) is the source of truth; CRD i18n is **manually
maintained, not Crowdin** (so all locale files are edited directly here — see Constitution Check)
**Scale/Scope**: ~13 canonical terms × 6 languages; hundreds–thousands of occurrences. Confirmed
counts (localized brand-term hits across all CRD files): nl Space≈128 / Post≈60 / template≈129;
es Space≈252 / template≈129; fr Space≈244 / template≈134; de template≈119 / Post≈76 / VC≈56;
bg Space≈169 / template≈130 (German "Space" undercounted — also rendered as *Bereich*)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Standard | Assessment |
|---|---|
| **I. Domain-Driven Boundaries** | N/A — touches only i18n JSON data, no component/domain logic. |
| **II. React 19 Concurrency** | N/A — no rendering changes. |
| **III. GraphQL Contract Fidelity** | N/A — no GraphQL. |
| **IV. State & Side-Effect Isolation** | N/A — static data. |
| **V. Experience Quality & Safeguards** | ✅ Validation Vitest is the mandated test evidence (FR F3). No a11y/perf impact. |
| **Engineering Workflow #5 (Root Cause)** | ✅ Root cause = AI translation translated brand terms; fix = enforce glossary + add a CI gate. Not a workaround/mask. |

**⚠️ One deviation to record — Architecture Standard #3 (i18n):** the constitution says *"Only the
English source file MAY be edited directly. All other locale files are generated downstream and MUST
remain untouched."* That rule governs the **main, Crowdin-managed** namespace under
`src/core/i18n/`. The **CRD** i18n layer (`src/crd/i18n/`) is explicitly a documented exception:
per `CLAUDE.md` and `src/crd/CLAUDE.md`, CRD translations are **not** Crowdin-managed — all supported
languages (en, nl, es, bg, de, fr) are maintained directly (AI-assisted) in the same PR. Editing the
non-English CRD files is therefore expected and compliant. No mitigation task required.

**Gate result: PASS** (one justified, documented deviation; no unresolved violations).

## Project Structure

### Documentation (this feature)

```text
specs/101-translation-glossary/
├── plan.md                              # This file
├── spec.md                              # Feature spec (pre-existing)
├── glossary.md                          # Human-readable do-not-translate list (pre-existing)
├── glossary.json                        # Machine-readable consolidated glossary (pre-existing)
├── research.md                          # Phase 0 — strategy decisions
├── data-model.md                        # Phase 1 — glossary schema + per-language forbidden→canonical catalog
├── quickstart.md                        # Phase 1 — operational runbook
├── contracts/
│   └── glossary-compliance.contract.md  # Phase 1 — validation test contract
└── tasks.md                             # Phase 2 (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/crd/i18n/
├── glossary.json                        # NEW — promoted from spec folder; runtime/test source of truth (spec F1)
├── common/
│   └── common.{en,nl,es,bg,de,fr}.json  # EDIT — seed the 13 canonical term keys (English values in every lang)
├── <feature>/                           # 18 feature namespaces (space, spaceSettings, dashboard, …)
│   ├── <feature>.{en,nl,es,bg,de,fr}.json   # EDIT — replace localized brand terms with English
│   └── <feature>.glossary.test.ts       # NEW (or one shared test) — glossary-compliance gate
└── __glossary__/                         # OPTIONAL — single shared compliance test + brand-token config
    └── glossaryCompliance.test.ts
```

**Structure Decision**: No new source directories or runtime code. Work is confined to editing
JSON under `src/crd/i18n/` and adding a Vitest validation file that extends the established
`*.parity.test.ts` convention already present in `space/`, `forum/`, `documentation/`,
`profilePages/`, `contributorSettings/`.

## Scope Boundaries

**In scope (this plan):**
1. Canonical term set seeded into all 6 `common.*.json`.
2. One-time remediation of all existing CRD locale files so brand terms render in English.
3. A glossary-compliance Vitest (CI gate) keyed off the English source.
4. Promoting `glossary.json` into `src/crd/i18n/` as the single machine-readable source.

**Out of scope (deferred to the broader spec):**
- Automated CI job that *translates new English strings* on commit (spec F2 trigger automation).
- Product-team glossary review/ownership workflow (spec F5).
- Backfill of legacy MUI (`src/core/i18n/`) translations — CRD only (spec "Out of Scope").
- Expanding the glossary beyond the 13 terms reverted in commit `ed03141` + the spec draft.

## Complexity Tracking

> No unjustified constitution violations. The single deviation (editing non-English CRD locale
> files) is justified above and requires no mitigation task.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Edit non-English CRD locale files directly | CRD i18n is manually maintained, not Crowdin-generated | Crowdin pipeline does not cover `src/crd/i18n/`; there is no "downstream" generator to defer to |
| Context-aware rewrite instead of one global `sed` | Inflection, compounds, multi-form terms, false positives | A blanket regex would mistranslate generic words (es *Aviso*, fr *Appel*) and miss inflected/compound forms |
