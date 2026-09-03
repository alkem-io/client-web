# Phase 0 Research: Permission-Aware Authorization Admin UI

**Feature**: 085-authz-admin-guard
**Date**: 2026-09-02

Research focused on three questions: where the silent-failure surfaces actually are in the current tree, which privilege the backend really enforces for each, and what shared primitives already exist so the fix stays DRY.

---

## Surface Inventory (satisfies FR-011)

Derived by tracing every consumer of `useRoleSetManager` and of the eight assign/remove mutations.

### In scope

| # | Surface | Glue / connector | CRD presentational view | Controls | Privileges available today? |
|---|---------|------------------|--------------------------|----------|------------------------------|
| 1 | Platform Admin → Authorization → Global roles (the originally reported page) | `src/main/crdPages/topLevelPages/admin/authorization/CrdAdminGlobalRolesPage.tsx` | `src/crd/components/admin/roles/RoleMembersEditor.tsx` | add user, remove user | Yes — `useRoleSetManager` returns `myPrivileges`; **not currently read** |
| 2 | Organization settings → Authorization | `src/main/crdPages/topLevelPages/organizationPages/settings/authorization/useOrgRoleAssignment.ts` | `RoleAssignmentView` (via `OrgAuthorizationTabView`) | add/remove, two roles | Yes — same hook; **not currently read** |
| 3 | Organization settings → Community (associates) | `src/main/crdPages/topLevelPages/organizationPages/settings/community/useOrgAssociates.ts` | `RoleAssignmentView` (via `OrgCommunityTabView`) | add/remove associate | Yes — same hook; **not currently read** |
| 4 | Space settings → Community | `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts` → `useCommunityAdmin` | `AddCommunityMemberDialog`, `MemberSettingsDialog` | add/remove member, lead, admin, organization, VC | **No** — `useCommunityAdmin` derives booleans from `authorizationPrivileges` internally but exposes neither the raw array nor its loading flag; `useCommunityTabData` additionally drops `canAddUsers`; and `AddCommunityMemberDialog` has no permission prop (only `disabled={isAdding}`). See the Surface 4 contract in `data-model.md` |

Surfaces 2 and 3 share one presentational component (`src/crd/components/contributor/settings/RoleAssignmentView.tsx`), so three component edits cover all four surfaces.

### Out of scope (recorded so the inventory is auditable)

| Site | Why excluded |
|------|--------------|
| `src/domain/community/inviteContributors/**` | Invitation flow — FR-015. Different mutation family, gated by `ROLESET_ENTRY_ROLE_INVITE`. |
| `src/domain/platformAdmin/management/transfer/transferCallout/` | FR-013. Different use case; reference material only. |
| `src/main/crdPages/topLevelPages/userPages/settings/membership/useUserMembershipTabData.ts` | Self-service "leave a space", not administration of another contributor. Calls `useRemoveRoleFromUserMutation` directly, outside `useRoleSetManagerRolesAssignment`. |
| `src/main/crdPages/topLevelPages/vcPages/creationWizard/useVcCreationWizard.ts` | Role assignment as a step inside a creation wizard, not a roster control. |
| `src/domain/community/organization/useOrganization/useOrganization.ts`, `.../userPages/settings/organizations/useOrganizationEnrichment.ts` | Read-only consumers; expose no assignment control. |

---

## Decision 1: Read privileges from `useRoleSetManager` — no new query, no codegen

- **Decision**: Drive enablement from the `myPrivileges` array that `useRoleSetManager` already returns.
- **Rationale**: `useRoleSetManager.ts:100` runs `useRoleSetAuthorizationQuery`, and line 107 extracts `lookup.roleSet.authorization.myPrivileges`, which is returned publicly at line 246. All four surfaces already call this hook. This satisfies FR-010 (same data the backend evaluates) and SC-004 (no additional request) by construction, and avoids a `pnpm codegen` run — which would otherwise require a live backend, since `codegen.yml` resolves its schema from `${CODEGEN_SCHEMA:http://localhost:3000/graphql}`.
- **Note**: `PlatformRoleSet.graphql` selects only `roleSet { id }`, which initially looks like a gap on surface 1. It is not — the privileges arrive via the separate `RoleSetAuthorization` query that `useRoleSetManager` issues.
- **Alternatives rejected**: adding a `canAssignRole` boolean to the schema (duplicates existing data, needs backend work); a dedicated per-site privileges query (extra round-trips, violates SC-004); inferring from role names (brittle, drifts from backend rules).

## Decision 2: The required privilege is per-surface configuration, not one global constant

