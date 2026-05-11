# Feature Specification: CRD Templates System

**Feature Branch**: `098-crd-templates`
**Created**: 2026-05-11
**Status**: Draft
**Input**: User description: "Implement TEMPLATES — everything that has to do with templates: CRUD of templates; using templates when creating callouts, spaces, whiteboards, community guidelines (and more); creating and updating Innovation Packs and the templates inside spaces (the two 'template holders' — Spaces and Innovation Packs — behave almost the same today, with small differences we want to remove in the new UI); all the templates dialogs. Analyse how it's implemented in MUI and re-implement the Templates system in the CRD design system (shadcn/ui + Tailwind)."

## Context & Background

Templates are reusable, pre-configured definitions that let a creator start a new piece of content from a known-good starting point instead of from scratch. Alkemio has **five template types**:

| Type | What it pre-configures |
|---|---|
| **Callout** ("Collaboration tool" template) | A callout's framing (its kind — text/whiteboard/memo/link/media-gallery — plus the framing content), its contribution settings (which contribution types are allowed, comment settings), and the default content for new contributions (default post description, default whiteboard drawing). |
| **Whiteboard** | A whiteboard drawing plus its preview settings. |
| **Post** | A default post description (rich text). |
| **Space** ("Space content" template) | A space's structure: innovation-flow phases, starter callouts, nested subspace templates, and collaboration settings. Can be authored by copying an existing space. |
| **Community Guidelines** | Community-guidelines text plus a set of reference links. |

Every template lives in exactly one **templates set**, which is owned by a **template holder**. There are two kinds of holder today, and they behave almost identically:

