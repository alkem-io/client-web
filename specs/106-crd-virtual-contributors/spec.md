# Feature Specification: CRD Virtual Contributors Migration

**Feature Branch**: `106-crd-virtual-contributors`
**Created**: 2026-06-09
**Status**: Draft
**Input**: User description: "read CLAUDE.md and docs/crd/*.md specially migration-guide.md we are gonna work on VirtualContributors or 'VCs' area start a spec folder etc... we are gonna migrate everything related to VCs dialogs and screens that's left"

## Context & Background

The Virtual Contributor (VC) area is partway through the MUI → CRD design-system migration. Several pieces are already live on CRD and gated by the per-user design-version toggle (default = CRD), specifically:

- The **VC public profile page** (`/vc/:nameId`) and its content/sidebar/hero.
- The **VC settings pages** — Profile, Settings, and Membership tabs.
- The **VirtualContributorInviteDialog** CRD component (invite a VC into a community).

These are wired through `CrdVCRoutes` and selected at the route level by `crdEnabled ? <CrdVCRoutes /> : <VCRoute />`.

Because the default design version is CRD, **the gaps are user-visible today**: a user on the new design who tries to create a VC, browse a VC's Knowledge Base, add an existing VC to a community from certain entry points, or use advanced VC admin configuration is dropped back into MUI-styled screens (or a visually inconsistent dialog). This feature closes those gaps so the VC area is fully consistent on the new design.

This spec covers **everything VC-related still on MUI**. Where a CRD equivalent already exists (e.g. the invite dialog), the work is to **wire it in and retire the legacy fallback at every entry point** rather than rebuild it ("wire up & retire gaps"). Where no CRD equivalent exists, the screen/dialog is migrated.

**Out of scope:**

- **Already migrated, not re-audited here:** the VC public profile page, the three VC settings tabs, the core `VirtualContributorInviteDialog` presentational component, and the in-community VC *display* section (handled by the space-page migration — see `src/crd/components/space/sidebar/VirtualContributorsSection.tsx`).
- **Platform-admin VC conversion/transfer:** the `/admin/*` area is not gated by the CRD design toggle (it always renders MUI), so there is no CRD shell for an isolated VC-conversion surface. It is deferred until the platform-admin area as a whole is migrated.

## Clarifications

### Session 2026-06-09

- Q: How should the VC prompt graph / state-machine configuration UI be handled this round? → A: Full CRD migration now (rebuild the graph visualization natively in CRD; no interim treatment).
- Q: What presentation form should the migrated VC creation wizard and Knowledge Base take? → A: The Knowledge Base is promoted to a full-page CRD route; the creation wizard stays a CRD dialog (the CRD equivalent of the legacy modal wizard), opened from each launch point with the target account passed directly.
- Q: How should the add-VC-to-community picker/preview be built? → A: Reuse existing CRD patterns (InviteMembersDialog-style search + the existing `VirtualContributorInviteDialog`), not a bespoke component.
- Q: What is the parity bar for migrated surfaces? → A: Behavior parity with the CRD visual language — preserve all behavior, data, permissions, and states exactly, but render in CRD styling (not pixel-identical to the legacy layout).
- Q: How should the platform-admin VC conversion/transfer surface be treated, given `/admin/*` is not gated by the CRD design toggle? → A: Exclude it from this spec — it has no CRD shell to live in; migrate it when the platform-admin area as a whole moves to CRD.
- Q: What is the scope of the add-VC-to-community story, given a CRD VC display section already exists for spaces? → A: Add flow + browse-to-add only — pure display of VCs already in a community is treated as handled by the space-page migration; only the invite dialog and the browse-to-add picker are in scope here.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Virtual Contributor on the new design (Priority: P1)

A user on the new design clicks "Create Virtual Contributor" from a CRD surface that offers it (the CRD dashboard, or the user/organization account tab) and completes the multi-step creation flow — presented as a CRD dialog — choosing a creation path, adding initial content/knowledge, naming and configuring the VC, without ever leaving the new design system.

