# Feature Specification: CRD Create Innovation Pack & Innovation Hub Dialogs

**Feature Branch**: `109-create-pack-hub-dialogs`
**Created**: 2026-06-15
**Status**: Draft
**Input**: User description: "create a new spec … let's specify the Create innovation pack dialog and the create innovation hub dialog. Both dialogs are only available from the account tab of the user/organization settings. take a look to how they are implemented in MUI, there's no design in the prototype so we'll just have all the same functionality (fields), on both."

## Context & Background

The **account tab** of a contributor's settings (a user's own account, or an organization's account) is where account owners create and manage their account-scoped resources: Spaces, Virtual Contributors, **Innovation Packs**, and **Innovation Hubs**. Each resource has a "Create" action that opens a modal dialog.

The contributor account pages themselves have already been migrated to the CRD design system (`CrdUserAccountTab`, `CrdOrgAccountTab` under `src/main/crdPages/`). The "Create Space" and "Create Virtual Contributor" actions were already migrated to CRD-native dialogs (specs 105 and 106). However, the **Create Innovation Pack** and **Create Innovation Hub** actions still open the **legacy MUI dialogs** as an explicit temporary fallback:

- `src/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog.tsx`
- `src/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog.tsx`

Both account tabs import these MUI dialogs and render them directly (with a `TEMP fallback … spec 097-crd-user-settings, tasks T033a–T033f` comment marking them for removal). Because the **default design version is CRD (`2`)**, this inconsistency is **user-visible today**: a user on the new design who clicks "Create Innovation Pack" or "Create Innovation Hub" is dropped into a visually mismatched MUI dialog inside the CRD shell. It is also an architectural leak — `src/main/crdPages/**` must not depend on `@mui/*`, but these two files transitively do, solely because of these dialogs.

This feature closes that gap by delivering **two CRD-native creation dialogs** (Create Innovation Pack and Create Innovation Hub) and wiring them into both CRD account tabs, retiring the MUI fallback at those entry points. The existing MUI dialogs stay in the codebase for any non-migrated (legacy design) surfaces, consistent with the migration guide's "old MUI files stay" rule.

### Prototype vs. MUI: where the design and behavior come from

There is **no prototype design** for either dialog. Per the user's instruction, the dialogs are a **straight port of the existing MUI create flows** — same fields, same validation, same behavior — re-skinned in CRD (shadcn/ui + Tailwind) and following the established CRD dialog conventions (sticky header/footer, the presentational-component + integration-hook split). The CRD Create Space dialog (spec 105) and Create Subspace dialog are the structural references for *how* a CRD creation dialog is built; the *fields and behavior* come from the MUI Innovation Pack / Innovation Hub create forms.

### What the MUI create dialogs actually collect (the parity baseline)

Both MUI dialogs reuse a shared form component that renders **fewer fields in create mode** than in edit mode — the create step intentionally captures only the essentials, then the remaining fields (tags, avatar/banner, references, store listing, search visibility) are edited afterwards on the resource's full settings page. A "save first for more details" hint is shown in place of the deferred fields. This two-step model is preserved.

**Create Innovation Pack — fields collected on create:**

| Field | Required | Rules |
|---|---|---|
| Name (display name) | Yes | 3–128 chars, not blank/spaces-only |
| Description (markdown) | Yes | max 8000 chars |

Deferred to the pack settings page (NOT in the create dialog): avatar image, tags, references, "listed in store" toggle, search visibility.

**Create Innovation Hub — fields collected on create:**

| Field | Required | Rules |
|---|---|---|
| Subdomain | Yes | 3–25 chars, lowercase letters / digits / hyphens only; editable only at creation |
| Name (display name) | Yes | 3–128 chars, not blank/spaces-only |
| Tagline | No | max 512 chars |
| Description (markdown) | Yes | max 8000 chars |

Deferred to the hub settings page (NOT in the create dialog): tags, banner image. The hub is always created as a "List"-type hub (the same fixed type the MUI dialog sends); the space-list filter starts empty.

**In scope:**

- Two CRD presentational creation dialog components (`src/crd/`), each fed entirely by props/callbacks.
- An integration hook + connector per dialog (`src/main/crdPages/`) reusing the existing GraphQL creation mutations and account-scoping logic. (No separate data mapper is needed — these dialogs map form values to mutation input in the hook, rather than mapping existing GraphQL entities to view props.)
- Wiring both CRD dialogs into the CRD contributor account pages (user account and organization account), replacing the MUI `CreateInnovationPackDialog` / `CreateInnovationHubDialog` imports there.
- CRD translations for all supported languages (en, nl, es, bg, de, fr) in the same PR.
- Standalone-preview (`pnpm crd:dev`) coverage with mock data.

