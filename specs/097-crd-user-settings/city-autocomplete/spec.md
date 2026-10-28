# Sub-spec: City autocomplete on every Location field

**Parent**: [`097-crd-user-settings`](../spec.md) — User Settings → Profile → About You → Location
(first surface). Also applies to the Space / Subspace About Location section owned by
[`045-crd-space-settings`](../../045-crd-space-settings/spec.md).
**Created**: 2026-10-28
**Branch**: `feat/profile-city-autocomplete`

## Goal

Every **City** input that sits next to a Country combobox suggests well-known cities as the user types. Picking a
suggestion fills the city **and** selects its country in the Country combobox. The input stays a
free-text field: the user can type and save any value, suggested or not.

## Decisions

- **Free text first.** The city value is whatever is in the input. Suggestions only help the user
  type it. If nothing matches, no list is shown, and typing does nothing to the Country field.
- **Selecting a suggestion sets both fields.** `city` takes the suggestion's localized name, and
  `country` takes the suggestion's ISO code. This replaces any country chosen earlier, because the
  user picked a city in that country.
- **Curated, translated data set.** The list holds every capital of a country in the existing
  `COUNTRIES` list, all 50 US state capitals, and the 2–3 largest or best-known cities of each European
  country. The platform's focus countries get deeper coverage: the Netherlands, France, Spain,
  Bulgaria, Germany and Belgium each have their 16–26 main cities (≈ 470 entries in total). Countries that are missing from `COUNTRIES` (Serbia, Montenegro, Kosovo,
  South Sudan) are left out, because their cities could not set a country. Fixing the country list
  is out of scope.
- **The data is a CRD i18n namespace, `crd-cities`.** It lives in
  `src/crd/i18n/cities/cities.<lang>.json` for all six languages. Each file maps a country code to
  city IDs, and each city ID to its localized name (`{ "ES": { "madrid": "Madrid" } }`). The country
  comes from the group key, so it is never translated. Key parity across the six languages is
  checked by a test, as for every other CRD namespace.
- **Lazy, and kept out of the main bundle.** The namespace is registered in the lazy i18n backend
  (`crdNamespaceImports`) and is loaded the **first time the City input gets focus**, not when the
  tab mounts. Each language file is its own dynamic-import chunk. It is reloaded when the UI
  language changes, and missing names fall back to English.
- **Matching** ignores case and accents (`Zurich` finds `Zürich`, `sao` finds `São Paulo`). It starts
  after one typed character. Names that start with the query rank above names that only contain it.
  At most 8 suggestions are shown, and each one shows its country name as context.
- **Accessibility (WCAG 2.1 AA):** the input is an ARIA 1.2 combobox (`role="combobox"`,
  `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`), and the
  list is a `listbox` of `option`s. Arrow Up/Down move through the options. Enter picks the active
  option, and only while one is active, so the form never swallows Enter otherwise. Escape closes the
  list. Moving focus away closes it. Clicking an option does not blur the input.

## Functional requirements

- **FR-CA-1**: Every City input paired with a Country combobox MUST offer matching city suggestions
  from the curated data set while the user types, without restricting the value to a suggestion.
  The surfaces are:
  - User Settings → Profile → About You → Location (`UserProfileTabView`)
  - Space and Subspace Settings → About → Location (`SpaceSettingsAboutView`, all levels)
  - Organization Settings → Profile → About → Location (`OrgProfileTabView`)
  - the admin Organization form, edit mode only, because create mode has no Location section
    (`OrganizationForm`)
  - the admin User edit form (`UserEditForm`)
- **FR-CA-2**: Choosing a suggestion MUST set `city` to the localized city name and `country` to
  the city's ISO country code. Each surface buffers this as it buffers any other edit, as one
  `{ city, country }` patch (Profile / About tabs: their unsaved-changes bar; admin forms: their
  form state until Save).
  Both count as changed fields when they differ from the server value.
- **FR-CA-3**: The city data MUST NOT be part of the main bundle. It MUST be fetched only when the
  City input first receives focus, in the active UI language, with an English fallback.
- **FR-CA-4**: City names MUST be translated in en, nl, es, bg, de and fr, with key parity enforced
  by a test.
- **FR-CA-5**: The presentational component (`@/crd/components/common/CityAutocompleteInput`)
  MUST follow the CRD rules. It receives plain options and `on*` callbacks as props and does no
  loading itself. Each view gets optional `cityOptions` and `onCityFocus` props. The loading lives
  in one shared integration hook, `src/main/crdPages/utils/useCityOptions.ts`. Each surface's page
  calls it and passes the result down.

## Acceptance scenarios

1. **Given** an empty City field, **When** the user types `ams`, **Then** "Amsterdam (Netherlands)"
   is suggested, and choosing it sets City = "Amsterdam" and Country = Netherlands.
2. **Given** the UI language is Spanish, **When** the user types `lond`, **Then** "Londres" is
   suggested, and choosing it sets City = "Londres" and Country = United Kingdom.
3. **Given** the user types `Smallville`, **When** no city matches, **Then** no list is shown, the
   field keeps "Smallville", and the Country field is unchanged.
4. **Given** the Profile tab is open and the City input has never had focus, **Then** no
   `cities.*.json` chunk has been requested.

## Edge cases

- Data still loading when the user types: no list is shown yet. It appears on the next keystroke
  after loading finishes, and typing is never blocked.
- If the chunk fails to load (offline), the input works as a plain text field.
- The settings page's `disabled` state (while saving) disables the input and closes the list.

## Out of scope

- The VC Profile, which has no Location field.
- Free-text event locations (Timeline `EventForm`), which have no country to pair with.
- A full geographic database, geocoding, or storing coordinates.
- Translating country names. `COUNTRIES` is still English-only.