**Why this priority**: Creating a VC is the primary entry into the whole VC lifecycle and is launched directly from already-migrated CRD pages (dashboard, account tabs). Today those CRD pages open the old MUI wizard, which is the most jarring and most-hit inconsistency. It is the largest single piece and unblocks everything downstream. The flow is the CRD equivalent of the legacy modal wizard — a single CRD dialog (sticky header/footer, scrollable middle) opened from the launch point, which passes the target account directly. The launch point owns the dialog's open state; transient sub-dialogs (external-AI configuration, "coming soon") layer over it, and the wizard ends with a final info/confirmation step. Closing the dialog (X button, Esc, overlay click) discards any in-progress input — matching the legacy wizard's direct-close behaviour. (The interactive "try the VC" demo dialog is a separate space-dashboard surface, not part of the wizard — out of scope here.) (Note: MUI-only launch surfaces such as the legacy dashboard campaign block and the legacy space dashboard are not reachable when the new design is active, so they are not CRD launch points; only the create action on CRD surfaces is in scope.)

**Independent Test**: With the new design active, trigger "Create Virtual Contributor" from each launch point and complete the wizard end-to-end to a created VC; confirm every step, sub-dialog (external-AI configuration, "coming soon"), content-add step, and the final info step render in the new design with no MUI styling.

**Acceptance Scenarios**:

1. **Given** the new design is active and the user has an account that can host a VC, **When** they launch "Create Virtual Contributor" from the dashboard, **Then** the creation dialog opens in the new design and lets them complete all steps to a successfully created VC.
2. **Given** the user is partway through the creation flow, **When** they close the dialog (X button, Esc, or overlay click), **Then** the wizard is dismissed, no partially-created VC is persisted, and in-progress input is discarded.
3. **Given** the user reaches the external-AI / persona configuration step, **When** they open it, **Then** the configuration (and any "coming soon" placeholder) renders in the new design.
4. **Given** the user has completed the required steps, **When** the wizard reaches its final step, **Then** a confirmation/info step renders in the new design with a link to the newly created VC.
5. **Given** the user launches creation from any CRD surface that offers it (CRD dashboard, user account tab, organization account tab), **Then** the same new-design dialog flow is used from every such entry point.

---

### User Story 2 - Browse a Virtual Contributor's Knowledge Base (Priority: P2)

A user viewing a VC opens its Knowledge Base (Body of Knowledge) — presented as a full-page CRD route — to see what the VC knows and, if they have rights, refresh or manage it, all in the new design.

**Why this priority**: The Knowledge Base is the second-most-prominent VC surface and is reachable directly from the (already-migrated) CRD profile page and via the `/vc/:nameId/knowledge-base` route, so on the new design it currently leads into an MUI dialog. High visibility, self-contained. It is promoted from the legacy modal dialog to a full-page CRD route.

**Independent Test**: With the new design active, open a VC's Knowledge Base from the profile page and from a direct URL; confirm the listing, empty state, and (for authorized users) the refresh/management controls render in the new design.

**Acceptance Scenarios**:

1. **Given** the new design is active, **When** a user opens a VC's Knowledge Base from the profile, **Then** its contents render in the new design.
2. **Given** the VC has no knowledge yet, **When** the Knowledge Base is opened, **Then** a new-design empty state is shown.
3. **Given** a user with management rights, **When** they open the Knowledge Base, **Then** refresh / Body-of-Knowledge management controls are available and styled in the new design.
4. **Given** a user without management rights, **Then** the management controls are not shown.

---

### User Story 3 - Add an existing Virtual Contributor to a community (Priority: P2)

A space/community admin adds an existing VC to their community from any entry point (community page, space about dialog, member-management surfaces), reusing the already-built CRD invite dialog and the existing CRD picker patterns for search/browse-to-add/preview — with the legacy MUI add/invite/preview/browse-to-add dialogs fully retired. This story is the **add flow only**; displaying VCs already in a community is treated as handled by the space-page migration (the existing CRD VC display section) and is out of scope here.