1. **A Space** — owns a templates set via its *templates manager* (the templates manager also stores per-type *template defaults*: the template auto-suggested when, e.g., a member creates a subspace or a new post in a phase). Managed from **Space Settings → Templates**.
2. **An Innovation Pack** — a packaged, shareable holder with its own profile (name, description, avatar, tags, references), a *provider* organisation, a store-listing flag and a search-visibility setting. Managed from the **Innovation Pack admin** screen. Innovation Packs exist both at the **platform level** (curated, in `/admin/innovation-packs`) and at the **account level** (a user's account can own its own packs).

A third surface, the **Innovation Library** (`/innovation-library`), is a public catalogue — it aggregates all store-listed Innovation Packs and the union of their templates into a browsable, filterable gallery. It is *not* a holder (read-only).

Templates are **consumed** in many places: the callout-creation dialog ("use a template"), the whiteboard-creation flow, the space/subspace-creation flow (and the per-space "default subspace template"), the community-guidelines editor, the innovation-flow phase settings ("default callout template for this phase"), and the callout contribution-defaults settings ("default post template"). Every one of these uses the same underlying **template picker** dialog, which shows candidate templates drawn from up to three sources: the current Space's templates set, the current account's Innovation Packs, and the public platform library.

The legacy implementation is built on Material UI. This feature **re-implements the whole Templates system on the CRD design system** (shadcn/ui + Tailwind), behind the existing CRD feature toggle (`alkemio-crd-enabled`, default OFF). The legacy MUI templates surfaces remain the default and are untouched; the CRD surfaces render only when the toggle is on. This spec **owns and supersedes** the partial CRD templates work that already exists under `src/crd/components/space/settings/` and `src/main/crdPages/topLevelPages/spaceSettings/templates/`, and the account-templates-in-picker behaviour described in spec `041-account-templates-dialog`.

### Differences between the two holders that this feature removes

In the legacy UI the two holders differ in small ways: clicking a template in an Innovation Pack jumps straight into Edit mode, while clicking a template in a Space opens a read-only Preview first; the Space templates surface offers an "import from library" action, the Innovation Pack one does not; the Innovation Pack surface hard-codes "all five types can be created", the Space surface derives that from the space's privileges. The CRD re-implementation presents **one identical management surface for both holders** — same card layout, same actions (Preview, Create, Import from library, Edit, Duplicate, Delete), same dialogs — with action availability driven **only by the current user's authorisation**, never by which kind of holder it is.

## Clarifications

### Session 2026-05-11

- Q: This spec covers the core Templates system in CRD (reusable template components, the create/edit/duplicate/delete/import dialogs, the Space-Settings → Templates tab, and picking templates in creation flows). Which template-adjacent areas should also be in scope? → A: **All of them** — Innovation Pack admin (create/edit a pack + manage its templates), the Innovation Library full page (`/innovation-library`), and the Innovation Pack public profile page.
- Q: How does this spec relate to the already-partially-built CRD Space-Settings → Templates tab (spec `045-crd-space-settings`) and the account-templates dialog work (spec `041`)? → A: **This spec owns and supersedes them.** The existing CRD templates code is a starting point this spec absorbs, refines and extends; spec `045` keeps the other Space-Settings tabs but the Templates tab and the template picker become this spec's responsibility.
- Q: When the two template holders are unified, which direction does "remove the difference" go for the **Import from library** action (the legacy Innovation Pack admin has no Import; Spaces do)? → A: **Import stays Space-only.** Both holders share the identical management surface, cards and dialogs, but the Import affordance is contextually present only for a Space (an Innovation Pack is a *source* of templates, not a *sink*) — handled the same way as any other authorisation-gated action. Templates still flow *into* a pack only by being created or duplicated there.
- Q: What is the import-into-Space interaction model for the template picker? → A: **Persistent library manager** (mirrors legacy): the picker shows a gallery; clicking a template previews it; "Import" adds it to the Space's set and the picker stays open; templates already in the set are marked and can be removed from there; the admin closes the picker when finished. (Consumption flows — picking a template to apply when creating a callout / whiteboard / space — remain single-pick-then-apply.)
- Q: When an admin deletes a template that is currently set as a default (default subspace/content template, or a phase's default callout template), what happens to the default reference? → A: **Auto-clear it.** Deletion proceeds; every default pointer that referenced the deleted template is cleared; the confirmation dialog notes that the template is currently used as a default and will be unset.
- Q: How is the work split with spec `045-crd-space-settings` for the in-Space-Settings template affordances (Layout-tab "default callout template per phase"; Subspaces-tab "default subspace template" + "save subspace as template")? → A: **`098` owns the Templates tab and all reusable template machinery (picker, cards, preview, create/edit forms, defaults selector); `045`'s Layout and Subspaces tabs host the per-phase-default and save-as-template / default-subspace affordances and consume `098`'s components.** Those affordances are still *specified* here (FR-032, FR-035) but their host-tab wiring is `045`'s task.

## User Scenarios & Testing *(mandatory)*

> All user stories assume the CRD feature toggle is ON. When it is OFF the corresponding legacy MUI surface renders unchanged.
>
> Priority labels order the work for incremental delivery; every story is independently testable. The MVP is **US1 + US3** (a space admin can manage their templates, and a creator can use a callout template) — that alone is a coherent, shippable slice.

### User Story 1 — Manage a Space's templates (Priority: P1)

A Space admin opens **Space Settings → Templates** and sees the space's templates organised by type — one section per type (Space, Collaboration tools, Whiteboard, Post, Community Guidelines), each section showing the templates as cards with a name, description, type, and (where present) a banner/preview image. From here the admin can: **preview** any template (a dialog showing the template's content rendered read-only); **create** a new template of any type they're allowed to create; **edit** a template's details (and, for the editable parts of its content, the content); **duplicate** a template; **delete** a template (always behind a confirmation dialog); and **import** one or more templates into the space's set from the library (account packs and the public platform library). The admin can also choose the space's **default Space (content) template** — the one pre-selected when someone creates a subspace.

**Why this priority**: This is the central, highest-traffic management surface and the foundation everything else builds on (the cards, the preview dialog, the create/edit forms, the import/library dialog are all reused by the other stories). It also unblocks the in-progress CRD Space Settings work.

**Independent Test**: Enable CRD, open a space's Settings → Templates as an admin. Create a template of each type, edit it, duplicate it, preview it, delete it (confirming the dialog), and import a template from the library. Set the default subspace template. Verify each action persists and the section list updates.

**Acceptance Scenarios**:

1. **Given** a Space admin opens Settings → Templates with CRD enabled, **When** the page renders, **Then** the templates appear grouped into one section per type, each showing template cards (and a count per section), and a Create / Import affordance is visible for each type the admin may add to.
2. **Given** the admin clicks a template card, **When** the preview opens, **Then** the template's content renders read-only in a CRD dialog (callout framing, whiteboard drawing, post description, space structure, or guidelines text + references — appropriate to the type), with an "Edit" action shown if the admin may edit it.
3. **Given** the admin chooses "Create new" for a type, **When** the create dialog opens and the admin fills the type-appropriate fields and submits, **Then** a new template of that type is added to the space's set and appears in its section.
4. **Given** the admin chooses "Edit" on a template, **When** they change its details (name, description, tags, banner) and any editable content and save, **Then** the changes persist and the card updates.
5. **Given** the admin chooses "Duplicate" on a template, **When** they confirm, **Then** a copy of the template is added to the space's set.
6. **Given** the admin chooses "Delete" on a template, **When** the CRD confirmation dialog appears and they confirm, **Then** the template is removed from the set; **When** they cancel, **Then** nothing changes.
7. **Given** the admin opens "Import from library", **When** the picker shows templates from the account's packs and the public platform library, **Then** the admin can preview a candidate and import it; the imported template appears in the space's set.
8. **Given** the admin opens the "default subspace template" selector, **When** they pick one of the space's Space templates (with a preview of its phases/callouts), **Then** that template becomes the space's default for subspace creation.
9. **Given** the admin lacks the privilege to create / edit / delete / import a given type, **When** the page renders, **Then** the corresponding action is not offered for that type (and a type's section is hidden entirely if it is both empty and the admin cannot add to it).

---

### User Story 2 — Manage an Innovation Pack's templates (unified holder experience) (Priority: P1)

A user with rights over an Innovation Pack (a platform admin in `/admin/innovation-packs`, or an account admin for an account-owned pack) opens the pack's admin screen and manages the pack's templates using the **same surface, same cards, same actions and same dialogs** as US1 — Preview, Create, Import from library, Edit, Duplicate, Delete — with availability driven only by their authorisation. The legacy holder-specific quirks are gone: clicking a template opens a Preview (not an immediate Edit), and the Import action is available here on the same terms as in a Space. Alongside the templates, the screen shows the pack's own details for editing (covered by US7).

**Why this priority**: Innovation Packs are the *other* template holder and the user explicitly wants the two unified. Treating this as P1 forces the management surface to be holder-agnostic from the start rather than re-fitted later.

**Independent Test**: Enable CRD, open an Innovation Pack's admin screen. Verify the templates area looks and behaves exactly like the Space Settings → Templates tab: create / edit / duplicate / delete / preview all work the same way and through the same dialogs. Confirm that clicking a template opens a preview first (not Edit), matching the Space behaviour, and that the only contextual difference is the absence of the Space-only "Import from library" affordance.

**Acceptance Scenarios**:

1. **Given** a user with pack-management rights opens an Innovation Pack admin screen with CRD enabled, **When** it renders, **Then** the templates area is visually and behaviourally identical to the Space Settings → Templates tab (same section-per-type layout, same card design, same action set), except the "Import from library" affordance is not shown (Import is Space-only).
2. **Given** the user clicks a template card in a pack, **When** it opens, **Then** a read-only Preview dialog appears first — *not* an immediate Edit form — exactly as in a Space.
3. **Given** the user has rights to create / edit / delete templates in the pack, **When** the screen renders, **Then** Create / Edit / Delete are offered for the allowed types; **Given** they lack a right, **Then** that action is not offered — and this gating depends on their privileges, not on the fact that it is a pack.
4. **Given** templates can only enter a pack by being created or duplicated there, **When** the user adds a template to a pack, **Then** they do so via the same Create / Duplicate dialogs used in a Space; there is no "import into pack" path.
5. **Given** any create / edit / preview / delete / duplicate action is taken in either a Space or a pack, **Then** it goes through the identical CRD dialog component — there is no separate "pack version" of any template dialog.

---

### User Story 3 — Use a template when creating a Callout (Priority: P1)

A user creating a callout in a CRD surface opens the callout-creation dialog and chooses to start from a template. The **CRD template picker** opens, scoped to Callout templates, showing candidates from up to three sources — the current Space's templates set, the current account's Innovation Packs, and the public platform library — each in its own labelled section. The user can preview a candidate (seeing its framing kind, framing content, allowed contribution types and contribution defaults), pick it, and the callout-creation form is then pre-filled from the template: framing kind and content, contribution settings, default post description, default whiteboard drawing. The user can still edit everything before publishing, and can clear the selection to start blank.

**Why this priority**: Picking a callout template is the most frequent template-consumption action across the platform; it is the proof that the reusable CRD picker works end-to-end in a real creation flow.

**Independent Test**: Enable CRD, open the CRD callout-creation dialog in a space, click "use a template", verify the picker shows Space / Account / Platform sections (each hidden when empty), preview a callout template, select it, and confirm the creation form is pre-filled from it. Clear the selection and confirm the form returns to blank.

**Acceptance Scenarios**:

1. **Given** a user is creating a callout in a CRD surface, **When** they choose "use a template", **Then** the CRD template picker opens showing only Callout templates, grouped into Space / Account / Platform sections, with each section omitted when it has no templates and a clear empty-state when all sources are empty.
2. **Given** the picker is open, **When** the user clicks a candidate, **Then** a preview of that callout template's content is shown before they commit.
3. **Given** the user selects a callout template, **When** the picker closes, **Then** the callout-creation form is populated from the template (framing kind + content, allowed contribution types, comment settings, default post description, default whiteboard drawing) and remains fully editable.
4. **Given** a template was selected, **When** the user clears the selection, **Then** the form reverts to an empty callout.
5. **Given** the user publishes the callout, **Then** the published callout reflects whatever is in the form (template-derived values plus any edits), identical to publishing a callout authored from scratch.

---

### User Story 4 — Use a template when creating a Space or Subspace (Priority: P2)

A user creating a new Space or Subspace in a CRD surface is offered a choice of **Space (content) template** (including an explicit "Empty / start from scratch" option). When a template is highlighted they see a preview of what it will create — the innovation-flow phases and the starter callouts (and any nested subspace templates). They confirm, and the new (sub)space is created with that structure. When creating a *subspace*, the space's configured **default subspace template** is pre-selected. If the creation form already holds unsaved data when the user changes the template, they are asked to confirm before it is replaced. Separately, a Space admin can also *save an existing subspace as a Space template* (from the subspace's overflow menu / the Subspaces settings tab).

**Why this priority**: Creating a space from a template is a core onboarding flow, but it is less frequent than callout creation and depends on the picker built in US3, so it follows.

**Independent Test**: Enable CRD, start the CRD create-space and create-subspace flows. Confirm a Space-template selector with an "Empty" option and a preview of phases/callouts; confirm the default subspace template is pre-selected when creating a subspace; confirm changing the template with unsaved form data prompts a confirmation; confirm "save subspace as template" produces a new Space template.

**Acceptance Scenarios**:

1. **Given** a user starts the CRD create-space flow, **When** the template step renders, **Then** a Space-template selector is shown including an explicit "Empty" / start-from-scratch option, with candidates drawn from the Space's set, the account's packs and the platform library.
2. **Given** the user highlights a Space template, **When** the preview renders, **Then** they see its innovation-flow phases and starter callouts (and nested subspace templates if any).
3. **Given** the user is creating a *subspace* and the parent space has a default subspace template set, **When** the template step renders, **Then** that template is pre-selected.
4. **Given** the creation form already contains user-entered data, **When** the user changes the selected template, **Then** they must confirm before the form is overwritten; cancelling keeps the current data and selection.
5. **Given** the user confirms creation with a template selected, **Then** the new (sub)space is created with the template's phases, starter callouts and settings; **Given** "Empty" was selected, **Then** an empty (sub)space is created.
6. **Given** a Space admin opens a subspace's overflow menu (or the Subspaces settings tab) and chooses "Save as template", **When** they confirm, **Then** a new Space template capturing that subspace's structure is added to the space's templates set.

---

### User Story 5 — Use a template in the remaining creation flows (Priority: P2)

The CRD template picker is wired into the remaining template-consumption points so that, with CRD enabled, every place the legacy app lets a user apply a template has a consistent CRD equivalent:

- **Whiteboard**: when adding a whiteboard (e.g. inside a callout, or as a standalone whiteboard), the user can pick a Whiteboard template; the new whiteboard starts from that drawing. They can also clear the selection.
- **Community Guidelines**: a Space admin editing the community guidelines can choose a Community Guidelines template; the guidelines text and reference links are replaced with the template's. A confirmation guards the replacement when there is existing content.
- **Innovation-flow phase default**: a Space admin in the innovation-flow / Layout settings can set (and clear) the **default Callout template for a phase** — the template suggested when someone adds a callout in that phase.
- **Post default description**: when configuring a callout's contribution defaults, the admin can pick a **Post template**; its default description becomes the callout's default post description.

**Why this priority**: These are real, expected flows but each is lower-traffic than callout/space creation and they all reuse the picker and preview from US1/US3; bundling them keeps the picker's contract honest across every consumer.

**Independent Test**: Enable CRD. For each flow — add a whiteboard, edit community guidelines, set a phase's default callout template, set a callout's default post template — open the CRD picker, preview a candidate, apply it, and confirm the target reflects the template. For the guidelines flow, confirm the replacement is guarded by a confirmation.

**Acceptance Scenarios**:

1. **Given** a user is adding a whiteboard in a CRD surface, **When** they open the template picker (scoped to Whiteboard templates), preview one and select it, **Then** the new whiteboard opens with that drawing; clearing the selection returns it to blank.
2. **Given** a Space admin is editing community guidelines in a CRD surface, **When** they pick a Community Guidelines template, **Then** after a confirmation the guidelines text and references are replaced with the template's.
3. **Given** a Space admin opens an innovation-flow phase's settings in a CRD surface, **When** they set a default Callout template for the phase, **Then** that template is recorded as the phase default; **When** they clear it, **Then** the phase has no default.
4. **Given** a Space admin configures a callout's contribution defaults in a CRD surface, **When** they pick a Post template, **Then** the callout's default post description becomes the template's default description.
5. **Given** any of the above flows whose *host* surface has **not yet** been migrated to CRD, **Then** that flow continues to use the legacy MUI picker until its host migrates — this is an acceptable transitional state and does not block CRD use elsewhere.

---

### User Story 6 — Browse the Innovation Library (Priority: P2)

Anyone — including a signed-out visitor — opens `/innovation-library` and sees the platform's template catalogue rebuilt in CRD: a section listing the store-listed **Innovation Packs** (as cards linking to each pack's profile) and a **filterable gallery of all platform templates** (filter by template type; the gallery shows every template across all listed packs). Clicking a template opens a read-only preview; clicking a pack navigates to its profile page.