- **Decision**: The derivation hook accepts the required privilege(s) as a parameter. Each surface supplies the token its own backend resolver enforces. This is FR-012 made concrete.
- **Rationale**: The spec's clarification names `GRANT`, but the only production precedent in the repo gates the *same operation family* on finer-grained tokens. `src/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin.ts:198-207`:
  - `canAddUsers` → `ROLESET_ENTRY_ROLE_ASSIGN`
  - `canAddOrganizations` → `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` **and** `GRANT`
  - `canAddVirtualContributors` → `ROLESET_ENTRY_ROLE_ASSIGN`
  - `canInvite` → `ROLESET_ENTRY_ROLE_INVITE`, with an in-code comment noting space admins hold it *without* holding `ROLESET_ENTRY_ROLE_ASSIGN`
  The schema (`graphql-schema.ts:1053-1079`) confirms `GRANT`, `GRANT_GLOBAL_ADMINS`, `ROLESET_ENTRY_ROLE_ASSIGN`, `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` and `ROLESET_ENTRY_ROLE_INVITE` are all distinct. A single hard-coded `GRANT` would therefore disagree with the backend on at least the space-community surface — the exact class of bug this feature exists to remove.
- **Consequence**: surface 4 reuses the tokens `useCommunityAdmin` already computes. Surfaces 1–3 need their token confirmed against the backend resolver before implementation; see Open Risk R1.
- **Alternatives rejected**: hard-coding `GRANT` everywhere (contradicts observed behavior on surface 4); attempting the mutation to discover the answer (that is the bug).

## Decision 3: native `disabled` on the control, tooltip on a focusable wrapper

**Revised 2026-09-03 after testing against a running backend.** The first implementation used
`aria-disabled` alone, keeping the control in the tab order and anchoring the tooltip to it.
In the browser this read as a bug: the button looked fully enabled, and the only indication
it was unavailable was a tooltip on hover — invisible on touch and easy to miss on desktop.

