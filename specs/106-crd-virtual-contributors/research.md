# Research: CRD Virtual Contributors Migration

**Feature**: `106-crd-virtual-contributors` | **Date**: 2026-06-09

This document records the Phase 0 decisions. The four product-level ambiguities were already resolved in `spec.md → Clarifications`; this file resolves the **technical** unknowns and pins the patterns to reuse, grounded in a codebase audit of the existing CRD VC implementation.

---

## D1. Reuse the established CRD 3-layer pattern (no new architecture)

**Decision**: Mirror the live VC profile/settings implementation exactly:
- **Layer 3 (presentational)** — `src/crd/components/virtualContributor/**`, plain-TS props in a sibling `*.types.ts`, zero GraphQL/MUI/router imports.
- **Layer 2 (integration)** — `src/main/crdPages/topLevelPages/vcPages/<area>/`: a `Crd…Page.tsx`/`…Tab.tsx`, a `use…Data.ts` hook (Apollo + form state + dirty/save state machine), and a `<area>Mapper.ts` (the only GraphQL↔props seam).
- **Routing** — `CrdVCRoutes.tsx` dispatches; `TopLevelRoutes.tsx` selects `crdEnabled ? <CrdVCRoutes/> : <VCRoute/>`.

**Rationale**: This pattern is already proven for the VC profile, the three settings tabs, and the invite dialog. Naming/typing conventions (`Vc<Feature>FormValues`, `Vc<Feature>ViewProps`, `Use…DataResult`, `map…`) are consistent and enforced.

**Alternatives considered**: A bespoke structure per area — rejected; breaks consistency and reviewer expectations.

---

## D2. Creation wizard — single CRD dialog with internal step state

**Decision**: Build the wizard as **one CRD dialog** holding the existing step state machine internally (no per-step routes). Relocate the orchestration logic from `src/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard.tsx` into an integration hook `useVcCreationWizard.ts`, **keeping all GraphQL calls and the step machine intact** and swapping the MUI `DialogWithGrid` shell for the CRD `Dialog` shell (`VCCreationWizardView`). Steps `initial → {addKnowledge | existingKnowledge | externalProvider} → chooseCommunity → tryVcInfo` (+ `loadingStep`) are rendered by a step switch inside the dialog body; the dialog uses the sticky-chrome layout (pinned `DialogHeader` title, scrollable `flex-1 min-h-0 overflow-y-auto` middle, pinned `DialogFooter` whose Back/Next/Create buttons vary per step).

**Account context (as implemented)**: the launch point owns the dialog's `open` state and passes the in-memory `account` object **directly as a prop** — no route, no URL, no location state. The account-tab launch points pass their resolved `account`/`accountName`; the dashboard launch points pass nothing, and the hook falls back to the current user's account via `useNewVirtualContributorMySpacesQuery`. This mirrors the legacy MUI wizard, which also received the target account in memory via `startWizard(account, accountName)`.

The dialog is rendered **in-place** wherever the launch point already lives (CRD dashboard, user/org account tab), inheriting that surface's CRD shell + auth — it is not nested under any settings route and adds no route segment.

The integration is a single **controlled dialog connector** `CrdVCCreationWizardDialog` (`{ open, onClose, account?, accountName? }`): it runs the hook (wired `onExit: onClose`), scopes Body-of-Knowledge image uploads with `StorageConfigContextProvider` once an account id resolves, and renders `VCCreationWizardView`. There are no per-context page wrappers and no breadcrumb trail (a dialog needs neither).

**Launch-point change**: `DashboardWithoutMemberships`, `DashboardWithMemberships`, `CrdUserAccountTab`, `CrdOrgAccountTab` stop rendering the MUI `{virtualContributorWizard}` inline and instead hold a local `createVcOpen` state and conditionally render `<CrdVCCreationWizardDialog open onClose={…} account={…} accountName={…} />` — dashboards pass no account (→ current user), the user account tab passes its `account`/`displayName`, the org account tab passes the org `account`/`displayName`.

**Reused hooks (unchanged)**: `useCreateVirtualContributorOnAccountMutation`, `useNewVirtualContributorMySpacesQuery`, `useAllSpaceSubspacesLazyQuery`, `useUploadVisualMutation`, `useCreateSpaceMutation`, `useRefreshBodyOfKnowledgeMutation`, `useCreateLinkOnCalloutMutation`, `useAssignRoleToVirtualContributorMutation`, `useSubspaceCommunityAndRoleSetIdLazyQuery`, `useSpaceAboutBaseLazyQuery`, plus Formik+Yup validation schemas.