**Why this priority**: The Library is the public discovery surface for templates; it depends on the CRD template cards and preview dialog from US1, so it follows them.

**Independent Test**: Enable CRD, open `/innovation-library` while signed out. Confirm an Innovation Packs section and a templates gallery; filter the gallery by type and confirm the list updates; preview a template; click a pack and confirm navigation to its profile page.

**Acceptance Scenarios**:

1. **Given** a visitor (signed in or out) opens `/innovation-library` with CRD enabled, **When** the page loads, **Then** it shows a section of Innovation Pack cards and a gallery of all platform templates.
2. **Given** the gallery is shown, **When** the visitor changes the template-type filter, **Then** the gallery updates to show only templates of the selected type(s).
3. **Given** the visitor clicks a template card, **When** the preview opens, **Then** the template's content renders read-only.
4. **Given** the visitor clicks an Innovation Pack card, **When** they activate it, **Then** they navigate to that pack's public profile page.
5. **Given** the platform has no listed packs / templates, **When** the page renders, **Then** an appropriate empty state is shown rather than an error.

---

### User Story 7 — Create and edit an Innovation Pack (Priority: P3)

A user with the right to create Innovation Packs (a platform admin, or an account admin for account-owned packs) creates a new pack — giving it a name, description, avatar, tags, reference links, a provider organisation, a store-listing flag and a search-visibility setting — and can edit those details later. Deleting a pack is always behind a confirmation dialog. After creating a pack, the user is taken to its admin screen where they manage its templates (US2).

