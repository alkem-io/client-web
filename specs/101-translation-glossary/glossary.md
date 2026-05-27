# Translation Glossary — Do-Not-Translate Platform Terms

## Purpose

A set of Alkemio platform terms are **brand-specific English words** and must **never be
translated** into Dutch (or any other language). They stay in English regardless of the target
locale; only the surrounding sentence is translated and grammatically inflected around them.

This list consolidates two sources:

1. **Commit `ed03141e`** on branch `translations-NL` ("fix(i18n): enforce platform term convention
   in CRD Dutch translations"), which reverted these terms back to English across every
   `src/crd/i18n/**/*.nl.json` file and added canonical term keys to `common.en.json` /
   `common.nl.json`. This is authoritative for what is **actually enforced** today.
2. The **"Initial Glossary Draft"** in [`spec.md`](./spec.md), which contributed the `de`
   translations, the locked/preferred status distinction, and the rationales.

The machine-readable version (spec F1 format) is [`glossary.json`](./glossary.json); this file is
the human-readable companion.

> **Reconciliation note:** the spec's Initial Glossary Draft was **missing `Space`, `Spaces`, and
> `Subspace` (singular)** — even though "Space → ruimte" is the headline example in its own Problem
> Statement. Those three are present in the commit and have been added to the consolidated list.

Scope today is **CRD translations** (`src/crd/i18n/**`). The terms themselves are platform-wide
brand vocabulary, so the same rule applies to any new language file.

## The terms

These are the canonical platform terms (as stored in `src/crd/i18n/common/common.*.json`). The
"Reverted Dutch" column shows the (now-forbidden) translations that the commit removed, so
translators recognize what to avoid.

| Key (`common.*`)       | Canonical English      | Forbidden Dutch translation (reverted) |
| ---------------------- | ---------------------- | -------------------------------------- |
| `space`                | Space                  | Ruimte                                 |
| `spaces`               | Spaces                 | Ruimtes                                |
| `subspace`             | Subspace               | Subruimte                              |
| `subspaces`            | Subspaces              | Subruimtes                             |
| `post`                 | Post                   | Bericht                                |
| `posts`                | Posts                  | Berichten                              |
| `callout`              | Post                   | Oproep / oproep                        |
| `callouts`             | Posts                  | Oproepen / oproepen                    |
| `template`             | template *(lowercase)* | sjabloon                               |
| `templates`            | templates *(lowercase)*| sjablonen                              |
| `layout`               | Layout                 | Indeling                               |
| `virtualContributor`   | Virtual Contributor    | Virtuele bijdrager                     |
| `virtualContributors`  | Virtual Contributors   | Virtuele bijdragers                    |

### Notes on individual terms

- **Space / Subspace** — never "Ruimte" / "Subruimte". Capitalized in all positions
  (it is a proper brand noun).
- **Post** — this is the user-facing name for what the data layer calls a **Callout**. So both
  `post` and `callout` resolve to **"Post"**, and `callouts` resolves to **"Posts"**. Never
  "Bericht" or "Oproep".
- **template / templates** — the `common.*` keys are intentionally **lowercase** so they read
  naturally mid-sentence via interpolation. When a Template label stands alone (a tab title, a
  dialog heading, a button), capitalize it: **"Template"**, **"Templates"**. Never "sjabloon".
- **Layout** — never "Indeling".
- **Virtual Contributor(s)** — never "Virtuele bijdrager(s)". Capitalized.

## Inflection & compounds

Keep the English term and build the Dutch grammar around it, usually with a hyphen for compounds.
Real examples from the commit:

| Concept                    | ✅ Correct (English term kept)      | ❌ Reverted Dutch            |
| -------------------------- | ----------------------------------- | --------------------------- |
| Home space                 | Home Space                          | Hoofdruimte / thuisruimte   |
| Space members              | Leden van de Space / Space-leden    | Leden van de ruimte         |
| Space page                 | Space-pagina                        | ruimtepagina                |
| Space card                 | Space-kaart                         | ruimtekaart                 |
| Space name                 | Naam van de Space / Space-naam      | ruimtenaam                  |
| Space subscription/plan    | Space-abonnement                    | ruimteabonnement            |
| Remove from Space          | Uit Space verwijderen               | Uit Ruimte verwijderen      |
| Default subspace template  | Standaard subspace-template         | Standaard subspace-sjabloon |
| Space template             | Space-template                      | ruimtesjabloon              |
| Default post template      | Standaard publicatietemplate        | Standaard publicatiesjabloon|
| Template description       | Templatebeschrijving                | Sjabloonbeschrijving        |
| Template library           | templatebibliotheek                 | sjabloonbibliotheek         |
| Post index                 | Post-index                          | Berichtenindex              |
| Post actions               | Post-acties                         | Calloutacties               |
| Layout changes             | layout-wijzigingen                  | indelingswijzigingen        |
| Save as template           | Opslaan als template                | Opslaan als sjabloon        |

Rule of thumb: **translate the surrounding words, never the brand term.** When a brand term
combines with a Dutch word, prefer a hyphenated compound (`Space-leden`, `subspace-template`,
`Post-index`).

## How it's enforced in code (`$t(common.*)` interpolation)

The canonical terms live in `src/crd/i18n/common/common.en.json` and `common.nl.json` (identical
values, since the terms are English in both). Other keys reference them through i18next nesting so
the term is defined in exactly one place:

```json
"saveFailed": "De $t(common.callout) kon niet worden verwijderd. Probeer het opnieuw."
```

When you add or translate a string that contains one of these terms, prefer
`$t(common.<term>)` interpolation over hardcoding the word, so a future wording change to a term
only has to happen once.

## Sources

- **Commit:** `ed03141e3f11891bbadb8d64918691b47c87d89e` on branch `translations-NL`
  - Files touched: `common`, `dashboard`, `exploreSpaces`, `layout`, `profilePages`, `search`,
    `space`, `spaceSettings`, `subspace` (all `.nl.json`, plus `common.en.json`)
- **Spec:** [`spec.md`](./spec.md) → "Initial Glossary Draft" section
- **Consolidated data:** [`glossary.json`](./glossary.json) (13 terms; 11 locked, 2 preferred)
