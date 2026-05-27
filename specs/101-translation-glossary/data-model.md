# Phase 1 Data Model: Glossary & Term Catalog

This "data model" describes the data this feature operates on: the glossary entry schema, the
canonical term set, the brand-token set used by the validation contract, and the advisory
per-language catalog of localized forms to look for during remediation.

---

## Entity: Glossary Entry

Source of truth: [glossary.json](./glossary.json) (to be promoted to `src/crd/i18n/glossary.json`).
Schema follows spec.md F1 / Key Entities.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `term` | string | yes | The English term being controlled (e.g., "Space", "Callout"). |
| `status` | `"locked"` \| `"preferred"` | yes | `locked` = must be identical; `preferred` = strongly encouraged (template/templates). |
| `translations` | `{ [lang]: string }` | yes | Target per language. For these terms the value is the **same English word** in every language. |
| `rationale` | string | yes | Why the term is controlled. |
| `addedDate` | ISO 8601 date | yes | Provenance. |
| `source` | string | yes (this repo) | `commit:ed03141`, `spec:draft`, or both. |
| `notes` | string | optional | e.g., casing rules for `template`. |

**Validation rules**
- `term` unique within the glossary.
- For every entry, `translations[lang]` is identical across all supported langs (these terms do not
  transliterate). The `Callout`/`Callouts` entries are the deliberate exception: their `term` is the
  legacy/data-layer word but every `translations[*]` value is "Post"/"Posts".
- `status` ∈ {locked, preferred}.

---

## Canonical Term Set (13 terms)

The English value that MUST appear in every language. Stored in `common.*.json` (English in all six).

| Key (`common.*`) | English value | Status |
|------------------|---------------|--------|
| `space` | Space | locked |
| `spaces` | Spaces | locked |
| `subspace` | Subspace | locked |
| `subspaces` | Subspaces | locked |
| `post` | Post | locked |
| `posts` | Posts | locked |
| `callout` | Post | locked |
| `callouts` | Posts | locked |
| `template` | template | preferred |
| `templates` | templates | preferred |
| `layout` | Layout | locked |
| `virtualContributor` | Virtual Contributor | locked |
| `virtualContributors` | Virtual Contributors | locked |

> **Casing:** brand nouns are capitalized everywhere. `template`/`templates` are stored lowercase for
> mid-sentence interpolation; capitalize ("Template"/"Templates") when standalone (tab title, heading,
> button). The `Callout`→"Post" mapping means any source string already shows "Post" in `en`.

---

## Brand-Token Set (drives the validation contract — D4)

The validation test (see [contracts/glossary-compliance.contract.md](./contracts/glossary-compliance.contract.md))
checks these tokens against the English source per key. Order longest-first so "Virtual Contributors"
matches before "Virtual Contributor", "Subspaces" before "Subspace", etc.

```jsonc
[
  { "token": "Virtual Contributors", "caseSensitive": true },
  { "token": "Virtual Contributor",  "caseSensitive": true },
  { "token": "Subspaces",            "caseSensitive": true },
  { "token": "Subspace",             "caseSensitive": true },
  { "token": "Spaces",               "caseSensitive": true },
  { "token": "Space",                "caseSensitive": true },  // matches "Home Space", "Space-pagina"
  { "token": "Posts",                "caseSensitive": true },
  { "token": "Post",                 "caseSensitive": true },
  { "token": "Layout",               "caseSensitive": true },
  { "token": "templates",            "caseSensitive": false },
  { "token": "template",             "caseSensitive": false }
]
```

`Callout`/`Callouts` are intentionally **not** tokens: the English source already renders them as
"Post"/"Posts", so the "Post"/"Posts" tokens enforce them transitively. Match every token on word
boundaries to avoid substring traps ("Spacer", "templated").

---

## Advisory Catalog: localized forms to remediate (per language)

**This catalog is a review aid, not the matcher.** The authoritative rule is the English-source
check (D4). Forms below were sampled from the actual files; expect inflections/compounds beyond what
is listed. "—/EN" means some keys are already correct in that language.

### Space / Spaces / Subspace / Subspaces
| lang | Space | Spaces | Subspace | Subspaces | Notable compounds |
|------|-------|--------|----------|-----------|-------------------|
| nl | Ruimte | Ruimtes | Subruimte | Subruimtes / *EN* | Hoofdruimte, ruimtepagina, ruimtekaart, ruimtenaam |
| de | Raum **/ Bereich** | Räume / Bereiche | Unterraum | Unterräume / *EN* | Hauptbereich, Raumeinstellungen |
| es | Espacio | Espacios | Subespacio | Subespacios | Espacio principal |
| fr | Espace | Espaces | Sous-espace | Sous-espaces | Espace principal |
| bg | Пространство | Пространства | Подпространство | Подпространства | Начално пространство (+ case forms) |

### Post / Posts (incl. Callout→Post)
| lang | Post | Posts | Callout | Callouts |
|------|------|-------|---------|----------|
| nl | Bericht | Berichten | Oproep | Oproepen |
| de | Beitrag | Beiträge | Aufruf | Aufrufe |
| es | Publicación / Entrada | Publicaciones | Aviso | Avisos |
| fr | Publication | Publications | Appel | Appels |
| bg | Публикация | Публикации | Известие | Известия |

> ⚠️ es *Aviso*/*Publicación*, fr *Appel*/*Publication*, es *Entrada* also mean generic
> notice/publication/call/entry. **Only** rewrite where the English source has Post/Posts.

### template / templates
| lang | template | templates |
|------|----------|-----------|
| nl | sjabloon (Sjabloon) | sjablonen (Sjablonen) |
| de | Vorlage | Vorlagen |
| es | Plantilla | Plantillas |
| fr | Modèle (gabarit) | Modèles |
| bg | Шаблон | Шаблони |

### Layout
| lang | Layout |
|------|--------|
| nl | Indeling (indelingswijzigingen) |
| de | Layout *(already EN — verify)* |
| es | Diseño / Disposición |
| fr | Mise en page / Disposition / Agencement |
| bg | Оформление |

### Virtual Contributor / Virtual Contributors
| lang | singular | plural |
|------|----------|--------|
| nl | Virtuele bijdrager | Virtuele bijdragers |
| de | Virtueller Mitwirkender | Virtuelle Mitwirkende |
| es | Colaborador virtual (Contribuidor virtual) | Colaboradores virtuales |
| fr | Contributeur virtuel | Contributeurs virtuels |
| bg | Виртуален сътрудник | Виртуални сътрудници |

---

## Files in scope

- **Edit:** `src/crd/i18n/common/common.{en,nl,es,bg,de,fr}.json` (seed 13 canonical keys).
- **Edit:** `src/crd/i18n/<feature>/<feature>.{nl,es,bg,de,fr}.json` for all 18 feature namespaces
  (`common`, `community`, `contributorSettings`, `dashboard`, `documentation`, `error`,
  `exploreSpaces`, `forum`, `layout`, `markdown`, `notifications`, `profilePages`, `search`,
  `space`, `spaceSettings`, `subspace`, `templates`, `whiteboard`). English files are the source —
  edit only if an English value itself drifts from a canonical term.
- **Add:** `src/crd/i18n/glossary.json` (promoted) + the glossary-compliance Vitest.