**Why this priority**: Pack creation/editing is an infrequent admin task and is meaningful only once the templates-management surface (US2) exists, so it comes after.

**Independent Test**: Enable CRD as a platform admin. Create a new Innovation Pack with all its fields; confirm it appears in the packs list and its admin screen opens. Edit its details and confirm they persist. Delete it via the confirmation dialog and confirm it is removed.

**Acceptance Scenarios**:

1. **Given** an authorised user starts "create Innovation Pack" with CRD enabled, **When** they complete the form (name, description, avatar, tags, references, provider organisation, store-listing flag, search visibility) and submit, **Then** the pack is created and its admin screen opens.
2. **Given** an authorised user opens an existing pack's admin screen, **When** they change its details and save, **Then** the changes persist.
3. **Given** an authorised user chooses "Delete" on a pack, **When** the CRD confirmation dialog appears and they confirm, **Then** the pack (and its templates set) is removed; cancelling changes nothing.
4. **Given** a user without pack-management rights, **When** they reach a pack screen, **Then** the create / edit / delete affordances are not offered.

---

### User Story 8 — View an Innovation Pack's public profile page (Priority: P3)

Anyone opens an Innovation Pack's URL and sees its public profile rebuilt in CRD: the pack's name, description, avatar/banner, provider organisation, tags and reference links, plus the pack's templates listed by type with read-only preview. Admins of the pack see an entry point to its admin screen.

