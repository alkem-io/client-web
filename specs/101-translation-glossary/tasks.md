# Tasks: CRD Translation Glossary — NL Reversion

**Feature**: 101-translation-glossary | **Plan**: [plan.md](./plan.md)

## Scope (narrowed per user direction)

This is effectively **one task**: put the English brand terms back in the **Dutch** CRD translation
files — the same thing commit `ed03141` did on `translations-NL`, applied here and extended to the
NL files that commit didn't cover. The broader plan's 6-language sweep and the glossary-compliance
test harness are **not** part of this tasks list (deferred). Languages other than NL are untouched.

**Glossary of what to put back** (NL localized form → English): `Ruimte`→Space, `Ruimtes`→Spaces,
`Subruimte`→Subspace, `Subruimtes`→Subspaces, `Bericht`/`Oproep`→Post, `Berichten`/`Oproepen`→Posts,
`sjabloon`→template, `sjablonen`→templates, `Indeling`→Layout, `Virtuele bijdrager(s)`→Virtual
Contributor(s). Compounds keep the English term and the Dutch grammar around it (`Hoofdruimte`→
"Home Space", `ruimtepagina`→"Space-pagina", `Berichtenindex`→"Post-index"). Full reference:
[glossary.md](./glossary.md), [data-model.md](./data-model.md) (NL column).

---

## Phase 1: The reversion

- [ ] T001 [US1] Replace every localized brand term with its English form across all 12 Dutch CRD translation files: `src/crd/i18n/common/common.nl.json`, `src/crd/i18n/community/community.nl.json`, `src/crd/i18n/contributorSettings/contributorSettings.nl.json`, `src/crd/i18n/dashboard/dashboard.nl.json`, `src/crd/i18n/exploreSpaces/exploreSpaces.nl.json`, `src/crd/i18n/layout/layout.nl.json`, `src/crd/i18n/profilePages/profilePages.nl.json`, `src/crd/i18n/search/search.nl.json`, `src/crd/i18n/space/space.nl.json`, `src/crd/i18n/spaceSettings/spaceSettings.nl.json`, `src/crd/i18n/subspace/subspace.nl.json`, `src/crd/i18n/templates/templates.nl.json`. Use the glossary mapping above; keep the surrounding Dutch grammar, compounds (hyphenated: `Space-leden`, `subspace-template`), placeholders (`{{count}}`), HTML tags (`<library>`), and existing `$t(common.*)` references intact. In `space.nl.json` the local `common` block (`Callout`/`callout`/`Callouts`/`callouts`) must map to `Post`/`post`/`Posts`/`posts`. Do NOT touch en/es/bg/de/fr files.

## Phase 2: Verify

- [ ] T002 Verify no localized brand terms remain in NL CRD files and nothing broke: `grep -rnE 'Ruimte|ruimte|Subruimte|Bericht|bericht|Oproep|oproep|[Ss]jabloon|Indeling|indeling|[Vv]irtuele bijdrager' src/crd/i18n --include="*.nl.json"` returns no real hits (review any survivors — a few may be legitimate non-brand words), then run `pnpm vitest run` (i18n key-parity tests stay green — JSON valid, no keys added/removed) and `pnpm lint`.

---

## Dependencies

- T002 depends on T001.

## Notes

- **Why not a cherry-pick of `ed03141`:** that commit predates 3 of these namespaces
  (`community`, `contributorSettings`, `templates`) and the branches have diverged, so applying the
  glossary semantically to the current NL files is more complete than replaying the old diff.
- **Optional extension (only if you want to mirror the commit fully):** `ed03141` also *added*
  canonical term keys (`post`, `callout`, `template`, `layout`, `virtualContributor`, …) to
  `common.en.json` / `common.nl.json` for `$t(common.*)` reuse. Not required for the visible
  reversion; fold into T001 only if desired.

## MVP

T001 alone is the deliverable. T002 is a 1-minute safety check.