**Out of scope:**

- The full Innovation Pack / Innovation Hub **settings/edit** pages (where deferred fields are edited) — only the *create* dialogs are migrated here.
- Adding fields beyond what the MUI create flows collect (no new functionality — strict field parity).
- Changing the entitlement/privilege rules that decide *whether* the "Create" action is offered (already handled on the account page and unchanged).
- Migrating the MUI dialogs' other (legacy-design) callers, or deleting the MUI dialogs.
- Any change to the backend creation mutations or the underlying data model.

## Clarifications

### Session 2026-06-15

- Q: Description field — required + markdown (MUI parity) or optional + plain text (shipped CRD dialog)? → A: **Required, markdown editor** (strict MUI parity).
- Q: Name validation — 3–128 chars (MUI parity) or non-blank only (shipped CRD dialog)? → A: **3–128 chars, not blank/spaces-only**; reuse an existing shared name validator (e.g. the `displayName` validator the MUI create forms already use) if one fits, otherwise follow the same repeated validation pattern.
- Q: Post-create behavior — navigate to the new resource's settings page (shipped CRD hook) or close + refetch + toast with no navigation (MUI parity)? → A: **Close + refetch + toast, no navigation** (strict MUI parity).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create an Innovation Pack on the new design (Priority: P1)

A signed-in user on the CRD design opens their account tab, clicks "Create Innovation Pack", fills in the CRD-styled dialog (name + description), and creates the pack. The dialog closes, the new pack appears in their account's pack list, and a success confirmation is shown.

**Why this priority**: This is the primary user-visible gap for packs. Without it, every new-design user creating a pack sees a mismatched MUI dialog. It also removes a `@mui/*` dependency from `src/main/crdPages/**`.

**Independent Test**: With the design version set to CRD, open the user account tab, trigger "Create Innovation Pack", complete name + description, confirm the pack is created and listed — entirely on CRD styling, with no MUI dialog appearing.

**Acceptance Scenarios**:

1. **Given** a CRD-design user on their account tab who is entitled to create an Innovation Pack, **When** they click "Create Innovation Pack", **Then** a CRD-styled dialog opens with a sticky header, scrollable body, and sticky Cancel / Create actions.
2. **Given** the open dialog, **When** the user enters a valid name and description, **Then** the Create action is enabled.
3. **Given** valid input, **When** the user clicks Create, **Then** the pack is created in the correct account, the dialog closes, the account's pack list refreshes to include it, and a success confirmation is shown.
4. **Given** required fields are missing or invalid (empty/blank name, empty description, over-length values), **When** the user attempts to submit, **Then** the Create action is blocked and the offending fields show validation feedback.
5. **Given** the user clicks Cancel or dismisses the dialog, **Then** no pack is created and entered data is discarded.

---

### User Story 2 - Create an Innovation Hub on the new design (Priority: P1)

A signed-in user on the CRD design opens their account tab, clicks "Create Innovation Hub", fills in the CRD-styled dialog (subdomain, name, tagline, description), and creates the hub. The dialog closes, the new hub appears in their account's hub list, and a success confirmation is shown.

**Why this priority**: The Innovation Hub create gap is equal in severity to the pack gap — both are the same kind of MUI-inside-CRD inconsistency and the same `@mui/*` leak. Delivering it is required for the account tab to be fully CRD-native for creation.

**Independent Test**: With the design version set to CRD, open the user account tab, trigger "Create Innovation Hub", complete subdomain + name + description (tagline optional), confirm the hub is created and listed — entirely on CRD styling, with no MUI dialog appearing.

**Acceptance Scenarios**:

1. **Given** a CRD-design user on their account tab who is entitled to create an Innovation Hub, **When** they click "Create Innovation Hub", **Then** a CRD-styled dialog opens with the subdomain, name, tagline, and description fields and sticky Cancel / Create actions.
2. **Given** the open dialog, **When** the user types a subdomain, **Then** the subdomain is validated against the allowed format (3–25 lowercase letters/digits/hyphens) and invalid input is rejected with clear feedback.
3. **Given** a valid subdomain, name, and description, **When** the user clicks Create, **Then** the hub is created (as a List-type hub) in the correct account, the dialog closes, the account's hub list refreshes to include it, and a success confirmation is shown.
4. **Given** required fields are missing/invalid or the subdomain is already taken, **When** the user attempts to submit, **Then** the Create action is blocked or the server rejection is surfaced with a clear message, and the dialog stays open with the user's input intact.
5. **Given** the user clicks Cancel or dismisses the dialog, **Then** no hub is created and entered data is discarded.