**Why this priority**: The pack profile page is a read-mostly discovery surface; it reuses the CRD template cards and preview from US1 and the pack details rendering implied by US7, so it comes last.

**Independent Test**: Enable CRD, open a pack's public URL while signed out. Confirm the pack profile (name/description/provider/tags/references) and its templates by type; preview a template. As a pack admin, confirm a link to the admin screen is shown.

**Acceptance Scenarios**:

1. **Given** a visitor opens an Innovation Pack's URL with CRD enabled, **When** the page loads, **Then** it shows the pack's profile (name, description, avatar/banner, provider, tags, references) and the pack's templates grouped by type.
2. **Given** the visitor clicks a template on the pack profile, **When** the preview opens, **Then** the template's content renders read-only.
3. **Given** the visitor is an admin of the pack, **When** the page renders, **Then** an entry point to the pack's admin screen is shown; **Given** they are not, **Then** it is not.

---

### Edge Cases

- **Empty type sections**: a holder with no templates of a given type shows that type's section with an empty state and a Create / Import affordance if the user may add to it; if the user may not add to it and there are no templates, the section is hidden entirely.
- **Empty picker sources**: in the template picker, a source section (Space / Account / Platform) with no matching templates is omitted; if *all* sources are empty, the picker shows a "no templates available" message rather than an empty dialog.
- **Picking a Space template over unsaved data**: changing the selected Space template while the create-space / create-subspace form holds user-entered data requires a confirmation before the data is replaced.
- **Deleting a template that is in use as a default**: deleting a template currently set as the default subspace/content template, or as a phase's default callout template, must not leave a dangling default — the deletion proceeds and every default pointer referencing that template is cleared as part of the deletion; the confirmation dialog notes that the template is currently used as a default and will be unset.
- **Templates with uploaded images**: callout-template media-gallery images and whiteboard-template preview images load lazily in cards and previews; when an image is missing, the card uses the design system's deterministic colour fallback (per the CRD migration guide) — never a stock placeholder.
- **Editing nested Space-template content**: editing a Space template from the management surface edits its details (name, description, tags, banner); the template's nested structure (phases, callouts, subspace templates) is captured at authoring time (by copying a space or a subspace) and is not deep-edited field-by-field in this surface — re-capturing from an updated space is the path to changing it. Whether deeper in-place editing is offered is out of scope here.
- **Name collisions on import / duplicate**: importing or duplicating a template whose name matches an existing one in the destination is allowed (template names are not unique within a set); the new template is added as-is, mirroring legacy behaviour.
- **Anonymous users**: signed-out visitors can browse the Innovation Library and any pack's public profile and can preview templates; they are never shown management actions.
- **Concurrent edits**: two admins editing the same template concurrently — last write wins, mirroring legacy behaviour; no new locking is introduced.
- **Large content in preview**: very large whiteboard drawings or deep space trees render progressively / within a scroll area; the preview dialog must not block the UI while loading content.
- **Toggle off mid-session**: turning the CRD toggle off returns every templates surface to its exact legacy MUI behaviour with no data effect.
- **A holder the user can view but not manage**: a user who can see a Space's settings or a pack's profile but lacks management privileges sees templates and previews but no Create / Edit / Delete / Import.

## Requirements *(mandatory)*

### Functional Requirements

**Foundation & cross-cutting**

- **FR-001**: The Templates system MUST be re-implemented on the CRD design system (shadcn/ui + Tailwind), gated behind the existing `alkemio-crd-enabled` toggle (default OFF). When the toggle is OFF, every legacy MUI templates surface renders unchanged.
- **FR-002**: The CRD templates surfaces MUST NOT load the legacy MUI styling layer; they follow the CRD layer rules (presentational CRD components receive data and behaviour as props; data fetching and mapping live in the integration layer).
- **FR-003**: The CRD implementation MUST cover all five template types (Callout, Whiteboard, Post, Space, Community Guidelines) wherever the legacy app does.
- **FR-004**: All user-visible text on CRD templates surfaces MUST be translatable, in all platform-supported languages, via the CRD translation mechanism (a `templates` feature namespace), with no hardcoded strings.
- **FR-005**: All CRD templates surfaces MUST meet WCAG 2.1 AA: keyboard operability, visible focus, semantic structure, labelled icon-only controls, and screen-reader-announced loading states.
- **FR-006**: Every destructive action on a CRD templates surface (deleting a template, deleting an Innovation Pack, replacing community guidelines from a template, discarding unsaved create/edit form state) MUST be confirmed through a CRD confirmation dialog before the change is committed.
- **FR-007**: This feature MUST NOT regress any template capability available in the legacy MUI app — every legacy template action (create, edit, preview, duplicate, delete, import, set defaults, save-as-template, and every consumption flow) MUST have a CRD equivalent (or, where its host surface is not yet CRD, a documented transitional fallback to the legacy picker).

**Holder management surface (Space templates set & Innovation Pack templates set)**