**Sub-dialogs layer over the wizard dialog** (sticky-chrome rule): `VCExternalAIDialog` (+ nested `ComingSoon` request form). Closing the wizard dialog (X button, Esc, overlay click) discards in-progress input directly — no separate cancel-confirm dialog, matching the legacy MUI wizard. The interactive try-VC dialog is out of scope (a space-dashboard surface).

**Rationale**: A single dialog + internal state is the minimal faithful port of the existing modal wizard — it preserves all data wiring and the in-memory account hand-off, and keeps the wizard exactly where MUI had it (a modal opened from the launch point) so no new routing/URL surface is introduced.

**Alternatives considered**: (a) A full-page route carrying the account via location state — rejected (introduces a route + URL builder + breadcrumb wrappers for a flow that is conceptually a modal; an in-memory account hand-off is simpler as a prop). (b) Per-step sub-routes — rejected (more code, deep-link-into-mid-wizard semantics undesirable). (c) Rewrite the state machine — rejected (risk; the logic is reused verbatim).

---

## D3. Knowledge Base — full-page CRD route reusing the callouts surface

**Decision**: Replace the MUI `KnowledgeBaseDialog` (`DialogWithGrid`) with `CrdVCKnowledgeBasePage` mounted at `/vc/:nameId/knowledge-base` (the route already exists in `CrdVCRoutes`, currently pointing at the MUI route — repoint it). The page renders: a CRD header (VC identity), an editable KB description (if `Create` privilege), the **refresh Body-of-Knowledge** control with last-updated timestamp, an **empty state**, and the callouts list. Reuse `useKnowledgeBase` and the existing `CalloutsGroupView` for the callouts body until that itself is CRD — wrap, don't rebuild.

**Reused hooks**: `useVirtualContributorKnowledgeBaseQuery`, `useVirtualContributorKnowledgePrivilegesQuery`, `useVirtualContributorKnowledgeBaseLastUpdatedQuery`, `useUpdateVirtualContributorMutation` (description), `useRefreshBodyOfKnowledgeMutation`. Restrictions from `virtualContributorsCalloutRestrictions.ts` carry over.

**Rationale**: The callouts engine is a large shared subsystem mid-migration; wrapping it keeps US2 bounded to the page chrome + refresh + states, which is where the MUI styling leaks.

**Open item (research task during US2)**: confirm whether `CalloutsGroupView` renders acceptably inside a `.crd-root` page or needs a thin CRD adapter. Record the finding in tasks.

**Alternatives considered**: Rebuild callouts in CRD now — rejected (out of scope, owned by the callouts migration).

---

## D4. Admin config — only the prompt-graph card remains

**Decision**: Add a single `VCPromptGraphCard` to the existing CRD settings tab. The visibility, Body-of-Knowledge, prompt, and external-config cards are **already implemented and live** (`VCSettingsTabView` + `useVcSettingsTabData` + `vcSettingsMapper`); do not touch them beyond wiring the new card. The card is a **custom accordion-based linear node editor** (system nodes read-only; user nodes editable: input variables, markdown prompt, output property table with add/edit/delete rows) plus Save/Reset, built from shadcn `Accordion` + a custom property-row component — **no graph library** (the legacy uses none either). Gated on `platformSettings.promptGraphEditingEnabled` (already queried by `useVcSettingsTabData`).

**Reused hooks**: `useUpdateAiPersonaMutation` (`aiPersonaData.promptGraph`), `useUpdateVirtualContributorPlatformSettingsMutation` (toggle), `useAiPersonaQuery` (read graph). The `promptGraph: null` reset workaround (codegen-typed override) carries over.

**Rationale**: Research showed FR-005's four cards are done; honoring "wire up & retire gaps," US4 collapses to the prompt graph (FR-006). Reusing CRD primitives avoids a new dependency.

**Alternatives considered**: Introduce `reactflow`/`xyflow` for a node canvas — rejected; the legacy is a linear accordion, not a free-form canvas, and a graph lib is unjustified weight (Constitution / CLAUDE.md "no new runtime dependencies" preference).

---

## D5. Add-to-community — wire the existing connector, add the missing preview

**Decision**: (a) Wire the existing `VirtualContributorInviteConnector` (which already does account + library search, add, and invite-with-message via `useCommunityAdmin` + `useVirtualContributorsAdmin`) into the **CRD community entry point(s)**. (b) Add the missing **preview step**: a `VirtualContributorPreview` CRD component (avatar, tags, host/provider card, description) fed by `useVirtualContributorProviderLazyQuery`, surfaced as an optional view/slot in `VirtualContributorInviteDialog` between selection and add/invite. (c) Ensure the legacy MUI invite/browse dialogs are unreachable when CRD is active (FR-004); the display-only `VirtualContributorsBlock` is out of scope (handled by the space-page migration).

