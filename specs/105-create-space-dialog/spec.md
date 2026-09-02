# Feature Specification: CRD Create Space Dialog

**Feature Branch**: `105-create-space-dialog`
**Created**: 2026-06-12
**Status**: Draft
**Input**: User description: "take a look to the previous spec (VCs), take a look to CLAUDE.md files and specially to the migration-guide.md and let's do the Create Space dialog. In this case, I want to check if there's any implementation in the prototype already or if we are going to just port to crd whatever it is in MUI."

## Context & Background

Creating a top-level Space ("L0" Space) is the single most important entry point into Alkemio — it is how a user or organization starts a new workspace. The flow lives behind a **"Create Space"** action on the **contributor account page** (a user's own account, or an organization's account) and is presented as a modal dialog.

That dialog is currently **MUI** (`src/domain/space/components/CreateSpace/createSpace/CreateSpace.tsx`). The contributor account page itself has already been migrated to the CRD design system, but its "Create Space" action still opens the legacy MUI dialog — the CRD account tabs (`CrdUserAccountTab`, `CrdOrgAccountTab`) import and render the MUI `CreateSpace` component directly. Because the **default design version is CRD (`2`)**, the inconsistency is **user-visible today**: a user on the new design who clicks "Create Space" is dropped into a visually mismatched MUI dialog inside the CRD shell. It is also an architectural leak — `src/main/crdPages/**` must not depend on `@mui/*`, but these files transitively do, solely because of this dialog.

This feature closes that gap by delivering a **CRD-native Create Space dialog** and wiring it into every CRD entry point that currently opens the MUI one, retiring the MUI fallback at those entry points. The existing MUI dialog stays in the codebase for any non-migrated (legacy design) surfaces, consistent with the migration guide's "old MUI files stay" rule.

### Prototype vs. MUI: where the design and behavior come from

The user explicitly asked whether the prototype already has an implementation or whether we port from MUI. The answer is **both, in distinct roles**:

- **Prototype provides a secondary visual reference.** `prototype/src/app/components/dialogs/CreateSpaceDialog.tsx` + `prototype/src/app/components/create-space/CreateSpaceForm.tsx` define a single-screen form: a large Space-name field, a tagline field, an inline `alkem.io/<slug>` URL row, a page banner, a card banner, an "Add Tutorials" checkbox, and a required "Accept terms" checkbox; with sticky Cancel / Create footer actions. Useful for the inline `alkem.io/<slug>` row, but the prototype's collapsible **"Space Details & Assets"** grouping is **not** adopted — the structural model is the flat Create Subspace dialog (see below).
- **MUI provides the real behavior.** The prototype form is mock-only (fake submit, hardcoded banner URLs, no template selection, no license/plan handling, no account scoping). The production functional requirements — the Space template selector, field validation, visual upload + resize constraints, license-plan selection, account scoping, post-creation navigation and cache updates — come from the existing MUI `CreateSpace` flow.
- **There is also an experimental AI "Guided Creation" chat** in the prototype (`prototype/src/app/components/create-space/CreateSpaceChat.tsx`) that conversationally assembles a Space (purpose → audience → subspace structure → templates → banner → tags → review). It is entirely mocked, has no backend, and is **out of scope** for this feature (captured as a possible future enhancement).

**The structural model is the already-migrated CRD Create Subspace dialog** (`src/crd/components/space/settings/CreateSubspaceDialog.tsx` + `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace.ts`). The new dialog **clones it** — same presentational-component + integration-hook split, same field layout (template selector + preview, display name, tagline, **markdown description**, tags), same template-picker / visual-resize / yup-on-submit / discard-guard machinery — and applies these deltas:

- **Avatar → Page Banner.** The Subspace dialog's Avatar visual is replaced by a **Page Banner**; the **Card Banner** stays. (Create Space has a wide page banner + a card banner, not an avatar.)
- **+ URL slug field.** A top-level Space needs a URL identifier, so a slug field (auto-derived from the name, editable) is added under the display name. Subspaces have none.
- **+ two checkboxes.** **"Add Tutorials to this Space"** and a required **"I have read and accept the terms and agreements … for creating a Space"** (the link opens a terms dialog) — both at the bottom of the form, mirroring the MUI footer.
- **+ account scoping & license-plan selection** — the two concerns unique to creating a top-level Space.