**Why this priority**: Add-to-community is a frequent admin action with several legacy add/browse-to-add entry points (`InviteVCsDialog`, `InviteVirtualContributorDialog`, `PreviewContributorDialog`, and the browse-to-add `VirtualContributorsDialog`). A CRD invite dialog already exists and the picker/preview are built on existing CRD patterns (`InviteMembersDialog`-style search + `VirtualContributorInviteDialog`) rather than a bespoke component; the work is mostly wiring, so it is high-value-per-effort. (The display-only `VirtualContributorsBlock` is not in scope — VC display in a community is covered by the space-page migration.)

**Independent Test**: With the new design active, from each community entry point, open the add-VC flow, search/browse available VCs, preview one, and add it; confirm every step uses the new design and no legacy MUI VC dialog is reachable.

**Acceptance Scenarios**:

1. **Given** the new design is active, **When** an admin opens "add Virtual Contributor" from a community surface, **Then** a new-design dialog lets them search and browse available VCs.
2. **Given** the admin selects a VC, **When** they preview it, **Then** the preview renders in the new design.
3. **Given** the admin confirms, **Then** the VC is added with an optional message, using the existing CRD invite dialog.
4. **Given** the new design is active, **Then** none of the legacy MUI VC add/invite/preview dialogs are reachable from any entry point.

---

### User Story 4 - Configure advanced VC behavior as an admin (Priority: P3)

A VC admin manages advanced configuration — persona prompt, external-AI engine settings, store/search visibility, and Body-of-Knowledge management — in the new design.

**Why this priority**: Advanced admin configuration is lower-traffic and more complex (including the prompt state-machine graph UI, which is fully rebuilt natively in CRD this round). It rounds out parity for power users but is not part of the everyday user journey.

**Independent Test**: With the new design active, open each advanced VC configuration surface and change a setting; confirm it renders and saves in the new design.

**Acceptance Scenarios**:

1. **Given** the new design is active, **When** a VC admin edits the persona prompt, **Then** the prompt editor renders in the new design and saves changes.
2. **Given** an externally-hosted VC, **When** the admin opens external-AI engine configuration, **Then** it renders in the new design.
3. **Given** the admin changes store/search visibility, **Then** the visibility controls render in the new design and persist.
4. **Given** the prompt is represented as a graph/state machine, **When** the admin views and edits it, **Then** the graph UI is rendered natively in the new design with full editing parity.

---

### User Story 5 - Consistent VC presence across the app (Priority: P3)

Anywhere a VC appears as a small UI element — the "Virtual Contributor" label/chip on avatars and lists, and VC-related in-app notifications — it matches the new design.

**Why this priority**: These are small, cross-cutting elements with broad reach but low individual complexity. They polish overall consistency once the major flows are done.

**Independent Test**: With the new design active, locate the VC label/chip on contributor lists and a VC-related in-app notification; confirm both render in the new design.

**Acceptance Scenarios**:

1. **Given** the new design is active, **When** a VC is shown in a contributor list or avatar context, **Then** its "Virtual Contributor" label/indicator renders in the new design.
2. **Given** a VC-related in-app notification (e.g. a VC invited to a community, or that invitation declined), **When** it appears, **Then** it renders in the new design.

---

### User Story 6 - Preview every migrated VC surface in the standalone demo app (Priority: P3)

A designer or developer runs the standalone CRD preview app (`pnpm crd:dev`, `localhost:5200`) with no backend and reaches every migrated VC surface — the creation wizard, the Knowledge Base, the add-to-community invite/preview flow, the advanced admin prompt-graph config, and the VC badge — each rendered with hardcoded mock Virtual Contributors, so the visuals can be iterated on in isolation.

**Why this priority**: The standalone app is the design-iteration harness for the whole CRD layer — every other migrated area (spaces, dashboard, templates, the VC public profile) already has a demo page with mock data. The new VC surfaces are the most complex builds in this feature (the wizard and prompt-graph editor especially), so backend-free preview is where their states are easiest to exercise. It is cross-cutting tooling, not part of the production user journey, so it is the lowest priority — but, like the existing VC profile demo, it is treated as part of "migrating a VC surface", not an afterthought.

**Independent Test**: Run `pnpm crd:dev`, open each VC demo route from the platform-navigation menu, and confirm the wizard (all three creation paths + sub-dialogs), the Knowledge Base (populated + empty + authorized-refresh), the add-to-community dialog (search → preview → confirm), the prompt-graph card (system nodes read-only, user nodes editable), and the VC badge all render correctly against hardcoded data with no backend running.