**Correction (verified)**: the connector is **already mounted and wired** in `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` (`canInviteVc`/`handleInviteVc` trigger) and `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`. (An earlier exploration claim that it was "unmounted" was stale.) US3's remaining work is therefore just the **preview step** + confirming legacy dialogs are unreachable on CRD.

**Rationale**: Most of the flow exists; the gaps are the preview and the wiring. Reuses CRD picker conventions (`InviteMembersDialog`/`ContributorSelector`) per the clarification.

**Alternatives considered**: Bespoke VC picker — rejected per clarification.

---

## D6. VC badge — new CRD indicator on CRD contributor surfaces

**Decision**: Create `VirtualContributorBadge` (shadcn `Badge` variant or small custom indicator, VC icon + localized "Virtual Contributor" label, term left in English per glossary). Render it on the CRD comment author (`src/crd/components/comment/CommentItem.tsx`) when the author is a VC. The legacy MUI `VirtualContributorLabel` chip is **not** reused. The CRD VC profile hero already carries its own type badge, so the profile-banner site needs no new badge.

**Constitution-III watch-item**: verify the CRD comment author data exposes `type`/`isVirtualContributor`. If absent, add the field to the relevant comment/message GraphQL fragment, run `pnpm codegen`, and commit generated outputs in the same PR. Resolve this early (US5 is sequenced second).

**Rationale**: No CRD VC indicator exists today; comments are the live CRD surface that currently loses the VC distinction.

**Alternatives considered**: Port the MUI chip — rejected (MUI dependency, wrong design language).

---

## D7. VC in-app notifications — already covered; verify only

**Decision**: No new per-type views. The CRD `NotificationsPanel` consumes a generic `notificationDataMapper` that already renders any type whose i18n keys and payload exist — including the two VC types (`VirtualAdminSpaceCommunityInvitation`, `SpaceAdminVirtualCommunityInvitationDeclined`), whose translation keys are shared with MUI. Work reduces to **verifying** both render correctly in the CRD panel. *Optional enhancement (only if requested):* populate the unused `typeBadgeIcon` on `CrdNotificationItemData` to visually mark VC-origin notifications.

**Rationale**: Architecture is generic; FR-008 is effectively satisfied. Verifying prevents claiming coverage without evidence (no silent assumptions).

**Alternatives considered**: Build dedicated CRD notification views — rejected (the panel doesn't use per-type views).

---

## D8. No GraphQL schema or backend changes

**Decision**: Treat the GraphQL layer as frozen. Every area reuses generated hooks. The **only** possible `.graphql` touch is the VC-badge comment-author field (D6); if needed it is additive, regenerated via `pnpm codegen`, committed in-PR (Constitution III). No new mutations/queries are introduced.

**Rationale**: This is a presentation-layer migration (SC-006: data interactions identical).

---

## Patterns & references to follow (file pointers)

- 3-layer + naming: `src/main/crdPages/topLevelPages/vcPages/settings/profile/{CrdVCProfileTab,useVcProfileTabData,vcProfileMapper}.ts(x)`
- Settings tab + engine-conditional cards: `src/main/crdPages/topLevelPages/vcPages/settings/settings/*` + `src/crd/components/virtualContributor/settings/VCSettingsTabView.tsx`
- Access guard: `useCanEditVcSettings.ts`, `useVcSettingsAccessGuard.ts`
- Invite dialog + connector: `src/crd/components/community/VirtualContributorInviteDialog.tsx`, `src/main/crdPages/space/dialogs/VirtualContributorInviteConnector.tsx`
- Member-picker pattern: `src/crd/components/community/InviteMembersDialog.tsx` (+ `ContributorSelector`)
- Notifications: `src/main/ui/layout/notificationDataMapper.tsx`, `src/crd/components/notifications/NotificationsPanel.tsx`
- Sticky dialog chrome: migration-guide reference dialogs (`InviteMembersDialog`, `VirtualContributorInviteDialog`)
- i18n namespace + registration: `src/crd/i18n/contributorSettings/*`, `src/core/i18n/config.ts`, `@types/i18next.d.ts`
- Legacy sources to mirror behavior: `newVirtualContributorWizard/*`, `knowledgeBase/*`, `virtualContributorAdmin/components/promptGraph/*`