The markdown **Description is kept** (the Subspace dialog has it); this is a deliberate choice to mirror the Subspace dialog rather than the MUI L0 form, which omits description.

**In scope:**

- A CRD presentational Create Space dialog component (`src/crd/`), fed entirely by props/callbacks.
- An integration hook + data mapper (`src/main/crdPages/`) that reuses the existing GraphQL creation mutation, plan-availability logic, and visual upload pipeline.
- Wiring the CRD dialog into the CRD contributor account pages (user account and organization account), replacing the MUI `CreateSpace` import there.
- CRD translations for all supported languages (en, nl, es, bg, de, fr) in the same PR.
- Standalone-preview (`pnpm crd:dev`) coverage with mock data.

**Out of scope:**

- The AI "Guided Creation" chat experience (mock-only, experimental).
- Changing the entitlement/privilege rules that decide *whether* the "Create Space" action is offered (those already live on the account page and are unchanged).
- Migrating the MUI Create Space dialog's legacy callers, or deleting the MUI dialog.
- The separate Create **Subspace** dialog (already migrated) and the Create VC / Innovation Pack / Innovation Hub dialogs (separate efforts).
- Any change to the backend Space-creation mutation, license model, or templates model.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Space on the new design (Priority: P1)

A signed-in user on the CRD design opens their account page, clicks "Create Space", fills in the new CRD-styled dialog, and creates a top-level Space. They land on the newly created Space.

**Why this priority**: This is the core of the feature and the primary user-visible gap. Without it, every new-design user creating a Space sees a mismatched MUI dialog. Delivering just this story already removes the inconsistency for the most common case (a user creating a Space in their own account).

**Independent Test**: With the design version set to CRD, open the user account page, trigger "Create Space", complete the required fields, and confirm a Space is created and the user is navigated to it — entirely on CRD styling, with no MUI dialog appearing.

**Acceptance Scenarios**:

1. **Given** a CRD-design user on their account page who is entitled to create a Space, **When** they click "Create Space", **Then** a CRD-styled dialog opens with a sticky header, a scrollable body, and sticky Cancel / Create footer actions.
2. **Given** the open dialog, **When** the user types a Space name, **Then** a URL slug is auto-suggested from the name and remains editable.
3. **Given** the user has entered a valid name and accepted the terms, **When** they click "Create", **Then** the Space is created, the dialog closes, and the user is taken to the new Space's page.
4. **Given** required fields are missing or invalid (e.g. empty name, terms not accepted), **When** the user attempts to submit, **Then** the Create action is blocked and the relevant fields show validation feedback.
5. **Given** the user clicks Cancel or dismisses the dialog, **When** the dialog closes, **Then** no Space is created and any entered data is discarded.

---

### User Story 2 - Start a Space from a template (Priority: P1)

While creating a Space, the user picks a Space template so the new Space starts pre-populated with a recommended structure and content, instead of starting blank.

**Why this priority**: Template selection is a core part of the real creation flow (present in MUI) and materially changes what the user ends up with. A Create Space dialog without it would be a functional regression versus the legacy dialog.

**Independent Test**: Open the dialog, choose an available Space template, confirm the dialog reflects the choice (and pre-fills text fields where applicable), create the Space, and verify it is created from that template.

**Acceptance Scenarios**:

1. **Given** the open dialog, **When** the user opens the template selector, **Then** they see the Space templates available to the account, and can select one or proceed with no template (blank Space).
2. **Given** a template is selected, **When** it has been applied, **Then** the relevant fields/preview reflect the template, and the Space is created using that template.
3. **Given** a template that lacks a complete, valid structure, **When** the user selects it, **Then** the selection is rejected with a clear message and not applied — only fully-structured (4-state innovation flow) Space templates can seed an L0 Space (consistent with the legacy rule). *(The picker's source rows do not carry innovation-flow data, so the rule is enforced on selection rather than by hiding the template up-front — see research R6.)*

---

### User Story 3 - Create a Space in an organization account (Priority: P2)

A user with rights over an organization opens that organization's account page and creates a Space that belongs to the organization's account rather than their personal one.

**Why this priority**: The same dialog serves both the user account and organization account pages. Organization Space creation is common for teams, but it reuses the User Story 1 flow with a different target account, so it ranks just below the personal-account case.

**Independent Test**: On an organization account page (CRD), trigger "Create Space", create a Space, and verify it is created under the organization's account.

**Acceptance Scenarios**:

1. **Given** an organization account page on CRD where the viewer may create Spaces, **When** they open and complete the Create Space dialog, **Then** the Space is created in the organization's account (not the user's personal account).
2. **Given** the organization account context, **When** the dialog determines which license plan to apply, **Then** it uses a plan available to that organization's account.

---

### User Story 4 - Be told clearly when creation isn't possible (Priority: P2)

When a user reaches the dialog but creation cannot proceed (for example, no license plan is available to the account, or the upload of a chosen image fails), the dialog explains the problem instead of failing silently.

**Why this priority**: A Space-creation flow that fails without explanation is worse than no migration. Clear failure handling protects the primary flows from looking broken.

**Independent Test**: Force a no-available-plan condition (or an image that violates the size constraints) and confirm the user sees an understandable message and is not left in an inconsistent state.

**Acceptance Scenarios**:

1. **Given** an account with no available Space plan, **When** the user attempts to create, **Then** they are shown a clear message that no plan is available and no Space is created.
2. **Given** the user selects an image that is too small or otherwise invalid for a Space banner/card, **When** the image is processed, **Then** they are shown a clear message and can choose a different image.
3. **Given** the creation request fails on the server, **When** the error returns, **Then** the user is informed and the dialog remains open so they can retry without re-entering everything.

---

### User Story 5 - Preview the dialog in the standalone demo (Priority: P3)

A designer or developer opens the standalone CRD preview app to inspect and iterate on the Create Space dialog with mock data, without running the full backend.

**Why this priority**: Useful for design iteration and visual QA but not required for end users. It follows the established CRD practice for migrated surfaces.

**Independent Test**: Run the standalone preview, open the Create Space dialog entry, and confirm it renders with representative mock data, including the empty/loading/error states.

**Acceptance Scenarios**:

1. **Given** the standalone preview app, **When** the Create Space dialog is opened, **Then** it renders with mock data and no backend dependency.
2. **Given** the preview, **When** representative states are exercised (template selected, validation errors, submitting), **Then** each renders correctly.

### Edge Cases