**Acceptance Scenarios**:

1. **Given** the standalone demo app is running, **When** a designer opens the VC creation wizard demo route, **Then** the wizard dialog renders with hardcoded selectable spaces and lets them step through every path and sub-dialog against mock data.
2. **Given** the demo app is running, **When** the Knowledge Base demo route is opened, **Then** it renders with hardcoded knowledge items, and a toggle/variant demonstrates both the populated and empty states plus the authorized refresh control.
3. **Given** the demo app is running, **When** the add-to-community demo is opened, **Then** the CRD invite dialog opens with hardcoded available VCs and routes selection through the preview view before the (no-op) confirm.
4. **Given** the demo app is running, **When** the advanced-config demo route is opened, **Then** the prompt-graph card renders with hardcoded system (read-only) and user (editable) nodes and exercises Save/Reset against mock data.
5. **Given** the demo app is running, **Then** the VC badge is shown in at least one demo context and the platform-navigation menu exposes every VC demo route as a labelled "(preview)" entry.

---

### User Story 7 - Restrict Knowledge Base callout features for Virtual Contributors (Priority: P2)

A user with create rights adds a callout to a Virtual Contributor's Knowledge Base in the new design, and the create-callout dialog only offers the features a VC's knowledge base supports — **no comments**, **no special framing (None only)**, and only **"Posts"** and **"Links & Files"** as response types — matching the long-standing MUI `calloutRestrictions` behavior.

**Why this priority**: The Knowledge Base "Add callout" capability now exists in CRD (extends US2), but the shared CRD create-callout dialog exposes the full feature set (all framing types, all response types, framing- and contribution-level comment toggles, rich-media upload). A VC's knowledge base does not support comments, the whiteboard/memo/document/CTA/media-gallery framings, or the memo/whiteboard response types; offering them produces invalid or unsupported callouts. MUI already constrains this via `CalloutRestrictions` (`virtualContributorsCalloutRestrictions`); CRD must reach the same parity. Scoped P2 because it directly affects the correctness of the just-migrated KB create flow.

**Independent Test**: With the new design active, open "Add" on a VC Knowledge Base; confirm the framing-type chooser is absent (None only), the response-type chooser offers only Posts and Links & Files, and no framing- or contribution-level comments toggles are shown; create a callout and confirm it is persisted with framing type None, comments disabled, and a Posts/Links response.

**Acceptance Scenarios**:

1. **Given** the new design is active and a user with create rights opens the KB "Add callout" dialog, **When** the dialog renders, **Then** no framing-type selection is offered (framing is None) and neither the framing- nor contribution-level comments toggle is present.
2. **Given** the same dialog, **When** the user reaches the response-type chooser, **Then** only "Posts" and "Links & Files" are selectable (memo and whiteboard are not offered).
3. **Given** the user completes the form, **When** the callout is created, **Then** it is persisted with framing type None, framing and contribution comments disabled, and the chosen Posts/Links response type.
4. **Given** the same shared create-callout dialog used elsewhere (e.g. a normal space tab) **without** restrictions supplied, **Then** it continues to offer the full framing/response/comment/rich-media feature set unchanged (no regression).

---

### Edge Cases