---

### User Story 3 - Create a pack or hub in an organization account (Priority: P2)

A user with rights over an organization opens that organization's account tab and creates an Innovation Pack or Innovation Hub that belongs to the organization's account rather than their personal one.

**Why this priority**: The same two dialogs serve both the user account tab and the organization account tab. Organization-scoped creation is common for teams, but it reuses the User Story 1/2 flows with a different target account, so it ranks just below the personal-account cases.

**Independent Test**: On an organization account tab (CRD), trigger "Create Innovation Pack" (and separately "Create Innovation Hub"), create each, and verify each is created under the organization's account, not the user's personal account.

**Acceptance Scenarios**:

1. **Given** an organization account tab on CRD where the viewer may create these resources, **When** they open and complete the Create Innovation Pack dialog, **Then** the pack is created in the organization's account.
2. **Given** the same context, **When** they open and complete the Create Innovation Hub dialog, **Then** the hub is created in the organization's account.

---

### User Story 4 - Be told clearly when creation isn't possible (Priority: P2)

When creation cannot proceed — the account lacks the entitlement for that resource, or the server rejects the request (e.g. a duplicate subdomain) — the user is told clearly instead of the flow failing silently.

**Why this priority**: A creation flow that fails without explanation is worse than no migration. Clear failure handling protects the primary flows from looking broken.

**Independent Test**: Force a no-entitlement condition for each resource and confirm the existing "capacity reached / contact us" messaging still triggers instead of the create dialog; force a server error (e.g. duplicate subdomain) and confirm a clear message appears and input is preserved.

**Acceptance Scenarios**:

1. **Given** an account without the entitlement for a given resource, **When** the user clicks its "Create" action, **Then** the existing no-entitlement message (offering to contact the Alkemio team) is shown and the create dialog does **not** open.
2. **Given** the create dialog is open and submitted, **When** the server rejects creation (e.g. subdomain already in use, or any creation error), **Then** the user sees a clear error message, no resource is created, and the dialog remains open with input intact so they can retry.

---

### User Story 5 - Preview the dialogs in the standalone demo (Priority: P3)

A designer or developer opens the standalone CRD preview app to inspect and iterate on the two dialogs with mock data, without running the backend.

**Why this priority**: Useful for design iteration and visual QA but not required for end users. It follows the established CRD practice for migrated surfaces.

**Independent Test**: Run the standalone preview, open each create dialog entry, and confirm it renders with representative mock data including validation-error and submitting states.

**Acceptance Scenarios**:

1. **Given** the standalone preview app, **When** each create dialog is opened, **Then** it renders with mock data and no backend dependency.
2. **Given** the preview, **When** representative states are exercised (valid input, validation errors, submitting), **Then** each renders correctly.

### Edge Cases