- **Auto-slug vs. manual edit**: once the user manually edits the URL slug, subsequent edits to the name must not overwrite their slug.
- **Duplicate / invalid slug**: a slug that fails format rules or collides with an existing one is rejected with clear feedback rather than producing a broken Space.
- **Very long content / small viewport**: the dialog keeps its header and footer (Create/Cancel) reachable while the middle content scrolls, on laptops and phones in landscape.
- **Slow creation**: while the Space is being created, the Create action shows progress and is not double-submittable; the dialog cannot be accidentally dismissed mid-create in a way that leaves an orphaned Space.
- **Account context still loading**: if the target account or its plans haven't loaded yet, the dialog does not allow submission until it can determine a valid plan.
- **Tutorials option**: the "Add tutorials" choice is honored so a new Space optionally starts with onboarding content.
- **Multiple entry points**: the same dialog behaves identically whether launched from the user account page or the organization account page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a Create Space dialog rendered entirely in the CRD design system (no MUI/Emotion), launched from the CRD contributor account pages (user account and organization account).
- **FR-002**: The dialog MUST let the user provide a Space **name** (required), and MUST derive an editable URL **slug** from the name until the user manually edits the slug, after which the slug is preserved. The slug field MUST display the platform's **base URL as a prefix** (the current environment's origin — e.g. `http://localhost:3000/` in local dev, `https://dev-alkem.io/`, `https://alkem.io/`), and MUST derive the slug with the **canonical name-id rules** (lowercase, accent-folded, invalid characters stripped), matching the MUI flow.
- **FR-003**: The dialog MUST let the user provide a **tagline**, a markdown **description**, and **tags**, with the same length/format limits as the Create Subspace dialog (display name min 3, tagline/description/tag platform limits).
- **FR-004**: The dialog MUST let the user upload a **page banner** and a **card banner** image (the page banner replaces the Subspace dialog's avatar). When the user selects an image, an **image-crop dialog MUST appear** so they can crop/position it to the visual's aspect ratio before it is applied (the image is never used as-is); the crop output is resized to the platform's size constraints. On wide screens the two uploaders MUST sit **side by side** — page banner on the left, card banner on the right.
- **FR-005**: The dialog MUST let the user select a **Space template** (or none), offering the Space templates available to the target account. Only templates whose structure is complete enough to seed a top-level Space (a 4-state innovation flow) may actually seed a Space; selecting a valid template MUST seed the new Space from it. Because the picker's source rows do not carry innovation-flow data, this completeness rule is enforced **on selection** — choosing a template whose captured space lacks a complete flow is rejected with a clear message and not applied (rather than the template being hidden up-front). See research R6.
- **FR-006**: The dialog MUST offer a **"Tutorials"** option (a "Tutorials" header above a checkbox labelled "Add Tutorials and example posts to this Space") that, when enabled, includes onboarding content in the new Space.
- **FR-007**: The dialog MUST require the user to **accept the terms** before the Space can be created, and MUST provide access to the terms content from within the dialog. The terms acceptance control MUST sit in the dialog **footer**, alongside the Cancel/Create actions (stacked above the buttons on small screens); its label may be shortened to fit.
- **FR-008**: The dialog MUST create the Space in the **correct target account** — the current user's account when opened from the user account page, or the organization's account when opened from the organization account page.
- **FR-009**: The system MUST select a valid **license plan** for the target account automatically, and MUST prevent creation with a clear message when no plan is available.
- **FR-010**: On successful creation, the system MUST close the dialog, refresh the relevant Space/account listings, and take the user to the newly created Space (unless a caller opts to handle the result itself).
- **FR-011**: The dialog MUST block submission and surface validation feedback when required fields are missing or invalid, and MUST keep the Create action disabled until the form is valid.
- **FR-012**: During creation the dialog MUST indicate progress, prevent duplicate submissions, and on server error keep the user's input so they can retry.
- **FR-013**: The dialog MUST keep its header and primary actions reachable on small viewports, scrolling only the middle content (per the CRD sticky-header/footer dialog pattern).
- **FR-014**: The dialog and all its text MUST be fully internationalized for the CRD-supported languages (en, nl, es, bg, de, fr), with do-not-translate platform terms (e.g. "Space") left in English per the glossary, all delivered in the same change.
- **FR-015**: The dialog MUST meet WCAG 2.1 AA: keyboard operability, visible focus, labeled controls, and an accessible close affordance.
- **FR-016**: Every CRD entry point that currently opens the MUI Create Space dialog MUST be switched to the CRD dialog, removing the MUI `CreateSpace` dependency from `src/main/crdPages/**` for these entry points.
- **FR-017**: The CRD dialog presentational component MUST receive all data and behavior via props/callbacks (no GraphQL types, no data fetching, no navigation inside the component), with the GraphQL-to-props mapping confined to the integration layer.
- **FR-018**: The Create Space dialog MUST be previewable in the standalone CRD demo app with mock data, including its key states.
- **FR-019**: The legacy MUI Create Space dialog MUST remain available for any non-migrated/legacy-design surfaces (no deletion as part of this feature).
- **FR-020**: The dialog's subtitle MUST identify the **target account**: when launched from an organization account it names that organization (e.g. "…in the {Organization} account"); when launched from the user's own account it reads "…in your account".
- **FR-021**: The dashboard sidebar **"Create my own space"** action MUST open the Create Space dialog **directly** (for the current user's account), rather than navigating to the account page.

### Key Entities *(include if feature involves data)*

- **Space (top-level / L0)**: the workspace being created; carries a display name, URL slug, tagline, description, tags, banner and card visuals, and is created within an account using a license plan and (optionally) a template and tutorials.
- **Account**: the owner context the Space is created under — a user's personal account or an organization's account; determines available license plans and entitlements.
- **License plan**: the plan applied to the new Space; an account may have zero or more available Space plans, and creation requires at least one.
- **Space template**: a reusable, fully-structured Space definition that can seed a new Space's structure and starting content.
- **Visuals (banner / card banner)**: images attached to the Space, constrained by platform size/aspect rules and resized to fit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of CRD account-page "Create Space" entry points open the CRD dialog; the MUI Create Space dialog never appears on the new design.
- **SC-002**: A user can create a Space from their account page in the new dialog and reach the new Space, completing the required steps in under 2 minutes for a basic (no-template) Space.
- **SC-003**: Every Space attribute supported by the legacy MUI flow (name, slug, tagline, tags, banners, template, tutorials, terms) is supported by the new dialog — feature parity with zero regressions — plus a markdown **description** carried over from the Create Subspace dialog (a deliberate addition the MUI L0 form does not have).
- **SC-004**: The dialog header and Create/Cancel actions remain visible and usable at a 768-pixel-tall viewport regardless of content length.
- **SC-005**: All dialog text renders in each of the six supported languages with no missing keys and platform terms preserved per the glossary.
- **SC-006**: `src/main/crdPages/**` carries no `@mui/*` / `@emotion/*` dependency introduced by the Create Space entry points after migration.
- **SC-007**: Failure cases (no available plan, invalid image, server error) each produce a clear, understandable message and never silently fail or create an orphaned Space.

## Assumptions

- **Entry points.** The dialog launches from the CRD user account page, the organization account page (the places that previously rendered the MUI `CreateSpace`), **and the dashboard sidebar "Create my own space" item** — which previously linked to the account page and now opens the dialog directly for the current user's account (FR-021).
- **Entitlement/privilege gating is unchanged.** Whether the "Create Space" action is shown (privilege + space entitlements such as free/plus/premium) is already decided on the account page; the dialog assumes it is only reachable when creation is permitted.
- **License-plan selection mirrors the legacy rule.** The dialog applies the first available Space plan for the account (the same selection the MUI flow performs) and treats "no plan available" as a hard stop.
- **URL-slug behavior matches the legacy flow.** Slugs are validated for format/uniqueness consistent with the existing rules; a live "is this slug available" indicator like the prototype's is treated as an optional enhancement, not a requirement, unless it already exists in the shared flow.
- **Reuse, don't rebuild, the data layer.** The feature reuses the existing Space-creation mutation, plan-availability logic, template selection, and visual-upload/resize pipeline; only the presentation and the integration wiring are new, following the Create Subspace precedent.
- **Single-screen form, not a wizard.** The dialog is a single flat scrollable form mirroring the Create Subspace dialog (no collapsible section), not a multi-step wizard and not the AI chat experience.
- **Translation namespace.** A CRD feature namespace is added/extended for these strings, maintained manually for all six languages in the same PR (exact namespace is an implementation detail; reusing the existing contributor-settings namespace or adding a dedicated create-space namespace are both acceptable).

## Dependencies

- The CRD contributor account pages (user and organization) are already migrated and provide the "Create Space" action and target-account context.
- The existing Space-creation mutation, plan-availability/`useSpacePlans` logic, Space template selection, and visual upload/resize utilities remain available and unchanged.
- The CRD Create **Subspace** dialog and its integration hook serve as the structural reference pattern.
- The CRD design system primitives (dialog, inputs, checkbox, badge, template picker, markdown editor, image upload) and the i18n + glossary infrastructure are in place.
- The standalone CRD preview app is available for mock-data previewing.
