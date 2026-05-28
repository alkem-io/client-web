# Phase 0 Research: CRD Translation Glossary Remediation

All decisions below are grounded in the actual state of `src/crd/i18n/` on this branch
(`translations-nl-2`), inspected during planning. Key empirical findings are cited inline.

---

## D1. Replacement strategy: context-aware, English-source-driven (NOT a global regex)

**Decision.** Replace localized brand terms file-by-file using a context-aware rewrite that is
**driven off the English source value** for each key, not by blindly scanning target files for a
list of localized words.

**Rationale.** Investigation showed a blanket find/replace is both unsafe and incomplete:

- **One concept → multiple target words.** German renders "Space" as *Raum* **and** *Bereich*
  (`banner.homeSpace`: en "Home Space" → de "Hauptbereich"). A regex for *Raum* misses *Bereich*.
- **Inflection & compounds.** nl *ruimtepagina* / *Hoofdruimte*, de *Raumeinstellungen* — the brand
  term is fused into a larger word; token replacement breaks the compound.
- **False positives.** es *Aviso* (notice), fr *Appel* (call), es *Diseño* (design), fr
  *Publication* — these localized callout/layout/post words also carry generic meanings; replacing
  every occurrence would corrupt unrelated strings.
- **Already-correct keys.** `spaceSettings.tabs.subspaces` is already "Subspaces" in nl **and** de
  but localized in es/fr/bg — a global pass would have nothing to fix in some files and must not
  touch them.

**Mechanism.** For each leaf key whose **`en`** value contains a brand token, rewrite the target so
the same English token appears, preserving the rest of the (translated) sentence and any
interpolation. This naturally handles the Callout→Post mapping because `en` already stores "Post".

**Alternatives considered.**
- *Single `sed`/jq over all files* — rejected (above).
- *Per-language deny-list regex with allow-list exceptions* — rejected as primary: maintaining
  per-language inflection regexes + exception lists is more fragile than keying off `en`. Retained
  only as a **candidate-finder** to locate keys needing review (see D6).

---

## D2. Execution: LLM-assisted per-file rewrite, batched by feature namespace

**Decision.** Perform the rewrite one feature namespace at a time (18 batches), each batch covering
its 5 non-English files (nl, es, bg, de, fr). For each file, an LLM (Claude — spec F2) receives the
glossary + the English source + the target file and returns the target with brand terms in English
and grammar preserved. Each batch's diff is reviewed and validated (D4) before moving on.

**Rationale.** The volume (hundreds–thousands of occurrences) makes purely manual edits impractical,
while context understanding (inflection, compounds, false-positive avoidance, Cyrillic) is exactly
what an LLM constrained by the glossary handles well — and it matches the spec's chosen integration
method (F2: "Claude API with glossary in system prompt"). Batching by namespace keeps diffs
reviewable and lets the compliance test localize failures.

**Alternatives considered.**
- *All 90 files in one shot* — rejected: unreviewable diff, hard to bisect failures.
- *Fully manual* — rejected: not viable at this volume; error-prone for bg Cyrillic declensions.

---

## D3. Canonical terms in `common.*.json` + the `$t()` namespace nuance

**Decision.** Seed the full 13-term canonical set (from [glossary.json](./glossary.json)) into all
six `common.*.json` files with **English values in every language**. Promote `glossary.json` to
`src/crd/i18n/glossary.json` as the machine-readable source for the test and future tooling.

**Critical nuance discovered.** The existing 72 `$t(common.callout)` / `$t(common.Callout)`
references in the `space` namespace do **not** resolve to the shared `crd-common` namespace — they
resolve to a **local `common` block inside the `space` feature file** (i18next resolves `$t(key)`
within the current namespace). The shared `common` files currently define only `space`, `spaces`,
`subspace`. Therefore:

- Seeding new keys into shared `common.*.json` does **not** automatically make `$t(common.template)`
  work inside feature files — that would resolve to a (non-existent) local `common.template`.
- To reference the shared glossary from a feature file you must use the namespace-qualified form
  `$t(crd-common:template)`.

**Consequence for this remediation.** Converting existing strings to `$t(...)` interpolation is an
**optional optimization**, not required for correctness. The remediation's job is that the
*rendered* term is English. Hardcoding the English term in each locale value already satisfies the
glossary. We will therefore: (a) make the values correct (required), and (b) leave existing local
`common.callout` blocks intact (they already map Callout→Post once corrected). Broad migration to
`$t(crd-common:*)` is deferred — it is a refactor, not a translation fix.