- **Deferred fields messaging**: the create dialogs must make clear (mirroring the MUI "save for more details" hint) that tags, images, and other secondary attributes are set after creation, so the absence of those fields is not confusing.
- **Subdomain format**: a subdomain with uppercase letters, spaces, or other disallowed characters is rejected at validation time with clear feedback before submission.
- **Duplicate subdomain**: a syntactically valid but already-taken subdomain is rejected by the server; the dialog surfaces the rejection and keeps the user's input.
- **Required description**: both dialogs require a description (matching the MUI validation); an empty description blocks submission.
- **Very long content / small viewport**: each dialog keeps its header and Create/Cancel actions reachable while the middle content scrolls, on laptops and phones in landscape.
- **Slow / double submit**: while creation is in flight, the Create action shows progress and cannot be double-submitted, and the dialog cannot be dismissed in a way that leaves an orphaned resource.
- **Account context still loading**: if the target account hasn't loaded, the dialog does not allow submission until the account is known.
- **Multiple entry points**: each dialog behaves identically whether launched from the user account tab or the organization account tab.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a **Create Innovation Pack** dialog and a **Create Innovation Hub** dialog, both rendered entirely in the CRD design system (no MUI/Emotion), launched from the CRD contributor account tabs (user account and organization account).
- **FR-002**: The Create Innovation Pack dialog MUST collect exactly the fields the MUI create flow collects: a **name** (required; 3–128 chars; not blank/spaces-only) and a **markdown description** (required; max 8000 chars). It MUST NOT add other fields; avatar, tags, references, store-listing, and search-visibility remain edited on the pack settings page after creation, and the dialog MUST indicate (per the MUI "save for more details" hint) that those are set later. The name rule MUST reuse an existing shared name validator where one fits, rather than introducing a new validation idiom (Clarifications 2026-06-15).
- **FR-003**: The Create Innovation Hub dialog MUST collect exactly the fields the MUI create flow collects: a **subdomain** (required; 3–25 chars; lowercase letters, digits, and hyphens only), a **name** (required; 3–128 chars; not blank/spaces-only), a **tagline** (optional; max 512 chars), and a **markdown description** (required; max 8000 chars). It MUST NOT add other fields; tags and banner remain edited on the hub settings page after creation, and the dialog MUST indicate (per the MUI "save for more details" hint) that those are set later. The name rule MUST reuse the same shared name validator as FR-002.
- **FR-004**: Each dialog MUST block submission and surface field-level validation feedback when required fields are missing or invalid (empty/blank name, empty description, over-length values, malformed subdomain), and MUST keep the Create action disabled until the form is valid.
- **FR-005**: Each dialog MUST create its resource in the **correct target account** — the current user's account when opened from the user account tab, or the organization's account when opened from the organization account tab.
- **FR-006**: The Innovation Hub MUST be created as a **List-type hub** with an empty space-list filter (matching the MUI behavior), since the create dialog does not collect hub type or filter.
- **FR-007**: On successful creation, each dialog MUST close, refresh the relevant account/resource listings so the new resource appears, and show a success confirmation. The flow MUST NOT navigate the user away (no auto-redirect to the new resource's settings page) — matching the MUI dialogs; the new resource is reached from the refreshed account list (Clarifications 2026-06-15).
- **FR-008**: On server error (including a duplicate/in-use subdomain), each dialog MUST surface a clear error message, create no resource, and remain open with the user's input preserved so they can retry.
- **FR-009**: During creation each dialog MUST indicate progress and prevent duplicate submissions.
- **FR-010**: The existing **entitlement gating** MUST be preserved unchanged: clicking a "Create" action when the account lacks that resource's entitlement MUST show the existing no-entitlement message (offering to contact the Alkemio team) instead of opening the create dialog. This gating lives on the account tab and is upstream of the dialogs.
- **FR-011**: Each dialog MUST keep its header and primary actions reachable on small viewports, scrolling only the middle content (per the CRD sticky-header/footer dialog pattern).
- **FR-012**: Both dialogs and all their text MUST be fully internationalized for the CRD-supported languages (en, nl, es, bg, de, fr), with do-not-translate platform terms left in English per the glossary, all delivered in the same change.
- **FR-013**: Each dialog MUST meet WCAG 2.1 AA: keyboard operability, visible focus, labeled controls, and an accessible close affordance.
- **FR-014**: Both account tabs (user and organization) MUST be switched from the MUI `CreateInnovationPackDialog` / `CreateInnovationHubDialog` to the new CRD dialogs, removing those two MUI imports (and their transitive `@mui/*` dependency) from `src/main/crdPages/**` at these entry points.
- **FR-015**: Each CRD dialog presentational component MUST receive all data and behavior via props/callbacks (no GraphQL types, no data fetching, no navigation inside the component), with the GraphQL-to-props mapping confined to the integration layer.
- **FR-016**: Both dialogs MUST be previewable in the standalone CRD demo app with mock data, including their key states.
- **FR-017**: The legacy MUI Create Innovation Pack and Create Innovation Hub dialogs MUST remain in the codebase for any non-migrated/legacy-design surfaces (no deletion as part of this feature).
- **FR-018**: Each dialog's subtitle/heading context SHOULD identify the **target account** consistently with the other migrated create dialogs (e.g. naming the organization when launched from an organization account, or "your account" for the user's own account).

### Key Entities *(include if feature involves data)*