- **Authorization differences**: a viewer without management/admin rights must never see refresh, prompt, or visibility controls — parity must preserve the legacy permission gating exactly.
- **External vs. platform-hosted VCs**: external-AI VCs expose different configuration than platform-hosted ones; the migrated screens must branch the same way the legacy ones do.
- **Empty / loading / error states**: each migrated screen and dialog must present new-design loading, empty, and error states (no VC found, knowledge base empty, no available VCs to add, creation failure).
- **Deep links**: a direct URL to a VC sub-route (e.g. `/vc/:nameId/knowledge-base`) on the new design must resolve to the new-design surface, not fall back to MUI.
- **Mid-flow exit**: the creation wizard is a CRD dialog; closing it (X button, Esc, overlay click) before the VC is created must not leave a partially-created VC. In-progress input is discarded on close (no separate confirm dialog, matching the legacy wizard).
- **Toggle off (legacy design)**: users who opted into the legacy design must continue to see the existing MUI screens unchanged — nothing in this feature removes the legacy path while the toggle exists.
- **Sticky dialog chrome**: any migrated dialog whose body can grow (the VC picker, the creation wizard, and wizard sub-dialogs such as external-AI config) must keep its header/footer pinned and scroll only the middle, per the CRD dialog layout rule. The Knowledge Base is a full page, not a dialog, and follows page-scroll behavior instead.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the new design is active, the system MUST present the entire VC creation flow as a CRD dialog (sticky header/footer, scrollable middle) — with its transient sub-dialogs (external-AI configuration, "coming soon" placeholder), content-add steps, and final info/confirmation step rendered in the new design — opened from every CRD launch point that offers VC creation (CRD dashboard, user/organization account tabs). The launch point owns the dialog's open state and passes the target account directly. Closing the dialog (X button, Esc, overlay click) discards any in-progress input. The interactive "try the VC" demo dialog is a separate space-dashboard surface and is out of scope.
- **FR-002**: When the new design is active, the system MUST present a VC's Knowledge Base (Body of Knowledge) as a full-page CRD route — listing, empty state, and authorized management/refresh controls — reachable from the VC profile and via the VC knowledge-base route. The page MUST surface the knowledge base **description** (a **markdown** field): rendered read-only for viewers, and edited **in place** (a pencil affordance reveals a CRD markdown editor with Save/Cancel) for users with KB Create privilege, persisted through the existing `updateVirtualContributor` mutation (`knowledgeBaseData.profile.description`) — parity with the legacy MUI Knowledge Base dialog's description field.
- **FR-003**: When the new design is active, the system MUST let an admin add an existing VC to a community via a new-design flow (search/browse available VCs, preview, confirm with optional message) built on the existing CRD picker patterns (`InviteMembersDialog`-style search) and the existing CRD invite dialog, from every community entry point. Displaying VCs already in a community is out of scope (handled by the space-page migration).
- **FR-004**: The system MUST make the legacy MUI VC add/invite/preview dialogs and the legacy browse-to-add VC dialog unreachable when the new design is active (retire the fallback at every add entry point). The display-only VC block is not covered by this requirement.
- **FR-005**: When the new design is active, the system MUST present advanced VC admin configuration — persona prompt editing, external-AI engine settings, store/search visibility, and Body-of-Knowledge management — in the new design. **Status: four of these are already delivered** — the visibility, Body-of-Knowledge, prompt, and external-config cards are live in the existing CRD settings tab (`VCSettingsTabView`). The only outstanding surface under this requirement is the prompt graph (see FR-006); no new tasks are required for the already-delivered cards beyond regression verification.
- **FR-006**: When the new design is active, the system MUST render the prompt graph / state-machine configuration UI natively in the new design with full viewing and editing parity; no interim or MUI-fallback treatment is acceptable. Specifically: (a) the START and END terminals MUST be shown as fixed read-only **bookends** framing the node sequence (dropped from the editable node list, preserved verbatim on save); (b) node names MUST be humanized for display (e.g. `check_input` → "Check Input"); (c) the per-node prompt MUST be edited with the CRD **markdown** editor; (d) the node's "Input variables" section MUST list **all variables available** to that node (base START variables plus every upstream node's output properties), with the variables actually **referenced in the prompt highlighted (green), updating live** as the prompt is edited — consolidating the legacy MUI editor's separate "Input Variables" / "Available Input Variables" fields into one.
- **FR-007**: When the new design is active, the system MUST render a "Virtual Contributor" indicator in the new design wherever a VC appears on a CRD contributor surface (e.g. comment authors, contributor chips). No CRD VC indicator exists yet, so one MUST be created; the legacy MUI `VirtualContributorLabel` chip is not reused.
- **FR-008**: When the new design is active, the system MUST render VC-related in-app notifications (VC invited to a community; VC invitation declined) in the new design.
- **FR-009**: Each migrated screen and dialog MUST preserve the legacy permission/authorization gating exactly (management and admin controls remain hidden from unauthorized users).
- **FR-010**: Each migrated screen and dialog MUST present new-design loading, empty, and error states equivalent to (or better than) the legacy behavior.
- **FR-011**: All migrated VC surfaces MUST reuse the existing VC data layer (queries, mutations, subscriptions) without changing GraphQL contracts; only the presentation layer changes.
- **FR-012**: When the legacy design is active (user opted out), the system MUST continue to render the existing MUI VC screens unchanged; the legacy path MUST remain intact while the design toggle exists.
- **FR-013**: All newly-migrated VC presentational components MUST contain no business-logic, GraphQL-type, or MUI dependencies, with data and behavior supplied as plain props/callbacks, consistent with the rest of the new design layer.
- **FR-014**: All user-visible text in migrated VC surfaces MUST be translatable via the project's i18n mechanism, with the agreed do-not-translate platform terms (including "Virtual Contributor") left in English per the glossary.
- **FR-015**: Every navigational URL used by migrated VC surfaces MUST be produced through the central URL-building seam rather than inline path templates.
- **FR-016**: Deep links to VC sub-routes MUST resolve to the new-design surface when the new design is active.
- **FR-017**: Migrated surfaces MUST achieve **behavioral parity** with their legacy counterparts — identical data, actions, permission gating, and loading/empty/error states — while rendering in the **CRD visual language**. Pixel- or layout-identical reproduction of the legacy MUI appearance is NOT a requirement; acceptance is judged on behavior and on conformance to CRD design conventions, not on matching the old look.
- **FR-018**: Every migrated VC presentational surface (creation wizard, Knowledge Base, add-to-community invite dialog + preview, prompt-graph card, VC badge) MUST be reachable as a demo page in the standalone CRD preview app (`src/crd/app/`), rendered against **hardcoded mock Virtual Contributors** with no backend, no Apollo, and no real GraphQL data — consistent with the existing VC public-profile demo (`VCProfileDemoPage`).
- **FR-019**: The standalone demo pages MUST drive the CRD components purely through props and local React state (mock callbacks may `console.log` / no-op), reusing the same pure CRD components that the production integration layer uses; no demo page may import from `@/main/*`, `@/domain/*`, `@/core/apollo`, or otherwise duplicate business logic. Demo-only data lives under `src/crd/app/data/`.
- **FR-020**: The standalone demo app MUST load the i18n namespaces the VC components depend on (`crd-contributorSettings`, `crd-community`, `crd-common`) so demo pages render fully-localized English text, and MUST expose each VC demo route from the demo platform-navigation menu as a labelled "(preview)" entry.
- **FR-021**: The system MUST provide a CRD callout-restriction mechanism — a plain-TS restriction descriptor honored by the shared CRD create-callout dialog — that can hide or limit framing types, response/contribution types, framing- and contribution-level comments, and rich-media upload. When no restriction descriptor is supplied, the dialog MUST behave exactly as today (full feature set; no regression for existing space callout creation). This mirrors the MUI `CalloutRestrictions` concept.
- **FR-022**: When the new design is active, the VC Knowledge Base "Add callout" flow MUST apply a VC preset achieving **behavioral parity** with MUI `virtualContributorsCalloutRestrictions`: framing limited to **None only**, response/contribution types limited to **Posts** and **Links & Files**, framing comments and contribution comments **disabled**, and rich-media upload **disabled** in the callout description.
- **FR-023**: Restricted/hidden callout features MUST be enforced beyond the UI: a callout created through a restricted dialog MUST be persisted with framing type None and comments disabled, so a hidden control can never produce an unsupported callout. In particular, **template imports** (the "Find Template" picker and any flow-state default template) MUST be clamped to the active restrictions on prefill — a picked template MUST NOT reintroduce a disallowed framing type, response type, or re-enable comments.
- **FR-024**: The restriction → presentational-prop derivation MUST live in the **integration layer**; the affected CRD presentational components (framing-type strip, response-type strip, response panel) MUST receive only plain optional props (allow-lists / visibility flags) and remain free of business logic, GraphQL types, and MUI dependencies (consistent with FR-013).