- **Decision**: The gated control gets the native `disabled` attribute (which also picks up
  the CRD button's `disabled:opacity-*` styling, so it visibly reads as unavailable) plus
  `aria-disabled`. The tooltip hangs off a focusable `<span>` wrapper rather than the control.
- **Rationale**: FR-002 asks for a control rendered in a disabled state — visual affordance
  included, not just an announced state. A disabled control fires no pointer events and
  leaves the tab order, so the tooltip has to be anchored to something else; the wrapper
  carries `tabIndex={0}`, which keeps the explanation reachable by keyboard and screen reader
  and so still satisfies FR-003/FR-004. The button primitive's `disabled:pointer-events-none`
  is what makes this work — hover passes through the inert control to the wrapper.
- **Alternatives rejected**: `aria-disabled` alone (no visual affordance — the state this
  revision fixes); native `disabled` with the tooltip on the control itself (unreachable by
  both mouse and keyboard); hiding the control entirely (layout shift, hides the action's
  existence, contradicts FR-002).

## Decision 4: Notify at the mutation-owning hook, filtered to authorization codes only

- **Decision**: Add error handling inside `useRoleSetManagerRolesAssignment.ts` covering all eight mutations, raising `useNotification(message, 'error')` **only** for `FORBIDDEN` / `FORBIDDEN_POLICY`. All other failure classes are left to the existing global handler.
- **Rationale**: The clarification places notification at the mutation call site and forbids touching the global link (FR-014). `useRoleSetManagerRolesAssignment` is the hook that owns all eight mutations, so handling it there covers every present and future consumer in one place (DRY, Arch Std #6f) rather than in eight components.
  The filter is essential: `useErrorHandlerLink.ts:30-40` already routes every *non*-excluded error to `useApolloErrorHandler` → `useNotification`. Toasting unconditionally at the call site would double-notify on network, validation and server errors. Restricting the call-site handler to exactly the codes the global link excludes makes the two complementary, and satisfies FR-006 (all failures notify) plus FR-007 (permission failures are distinctly worded).
- **Alternatives rejected**: `onError` in each of the four glue hooks (duplication, drift — the pattern that caused this bug); unconditional toast at the call site (double notifications); a second Apollo link (FR-014 forbids touching global error handling).

## Decision 5: New strings live in `crd-common`, all six locales

- **Decision**: Tooltip and error copy go into `src/crd/i18n/common/common.{en,nl,es,bg,de,fr}.json`.
- **Rationale**: Constitution v1.1.0 Arch Std #3 requires new strings in CRD namespaces across all six languages in the same PR, with key parity (there is already a `common.parity.test.ts` enforcing this). The legacy core file the constitution describes as frozen, `src/core/i18n/en/translation.en.json`, no longer exists — it was deleted with the MUI app — so CRD namespaces are the only option, not merely the preferred one. `crd-common` is the default namespace and is eagerly loaded (`src/core/i18n/config.ts:16,38,309`), so the tooltip needs no lazy-load boundary. Because Q3 settled on a single surface-agnostic string with no privilege token and no escalation target, one shared key serves all four surfaces.
- **Alternatives rejected**: per-surface namespaces (`crd-admin`, `crd-spaceSettings`) — would duplicate identical copy four times; `src/core/i18n` — no longer exists.

## Decision 6: Loading resolves to the same disabled path

- **Decision**: Both "privileges not yet known" cases gate the control, but they are **two distinct states**, not one. While the query is in flight the hook returns `{ allowed: false, reason: 'checking' }` ("checking permissions"). Once the query has completed and `myPrivileges` is still `undefined`, it returns `{ allowed: false, reason: 'unverifiable' }` ("permissions could not be verified"). Distinguishing them requires the caller to pass the query's `loading` flag alongside the array — which is why `useActionPermission` takes `loading` as a third argument rather than inferring everything from `myPrivileges === undefined`.
- **Rationale**: Satisfies FR-008 and SC-006 — there is no render in which the control is enabled before privileges are known, so no enabled-then-disabled flip. Keeping the two states separate is required by spec FR-008 and Edge Case 3, which mandate different copy for a transient wait versus a backend response that carried no privilege list.
- **Alternatives rejected**: rendering enabled while loading (SC-006 violation); hiding until resolved (layout shift).

---

## Resolved privilege tokens (R1 outcome)

Determined by mutation identity rather than guesswork, and centralized in
`src/main/crdPages/permissions/roleAssignmentPrivileges.ts`:

| Surface | Mutations | Token(s) | Basis |
|---|---|---|---|
| 2, 3 — Organization authorization / associates | `assignRoleToUser`, `removeRoleFromUser` | `ROLESET_ENTRY_ROLE_ASSIGN` | **Same mutation pair** as the space-community user path, which production code (`useCommunityAdmin.ts:206`) already gates on this token. Same resolver, same policy. |
| 4 — Space community (users, VCs) | `assignRoleToUser`, `assignRoleToVirtualContributor` | `ROLESET_ENTRY_ROLE_ASSIGN` | Established in `useCommunityAdmin.ts`. |
| 4 — Space community (organizations) | `assignRoleToOrganization`, `removeRoleFromOrganization` | `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` **and** `GRANT` | Established in `useCommunityAdmin.ts:211-213`. |
| 1 — Platform global roles | `assignPlatformRoleToUser`, `removePlatformRoleFromUser` | `GRANT_GLOBAL_ADMINS` | **Confirmed empirically 2026-09-03.** `PlatformRoleResolverMutations.assignPlatformRoleToUser` calls `grantAccessOrFail` with `grant-global-admins`. The `GRANT` value recorded during clarification was wrong. |

**R2 — resolved.** `useCommunityAdmin` now exposes its raw `myPrivileges` alongside the
existing booleans, `useCommunityTabData` forwards them plus the previously-dropped
`canAddUsers`, and `CrdSpaceSettingsPage` derives one decision per control.

## Closed Risks

- **R1 — CLOSED 2026-09-03.** Every surface's token is now evidenced; see the table above.
  The platform surface was the last open one and the clarified `GRANT` proved **wrong**:
  against a running backend, an admin holding `GRANT` was shown an enabled control and
  then refused with

  > `ForbiddenAuthorizationPolicyException: Authorization: unable to grant 'grant-global-admins' privilege: assign role to User ... on roleSet of type: platform`

  Corrected to `GRANT_GLOBAL_ADMINS` in `PLATFORM_ROLE_ASSIGN_PRIVILEGES`.

  Worth recording how this surfaced: the UI wrongly **allowed** the action and the User
  Story 1 error toast caught it — exactly the safety-net role the spec assigns to US1 when
  the UI privilege check and the backend disagree. Before this feature the same click
  failed silently.

  One caveat left open: the evidence covers the assignment the tester performed. If the
  backend ever gates *lower* platform roles on a weaker privilege, gating all of them on
  `GRANT_GLOBAL_ADMINS` would over-gate — fail-closed, so safer than the previous state,
  but worth a second check if anyone reports a missing control on that page.

- **R1 (original wording, superseded) — Privilege token unverified on surfaces 1–3.** Decision 2 establishes that the token is per-surface, but only surface 4's tokens are evidenced in-repo. The spec's clarification names `GRANT` for the platform role set; the analogous space-community operation uses `ROLESET_ENTRY_ROLE_ASSIGN`. Before implementation, each surface's token must be confirmed against the backend resolver (or empirically, per `quickstart.md` step 2). Getting this wrong reintroduces UI/backend disagreement in the opposite direction — a control disabled for someone who is in fact permitted. The design contains the blast radius: the token is one argument at one call site per surface.
- **R2 — Surface 4 currently drops `canAddUsers`.** `useCommunityAdmin` computes it but `useCommunityTabData.ts:349-358` does not forward it, and `AddCommunityMemberDialog` accepts no permission prop. This is an existing ungated path, not merely a missing tooltip.

## Deferred to `/speckit.tasks`

- Exact i18n key names, and the six translated strings.
- Per-surface test file placement and the integration-test shape for each of the four surfaces.
- Whether `MemberSettingsDialog`'s lead/admin toggles need a distinct token from the member add/remove path.
