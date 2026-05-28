# Quickstart: Running the CRD Glossary Remediation

Operational runbook for executing the search & replace and validating it. Order matters — the
validation test is written **first** (red), then made green by the remediation.

## Prerequisites

- Node 24.14.0 / pnpm (per repo). `pnpm install` done.
- You are on the feature branch for this work.
- Reference open: [glossary.md](./glossary.md), [data-model.md](./data-model.md),
  [contracts/glossary-compliance.contract.md](./contracts/glossary-compliance.contract.md).

## Step 0 — Promote the glossary

Copy the consolidated glossary into the source tree so the test (and future tooling) can import it:

```bash
cp specs/101-translation-glossary/glossary.json src/crd/i18n/glossary.json
```

## Step 1 — Write the compliance test FIRST (expect RED)

Create `src/crd/i18n/__glossary__/glossaryCompliance.test.ts` per the contract. Run it and confirm
it **fails**, with violations across nl/es/bg/de/fr — this is the live worklist:

```bash
pnpm vitest run src/crd/i18n/__glossary__/glossaryCompliance.test.ts --reporter=basic
```

If it passes immediately, the token set or key wiring is wrong — investigate before proceeding.

## Step 2 — Seed canonical terms in `common.*.json`

Add the 13 canonical keys (data-model.md "Canonical Term Set") to all six common files, English
values in every language:

```bash
# edit each: src/crd/i18n/common/common.{en,nl,es,bg,de,fr}.json
```

Keep existing keys; just add the missing canonical ones (`subspaces`, `post`, `posts`, `callout`,
`callouts`, `template`, `templates`, `layout`, `virtualContributor`, `virtualContributors`) and set
`space`/`spaces`/`subspace` to English in nl/de/es/fr/bg.

## Step 3 — Remediate feature namespaces, one at a time

For each of the 18 namespaces, fix its 5 non-English files. Use the English source as the oracle:

1. **Find candidates** in a namespace (advisory finder — confirm against `en`, don't auto-apply):

   ```bash
   # example: Spanish "template" forms in spaceSettings
   grep -nE 'Plantilla|Diseño|Espacio|Subespacio|Aviso|Colaborador virtual' \
     src/crd/i18n/spaceSettings/spaceSettings.es.json
   ```

2. **Rewrite** (LLM-assisted per spec F2, or manual): for every key whose `en` value contains a
   brand token, ensure the target value contains the same English token, preserving the rest of the
   translated sentence, compounds (`Space-pagina`), interpolation (`{{count}}`, `$t(...)`, `<tag>`),
   and casing (capitalize `template`→`Template` when standalone).

3. **Re-run the test for that namespace** and confirm its violations clear:

   ```bash
   pnpm vitest run src/crd/i18n/__glossary__/glossaryCompliance.test.ts --reporter=basic
   ```

Suggested order (richest first, so the hardest cases surface early): `spaceSettings`, `space`,
`subspace`, `dashboard`, `exploreSpaces`, `search`, `profilePages`, `templates`, then the remainder.

## Step 4 — Full validation

```bash
pnpm vitest run                 # all i18n parity + glossary compliance green
pnpm lint                       # Biome/ESLint/TS clean
```

The full suite is ~9s / ~595 tests; the new test should add negligible time.

## Step 5 — Sanity-check interpolation didn't break

Spot-check a few rewritten strings still have intact placeholders and `$t(...)` refs:

```bash
grep -rn '\$t(common\.' src/crd/i18n/space/space.*.json   # should still resolve (local common block)
grep -rnE '\{\{[a-zA-Z]+\}\}' src/crd/i18n/spaceSettings/*.json | head
```

## Definition of done

- [ ] `src/crd/i18n/glossary.json` present.
- [ ] All six `common.*.json` carry the 13 canonical keys with English values.
- [ ] Glossary-compliance test is **green** for all 18 namespaces × nl/es/bg/de/fr.
- [ ] Allowlist is empty (or every entry has a justification comment).
- [ ] `pnpm vitest run` and `pnpm lint` pass.
- [ ] Diffs reviewed per namespace; no interpolation/placeholder regressions.

## Rollback

Pure data + one test file. Revert the JSON edits and delete the test/`glossary.json` to fully undo;
no runtime, schema, or dependency changes are involved.