### Key Entities *(include if feature involves data)*

- **Virtual Contributor**: an AI contributor with a public profile (name, tagline, avatar, references, social links), memberships in communities/spaces, a hosting account, and a persona configuration. Central entity of every screen in scope.
- **Body of Knowledge (Knowledge Base)**: the corpus a VC draws on — items/callouts plus a refresh/management capability — surfaced via the Knowledge Base screen.
- **AI Persona / Engine configuration**: the VC's prompt and (for externally-hosted VCs) external-AI engine settings, including the prompt graph/state machine.
- **VC Visibility settings**: whether the VC is listed in the store and discoverable in search.
- **Community membership / invitation**: the relationship by which a VC is added to a community, created via the add-to-community flow.
- **VC in-app notification**: platform notifications about VC community invitations (sent / declined).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the new design active, a user can complete the full VC creation flow end-to-end from every launch point with zero MUI-styled screens or dialogs appearing at any step.
- **SC-002**: With the new design active, 100% of VC-related dialogs and screens reachable through the app render in the new design — no surface falls back to the legacy MUI styling.
- **SC-003**: No legacy MUI VC add/invite/preview/list dialog is reachable from any entry point when the new design is active.
- **SC-004**: Every migrated screen preserves the exact authorization behavior of its legacy counterpart, verified by checking that unauthorized users see no management/admin controls.
- **SC-005**: Users who opted into the legacy design experience no change to existing VC screens.
- **SC-006**: All VC data interactions (create, view, configure, add-to-community, refresh knowledge) succeed identically to the legacy implementation, with no GraphQL contract changes.
- **SC-007**: All user-visible strings on migrated VC surfaces are translatable, with platform terms correctly preserved in English per the glossary.
- **SC-008**: Each migrated surface reproduces its legacy counterpart's behavior, data, permissions, and states exactly, while presented in the CRD visual language — acceptance is measured on behavioral parity and CRD-convention conformance, not on matching the legacy MUI appearance.
- **SC-009**: With `pnpm crd:dev` running and no backend, every migrated VC surface (wizard, Knowledge Base, add-to-community dialog + preview, prompt-graph card, VC badge) renders end-to-end from hardcoded mock data, reachable from the demo navigation menu, with no runtime errors and no missing-translation keys.
- **SC-010**: With the new design active, the VC Knowledge Base "Add callout" dialog offers no framing-type selection, no comments toggles, and only "Posts" + "Links & Files" responses; a callout created from it is persisted with framing type None and comments disabled — and the same shared dialog used without restrictions elsewhere is verifiably unchanged.