- **FR-010**: The CRD templates-management surface MUST present a holder's templates grouped into one section per type, each section showing the templates as cards (name, description, type, banner/preview where present) and a count of templates in that section.
- **FR-011**: The surface MUST offer, per type and subject to the current user's authorisation: **Create** a new template, **Preview** a template (read-only), **Edit** a template, **Duplicate** a template, and **Delete** a template (with confirmation). Additionally, for a **Space** holder, it MUST offer **Import** template(s) from the library; this Import affordance is not shown for an Innovation Pack holder (a pack is a source of templates, not a sink — templates enter a pack only via Create or Duplicate).
- **FR-012**: The same management surface, the same template cards, and the same Preview / Create / Edit / Duplicate / Delete dialogs MUST be used for **both** holder kinds (a Space's templates set and an Innovation Pack's templates set). There MUST NOT be a separate "pack" variant of any of these. The only behavioural difference between the two holders is that Import-from-library is offered for Spaces and not for packs (FR-011).
- **FR-013**: In **both** holder kinds, clicking a template MUST open a read-only Preview first (with an Edit action when the user may edit) — i.e., the legacy "packs jump straight to Edit" behaviour is removed.
- **FR-014**: The availability of Create / Edit / Delete / Duplicate for a given type MUST be determined solely by the current user's authorisation, never by which kind of holder it is; the Import affordance is additionally contextual to Space holders per FR-011.
- **FR-015**: A type's section MUST be hidden when it has no templates and the current user may not add templates of that type; when the user may add but the section is empty, an empty state with the available add affordance(s) MUST be shown.
- **FR-016**: The template picker (used by a Space holder to import, and by every consumption flow to select a template) MUST offer templates from the relevant sources (the current Space's templates set when applicable, the current account's Innovation Packs, and the public platform library), grouped into labelled sections, with each section omitted when empty; the user MUST be able to preview a candidate before importing or selecting it.
- **FR-017**: In **import-into-Space** mode, the picker MUST behave as a persistent library manager: it stays open after an import so several templates can be added in one session; templates already present in the Space's set MUST be visibly marked and MUST be removable from within the picker; the admin closes the picker when finished. Each import MUST add a copy of the template to the Space's set; the imported copy MUST then behave as a normal template of that set (editable, duplicable, deletable subject to authorisation). In **consumption** mode (picking a template to apply when creating a callout / whiteboard / space / etc.), the picker MUST be single-pick: choosing a template applies it and closes the picker (with a clear-selection path back to "no template").
- **FR-018**: For a Space, the management surface MUST let an admin view and change the per-type **template defaults** that the platform supports — at minimum the **default Space (content) template** used when creating a subspace — with a preview of the candidate before it is set.
- **FR-019**: Deleting a template that is currently referenced as any default (the default subspace/content template, a phase's default callout template, or any other supported default) MUST clear that default pointer as part of the deletion so no dangling default remains; the deletion confirmation dialog MUST note that the template is in use as a default and will be unset.

**Per-type create / edit forms**

- **FR-020**: Creating or editing a template MUST present, in addition to the common details (name, description, tags, banner/visual), the type-appropriate content fields:
  - **Callout** template — the framing kind (text / whiteboard / memo / link / media-gallery) and its framing content, the allowed contribution types and comment settings, and the contribution defaults (default post description, default whiteboard drawing).
  - **Whiteboard** template — the whiteboard drawing and its preview settings.
  - **Post** template — the default post description (rich text).
  - **Space (content)** template — authored by selecting an existing space or subspace to copy its structure (innovation-flow phases, starter callouts, nested subspace templates, collaboration settings); a preview of the captured structure is shown.
  - **Community Guidelines** template — the guidelines text and the list of reference links (each with title, URL, description).
- **FR-021**: The create / edit forms MUST validate required fields (at minimum a non-empty name) before allowing submission, and MUST surface validation messages inline.
- **FR-022**: Closing a create / edit form with unsaved changes MUST prompt the user to confirm discarding them.
- **FR-023**: Uploading images within a template form (callout media-gallery images, whiteboard preview image, banner/visual) MUST be supported wherever the legacy form supports it, and the uploads MUST persist with the template.

**Template preview**

- **FR-024**: The Preview dialog MUST render a template's content read-only and type-appropriately: a callout template's framing and contribution defaults; a whiteboard template's drawing; a post template's description; a space template's phases, starter callouts and nested subspace templates; a community-guidelines template's text and references.
- **FR-025**: Preview content (including any large content such as a whiteboard drawing or a deep space tree) MUST load without blocking the rest of the UI, and MUST be scrollable when it exceeds the dialog.

**Template consumption flows**

- **FR-030**: When creating a **callout** in a CRD surface, the user MUST be able to start from a Callout template via the CRD template picker (sources grouped Space / Account / Platform; empty sections omitted; preview before selection); selecting a template MUST pre-fill the callout-creation form (framing kind + content, allowed contribution types, comment settings, default post description, default whiteboard drawing), all of which remain editable; the user MUST be able to clear the selection to start blank.
- **FR-031**: When creating a **Space or Subspace** in a CRD surface, the user MUST be offered a Space (content) template selector including an explicit "Empty / from scratch" option, with a preview of the candidate's phases and starter callouts; when creating a *subspace*, the parent space's configured default subspace template MUST be pre-selected; changing the selection while the form holds user-entered data MUST require confirmation; the resulting (sub)space MUST be created from the chosen template (or empty).
- **FR-032**: A Space admin MUST be able to **save an existing subspace as a Space template** (from the subspace overflow menu and/or the Subspaces settings tab) in a CRD surface, producing a new Space template in the space's templates set.
- **FR-033**: When adding a **whiteboard** in a CRD surface, the user MUST be able to start from a Whiteboard template via the CRD picker (preview before selection), and to clear the selection to start blank.
- **FR-034**: A Space admin editing **community guidelines** in a CRD surface MUST be able to apply a Community Guidelines template, replacing the guidelines text and references with the template's, behind a confirmation when existing content would be replaced.
- **FR-035**: A Space admin MUST be able to set and clear the **default Callout template for an innovation-flow phase** in a CRD surface.
- **FR-036**: When configuring a callout's **contribution defaults** in a CRD surface, the admin MUST be able to pick a **Post template** whose default description becomes the callout's default post description.
- **FR-037**: For any consumption flow whose host surface is not yet on CRD, that flow MAY continue to use the legacy MUI picker until its host migrates; this transitional state MUST NOT degrade the CRD picker behaviour anywhere it *is* wired in.

**Innovation Pack entity (the holder itself)**

- **FR-040**: An authorised user MUST be able to **create** an Innovation Pack in a CRD surface, supplying its name, description, avatar, tags, reference links, provider organisation, store-listing flag and search-visibility setting; on creation the user MUST land on the pack's admin screen.
- **FR-041**: An authorised user MUST be able to **edit** an existing Innovation Pack's details (the fields in FR-040) in a CRD surface, with changes persisting.
- **FR-042**: An authorised user MUST be able to **delete** an Innovation Pack in a CRD surface, behind a confirmation dialog; the pack and its templates set are removed.
- **FR-043**: The CRD Innovation Pack admin MUST be reachable for both platform-curated packs (the platform admin area) and account-owned packs (the account area), mirroring the legacy entry points.

**Innovation Library page**

- **FR-050**: The `/innovation-library` page MUST be rebuilt in CRD and MUST be viewable by anyone, including signed-out visitors.
- **FR-051**: The Library page MUST show (a) a section listing the store-listed Innovation Packs as cards linking to each pack's public profile, and (b) a gallery of all platform templates with a filter by template type.
- **FR-052**: From the Library, the user MUST be able to preview any template read-only and navigate to any pack's public profile.
- **FR-053**: When there are no listed packs or templates, the Library MUST show an empty state, not an error.

**Innovation Pack public profile page**

- **FR-060**: An Innovation Pack's public profile page MUST be rebuilt in CRD and MUST be viewable by anyone, including signed-out visitors.
- **FR-061**: The pack profile page MUST show the pack's profile (name, description, avatar/banner, provider organisation, tags, references) and the pack's templates grouped by type, each previewable read-only.
- **FR-062**: When the viewer has management rights over the pack, the profile page MUST show an entry point to the pack's admin screen; otherwise it MUST NOT.

**Authorisation & parity**

- **FR-070**: All authorisation gates on CRD templates surfaces MUST mirror the legacy MUI gates exactly — no new roles or privileges are introduced, and no action becomes available to a user who could not perform it in the legacy app.
- **FR-071**: The legacy MUI templates surfaces and files MUST remain in place and be the default rendering path while the CRD toggle is OFF; this feature MUST NOT delete or alter them.

### Key Entities

- **Template** — a reusable, named definition with a profile (display name, description, tags, banner/visual) and a `type` (Callout, Whiteboard, Post, Space, or Community Guidelines). Belongs to exactly one **templates set**. Its *content* depends on its type (see Context).
- **Templates set** — the collection of templates owned by a holder, partitioned by type.
- **Template holder** — anything that owns a templates set. Two kinds: a **Space** (via its **templates manager**) and an **Innovation Pack**. The Innovation Library is *not* a holder (read-only aggregation).
- **Templates manager** — a Space's wrapper around its templates set plus its per-type **template defaults**.
- **Template default** — a per-type pointer on a Space marking "use this template by default" (e.g. default subspace template; default callout template per innovation-flow phase).
- **Innovation Pack** — a shareable holder of templates with its own profile (name, description, avatar, tags, references), a **provider** organisation, a store-listing flag and a search-visibility setting. Exists at platform level and at account level.
- **Innovation Library** — the platform catalogue: the set of store-listed Innovation Packs plus the union of their templates, browsable and filterable by type.
- **Template picker** — the dialog used wherever a user selects a template to apply (callout / whiteboard / space / subspace / community-guidelines / phase-default / post-default / import-into-holder); shows candidates grouped by source (current Space's set, current account's packs, public platform library) and supports preview before selection.
- **Account** — the owner of account-level Innovation Packs and the source of "account templates" in the picker (the union of the account's packs' templates).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With CRD enabled, a Space admin can complete the full lifecycle — create, edit, duplicate, preview, delete, and import — for **every one of the five template types** entirely within the CRD experience, with no MUI fallback and no missing action, in a single session.
- **SC-002**: With CRD enabled, **every** template-picking interaction available in the legacy MUI app (callout creation, whiteboard creation, space/subspace creation, default subspace template, community-guidelines application, innovation-flow phase default, post default description, import-into-holder) has a working CRD equivalent — verified against a checklist with zero gaps (allowing only the documented "host surface not yet CRD" transitional fallbacks, each explicitly listed).
- **SC-003**: A side-by-side comparison of the templates-management surface for a Space and for an Innovation Pack shows an **identical** layout, card design, action set, and dialog set — a reviewer cannot tell which holder kind they are looking at from the templates area alone.
- **SC-004**: Across all CRD templates surfaces, **no Material UI styling layer is loaded** (verifiable from the loaded bundles for those routes/dialogs).
- **SC-005**: A signed-out visitor can open `/innovation-library` and any Innovation Pack's public profile with CRD enabled, browse and filter templates, and preview any template — with no authentication prompt and no errored region.
- **SC-006**: Toggling the CRD switch OFF restores the exact legacy MUI templates experience on every surface, with no residual data or state effect.
- **SC-007**: Every CRD templates surface passes an automated accessibility check (WCAG 2.1 AA) and a keyboard-only walkthrough of its primary task (e.g. create a template, pick a template, delete a template) with no blocking issue.
- **SC-008**: Every destructive action on a CRD templates surface (template delete, pack delete, guidelines replacement, discard unsaved form) is preceded by a confirmation dialog — verified by exercising each path.

## Assumptions

- **Toggle & coexistence**: This work ships behind `alkemio-crd-enabled` (default OFF); the legacy MUI templates surfaces remain the default and are untouched, consistent with the rest of the CRD migration. Removal of the toggle and deletion of legacy files happens later, project-wide, not in this feature.
- **Data layer unchanged**: The GraphQL schema, queries, mutations and data hooks for templates, templates sets, templates managers, template defaults, Innovation Packs and the platform library are reused as-is; this feature changes only the presentation layer and its integration glue. New GraphQL is added only if a CRD surface needs data the legacy queries don't already expose.
- **Ownership of prior CRD work**: The partial CRD templates code under `src/crd/components/space/settings/` (the templates view, the library/edit/preview dialogs, the save-subspace-as-template and change-default-subspace-template dialogs) and `src/main/crdPages/topLevelPages/spaceSettings/templates/` is a starting point this feature absorbs, refines and extends; spec `045-crd-space-settings` continues to own the other Space-Settings tabs. The account-templates-in-picker behaviour from spec `041-account-templates-dialog` is folded into the CRD picker built here.
- **Reusable picker**: A single CRD template-picker dialog (with preview) is built once and consumed by every flow (import-into-holder and all creation flows); it shows the Space / Account / Platform source sections, omitting empty ones, exactly as the legacy import dialog does.
- **Holder unification direction**: "Removing the small differences" means converging on the richer, Space-style behaviour: Preview-before-Edit everywhere, the same action set and dialogs everywhere, gating by authorisation not holder kind. The one intentional contextual difference that remains is that Import-from-library is offered for a Space holder and not for an Innovation Pack (a pack is a template *source*); templates enter a pack only via Create or Duplicate (resolved in Clarifications, 2026-05-11).
- **Innovation Pack profile/admin placement**: The CRD Innovation Pack admin and public profile pages live at the same URLs and under the same entry points as today (platform admin area for curated packs; account area for account-owned packs; the public `/innovation-packs/<pack>` URL for profiles).
- **Innovation Library scope**: The CRD Library page reproduces the legacy page's content — an Innovation Packs section and a type-filterable template gallery with preview — restyled in CRD; no new catalogue features are introduced beyond what the legacy page offers.
- **Space-template content editing depth**: Editing a Space template in the management surface edits its details (name, description, tags, banner); the nested structure is (re-)captured by copying a space/subspace, not deep-edited field-by-field here — matching the current behaviour.
- **i18n**: Templates strings live in a CRD `templates` feature namespace under `src/crd/i18n/templates/`, maintained manually (AI-assisted) for all supported languages in the same PR, per the CRD i18n conventions. Business-domain text (template names, descriptions) flows in as props.
- **Reused CRD building blocks**: Existing CRD primitives/components are reused — the confirmation dialog, the markdown editor, the tags input, the share dialog, the deterministic colour fallback for missing banners/avatars, date-fns for any date formatting — rather than re-created.

## Dependencies

- **CRD design system & toggle**: `src/crd/` primitives/components, the `CrdLayoutWrapper` / route-gating mechanism, and `useCrdEnabled` (existing).
- **Spec `045-crd-space-settings`**: provides the CRD Space Settings shell (incl. the Layout and Subspaces tabs). This feature owns the **Templates tab** and all reusable template machinery; `045`'s Layout tab (per-phase default callout template) and Subspaces tab (default subspace template, save-subspace-as-template) **host** those affordances and **consume this feature's components** — those flows are specified here (FR-032, FR-035) but wired into the tabs by `045`.
- **Spec `041-account-templates-dialog`**: its account-templates-in-picker requirement is satisfied by the CRD picker built here (the spec's intent carries over; its MUI implementation is not extended).
- **CRD callout / whiteboard / space-creation surfaces**: the consumption flows (US3, US4, US5) wire the CRD picker into these surfaces; for any that are not yet CRD, the legacy picker remains until they migrate (FR-037).
- **Existing template GraphQL hooks & mutations** for templates sets, templates, template defaults, Innovation Packs, and the platform library (`src/core/apollo/generated/apollo-hooks.ts` and the `.graphql` documents under `src/domain/templates/`, `src/domain/templates-manager/`, `src/domain/InnovationPack/`).

## Out of Scope

- Changing the templates data model, the GraphQL schema, or template authorisation rules (mirror, don't change).
- Removing the CRD feature toggle or deleting the legacy MUI templates code (a later, project-wide step).
- Migrating to CRD any *host* surface that merely *contains* a template-picking step but is not itself a templates surface (e.g. the full callout-creation dialog, the full whiteboard editor, the full create-space wizard) — those migrations are owned by their own specs; this feature only delivers the picker and wires it in where the host is already CRD.
- New template types, new catalogue/discovery features, template versioning, template analytics, or any capability the legacy app does not already have.
- Deep field-by-field in-place editing of a Space template's nested structure (phases/callouts) beyond what the legacy app offers.