- **Innovation Pack**: an account-scoped, reusable bundle of templates/content. On creation it carries a name and description; its avatar, tags, references, store-listing, and search-visibility are set afterwards on its settings page.
- **Innovation Hub**: an account-scoped, branded space-listing site reachable at a subdomain. On creation it carries a subdomain, name, optional tagline, description, and a fixed List type with an empty space-list filter; its tags and banner are set afterwards on its settings page.
- **Account**: the owner context the resource is created under — a user's personal account or an organization's account; determines available entitlements and which resources can be created.
- **Entitlement**: the per-account capability that gates whether each resource type can be created (Innovation Pack entitlement, Innovation Hub entitlement); already evaluated on the account tab.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of CRD account-tab "Create Innovation Pack" and "Create Innovation Hub" entry points open the CRD dialogs; the MUI versions never appear on the new design.
- **SC-002**: A user can create an Innovation Pack (name + description) and an Innovation Hub (subdomain + name + description) from their account tab in the new dialogs in under 1 minute each, and see the new resource listed.
- **SC-003**: Every field and validation rule the MUI create flows enforce is preserved exactly — strict field parity, no fields added or removed, zero functional regressions.
- **SC-004**: Each dialog's header and Create/Cancel actions remain visible and usable at a 768-pixel-tall viewport regardless of content length.
- **SC-005**: All dialog text renders in each of the six supported languages with no missing keys and platform terms preserved per the glossary.
- **SC-006**: `src/main/crdPages/**` carries no `@mui/*` / `@emotion/*` dependency introduced by the Create Innovation Pack or Create Innovation Hub entry points after migration.
- **SC-007**: Failure cases (no entitlement, duplicate subdomain, server error) each produce a clear, understandable message and never silently fail or create an orphaned resource.

## Assumptions

- **Strict field parity, no prototype.** There is no prototype design; the dialogs replicate the existing MUI create forms' fields, requiredness, length/format rules, and behavior exactly (confirmed in Clarifications 2026-06-15). The CRD Create Space / Subspace dialogs provide the structural/styling pattern only.
- **Two-step model preserved.** The create dialogs collect only the create-mode fields; secondary attributes (pack avatar/tags/references/store-listing/visibility; hub tags/banner) are edited afterwards on each resource's settings page, with a "save for more details"-style hint shown in the dialog. Those settings pages are out of scope here.
- **Description is required, rendered as a markdown editor** (strict MUI parity — Clarifications 2026-06-15). Because the description uses the markdown editor, each dialog needs the account-scoped storage context the editor relies on for temporary-location uploads before the resource exists (as the CRD Create Space dialog already does), not a plain text area.
- **Name validation reuses a shared validator.** Name is 3–128 chars, not blank/spaces-only; reuse the existing shared name validator the MUI create forms use rather than a new idiom (Clarifications 2026-06-15).
- **No post-create navigation.** Success closes the dialog, refreshes the account listings, and toasts — it does not navigate to the new resource (strict MUI parity — Clarifications 2026-06-15). The new resource is reached from the refreshed account list.
- **Entitlement gating is unchanged and upstream.** Whether a "Create" action is offered, and the no-entitlement "contact us" message, are already handled by the account tab (`tryCreate` against the relevant account entitlement) and are not modified.
- **Subdomain uniqueness is server-enforced.** The dialog validates subdomain *format* on the client (3–25 lowercase alphanumeric/hyphen); uniqueness is enforced by the server on submit and surfaced as an error, matching the MUI flow. A live availability indicator is not required.
- **Reuse, don't rebuild, the data layer.** The feature reuses the existing `createInnovationPack` / `createInnovationHub` mutations, account-scoping, and entitlement logic; only presentation and integration wiring are new, following the Create Space precedent.
- **Translation namespace.** New strings go to a CRD feature namespace, maintained manually for all six languages in the same PR (exact namespace is an implementation detail — reusing an existing contributor-settings/templates namespace or adding dedicated keys are both acceptable, as long as all six languages stay in parity).
- **Pre-existing partial CRD scaffolding.** Any partially-started CRD Innovation Pack/Hub components found in `src/crd/` are not currently wired into the account tabs (which still use the MUI dialogs); this feature is the source of truth for the create dialogs and should consolidate or replace such scaffolding rather than leave two competing implementations.

## Dependencies

- The CRD contributor account tabs (user and organization) are already migrated and provide the "Create Innovation Pack" / "Create Innovation Hub" actions, entitlement gating, and target-account context.
- The existing `createInnovationPack` and `createInnovationHub` mutations, account-information queries, and entitlement logic remain available and unchanged.
- The CRD Create Space dialog (spec 105) and Create Subspace dialog serve as the structural reference pattern (presentational component + integration hook/connector, sticky header/footer).
- The CRD design system primitives (dialog, inputs, textarea/markdown field, buttons) and the i18n + glossary infrastructure are in place.
- The standalone CRD preview app is available for mock-data previewing.