## Assumptions

- The per-user design-version toggle remains the mechanism gating CRD vs MUI; this feature does **not** remove the toggle or delete legacy files, consistent with the migration guide ("Old MUI files stay in the codebase").
- The default design version is CRD, so closing these gaps is user-facing immediately for default users.
- The existing CRD `VirtualContributorInviteDialog` is the canonical invite UI and will be reused rather than rebuilt.
- The VC data layer (GraphQL queries/mutations/subscriptions) is stable and shared; no backend/schema changes are required for this migration.
- The prompt graph / state-machine UI is the highest-complexity surface and is sequenced last within US4, but is fully migrated to CRD this round (no interim treatment — FR-006).
- Already-migrated surfaces (public profile page, the three settings tabs) are treated as done and are not re-audited as part of this feature.
- The standalone CRD preview app (`src/crd/app/`) is the established design-iteration harness for the CRD layer; adding demo coverage for the new VC surfaces follows the existing pattern (a `*DemoPage` per surface + mock data under `app/data/` + a route and nav entry in `CrdApp.tsx`), exactly as the VC public profile already does via `VCProfileDemoPage` + `MOCK_VC_DATASYNTH`.

## Dependencies

- The CRD design-system layer (primitives, components, dialog-layout rules, typography tokens, deterministic-color fallback) and its i18n infrastructure.
- The existing VC data hooks and GraphQL documents under the VC domain.
- The central URL-building utilities for all navigation.
- The shared design-version toggle and CRD route wiring (`CrdVCRoutes`, `TopLevelRoutes`).