**Alternatives considered.**
- *Force all terms through `$t(crd-common:*)` now* — rejected: large mechanical refactor across 90
  files, orthogonal to the glossary fix, and risks breaking interpolation. Out of scope (see plan).

---

## D4. Validation contract: brand-token presence parity vs. the English source

**Decision.** Add a Vitest that, for each feature namespace, walks every leaf key and asserts:

> For each brand token `T` in the configured set, if the `en` value contains `T` (word-boundary,
> case-insensitive for `template`), then every target-language value for that key MUST also contain
> `T`.

Brand token set: `Space`, `Spaces`, `Subspace`, `Subspaces`, `Post`, `Posts`, `Layout`,
`Virtual Contributor`, `Virtual Contributors`, `template`, `templates`. (Callout/Callouts need no
token — `en` already stores "Post"/"Posts", so the rule enforces them transitively.)

**Rationale.** Keying off the **English source** makes the check precise and self-maintaining:
it never flags a target string for a brand word the English source didn't use, eliminating the
*Aviso*/*Appel*/*Diseño* false-positive class. It also rides on the existing key-parity guarantee
(`*.parity.test.ts`) so en/target keys line up. Fails the build → satisfies spec F3 (strict CI gate).

**Edge handling.**
- **Substring traps** (e.g., "Spacer", "templated"): match on word boundaries.
- **Legitimate non-repetition** (rare: an `en` label uses "Space" but a natural translation drops
  it): a small per-key allowlist keyed by `namespace:keyPath:token`, each entry commented with why.
- **Case:** brand nouns compared case-sensitively (Space/Post/Layout/VC); `template`/`templates`
  compared case-insensitively (preferred term, lowercase mid-sentence, capitalized standalone).

**Alternatives considered.**
- *Scan targets for a denylist of localized words* — rejected: per-language, inflection-sensitive,
  high false positives, never "done".
- *Snapshot tests* — rejected: don't express the actual invariant; noisy on legitimate edits.

---

## D5. Language-specific catalog (reference for reviewers), incl. German's two Space words

**Decision.** Maintain a per-language "forbidden → canonical" catalog in
[data-model.md](./data-model.md) as a **review aid** (what the localized forms look like), explicitly
**not** as the regex source of truth (that role belongs to D4's English-driven check).

**Rationale.** Confirmed localized forms (sampled from real files):

| Term | nl | de | es | fr | bg |
|------|----|----|----|----|----|
| Space | Ruimte | Raum **/ Bereich** | Espacio | Espace | Пространство |
| Subspace | Subruimte | Unterraum | Subespacio | Sous-espace | Подпространство |
| Post (Callout) | Bericht / Oproep | Beitrag / Aufruf | Aviso / Publicación | Appel / Publication | Известие |
| template | sjabloon | Vorlage | Plantilla | Modèle | Шаблон |
| Layout | Indeling | Layout *(already EN)* | Diseño | Mise en page | Оформление |
| Virtual Contributor | Virtuele bijdrager | Virtuelle Mitwirkende | Colaborador virtual | Contributeur virtuel | Виртуален сътрудник |

The German *Raum/Bereich* split and the already-English cells (de Layout, de/nl Subspaces) are the
reason the catalog is advisory and the **English-source check is authoritative**.

---

## D6. Ordering & dependencies

**Decision.** Sequence: (1) write the compliance test + promote `glossary.json` (test goes **red**
first — TDD), (2) seed `common.*.json`, (3) remediate feature namespaces one at a time until the
test goes green, (4) run full `pnpm vitest run` + `pnpm lint`.

**Rationale.** Writing the failing test first (Constitution V / TDD) gives an objective, per-key
definition of "done" and a live count of remaining violations to drive the batch work. Key-parity
tests already exist for some namespaces; the new check assumes parity, so parity tests run first.

---

## Open questions (none blocking)

- **Promote `glossary.json` location:** spec F1 says `src/crd/i18n/glossary.json`. Confirmed as the
  test's import source. (No clarification needed — following the spec.)
- **Allowlist seed:** expected to be empty or near-empty; populate only if D4 surfaces a genuine
  natural-translation drop during remediation.
