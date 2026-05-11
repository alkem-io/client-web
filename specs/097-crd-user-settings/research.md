# Phase 0 Research: CRD Contributor Settings

**Feature**: 097-crd-user-settings (rewritten 2026-05-06 to scope User + Organization)
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Purpose

Resolve every "how exactly does this work today?" question that the spec leaves to research, so the implementation tasks (Phase 2) can proceed with no remaining ambiguity. No new GraphQL or runtime dependencies are introduced; every decision below either (a) reuses an existing pattern from a prior CRD spec, or (b) ports a well-understood MUI behavior into CRD.

---

## Decision 1 — Routing dispatch: where the `useCrdEnabled()` toggle lives for each shell

**Decision**:
- **User shell**: dispatch lives in `src/main/routing/TopLevelRoutes.tsx`, inside the existing `/user/*` route block, between `<CrdUserRoutes />` (lazy-loaded, owned by 096) and the existing `<UserRoute />`. The `<NoIdentityRedirect>` and `<WithApmTransaction>` wrappers stay exactly as today (verified parity with research §1 of the prior 097 + the 096 wiring pattern).
- **Org shell**: dispatch lives **inside** `src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx` at lines 29–34, where `<MuiOrganizationAdminRoutes />` is currently hard-coded. This is replaced by `useCrdEnabled() ? <CrdOrgSettingsRoutes /> : <MuiOrganizationAdminRoutes />`. **Rationale**: 096 already added `CrdOrganizationRoutes.tsx` with the public-profile route; the settings dispatch is naturally a sibling of that file rather than a `TopLevelRoutes.tsx` change. Keeps the routing dispatch local to its actor's route file.

**Rationale**: Mirrors the 096 pattern. Two dispatch points (one per actor) keeps each one local to its actor's route owner. A single dispatch in `TopLevelRoutes.tsx` would require duplicating 096's work; we prefer to extend 096's `CrdOrganizationRoutes.tsx` instead.

**Alternatives considered**:
- Putting both dispatches in `TopLevelRoutes.tsx` — rejected because it would mean modifying 096's already-pushed `CrdOrganizationRoutes.tsx` to forward through, adding indirection.
- A single combined `CrdContributorRoutes.tsx` covering both actors — rejected because the route trees are unrelated (`/user/*` vs `/organization/*`); combining them would cross actor verticals.

---

## Decision 2 — Per-section save model (used by User Profile + Org Profile) — REWRITTEN per spec clarification Q4 (2026-05-06)

**Decision**: Adopt the **045 About per-section explicit-save model verbatim**. Source of truth: `src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts` + `src/crd/components/space/settings/SpaceSettingsAboutView.tsx` + `@/crd/components/common/InlineEditText`. The earlier 5-state per-field state machine (pencil → check / × per field, `idle | editing | pending | idle-saved | editing-error`) is superseded.

**Section-level state** (held in the per-tab integration hook — `useUserProfileTabData` / `useOrgProfileTabData`):

```typescript
type SectionSaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }   // transient — auto-transitions to idle after SAVED_FLASH_MS
  | { kind: 'error'; message: string };

const SAVED_FLASH_MS = 1800; // matches 045's useAboutTabData.ts

type SectionState = {
  values: Record<SectionKey, FieldValueShape>;       // user's draft per section
  saved: Record<SectionKey, FieldValueShape>;        // last server-known per section
  dirtyByField: Partial<Record<SectionKey, boolean>>;// derived from values vs. saved (same pattern 045 uses)
  saveStatusByField: Partial<Record<SectionKey, SectionSaveStatus>>;
};
```

**Section units** (User Profile tab — same shape applies to Org Profile with the org-specific fields per FR-091):

| Section | Field(s) it commits |
|---|---|
| `displayName` | Display Name |
| `firstName` | First Name |
| `lastName` | Last Name |
| `phone` | Phone |
| `tagline` | Tagline |
| `bio` | Bio (markdown) |
| `skills` | User profile `Skills` tagset (whole list saved per click; lazy-create-on-first-save if the tagset doesn't yet exist on the profile) |
| `keywords` | User profile `Keywords` tagset (separate per-section save from Skills; same lazy-create semantics). Org Profile uses `keywords` + `capabilities` instead — see data-model.md User Story 8. |
| `location` | City + Country (compound) |
| `references` | Social Links + arbitrary references (whole list batched: patch-existing + create-new + delete-pending) |

Avatar / logo upload is NOT a section — it commits IMMEDIATELY on upload completion (the file picker IS the commit, FR-024 / FR-093).

**View binding** (per section):
- `<InlineEditText value={values[k]} onChange={next => onChange({[k]: next})} />` (single-line) OR `<MarkdownEditor>` for Bio / Description OR `<CountryCombobox>` for Country OR one `<TagsField>` instance per profile tagset (User: `Skills` + `Keywords`; Org: `Keywords` + `Capabilities`) — never a single unified "Tags" input.
- `<FieldFooter dirty={dirtyByField[k]} status={saveStatusByField[k] ?? {kind:'idle'}} onSave={() => onSaveSection(k)} />`.
- The `FieldFooter` is the only commit affordance — there is no per-field pencil / check / × icon.

**State transitions** (per section):
- (any) → `saving` on `onSaveSection` invocation.
- `saving` → `saved` on mutation success → `idle` after `SAVED_FLASH_MS` (1800 ms).
- `saving` → `error` on mutation failure. The section stays dirty with the user's typed values preserved. Inline error message persists in the section.
- `error` → `idle` (and dirty cleared if the field's value matches the server value) the next time the admin edits a field in the section. The next edit resets `saveStatusByField[k]` to `idle`, re-enabling Save.

**Discard / cancellation**: there is NO per-section Cancel button or Escape-to-revert. Mid-edit values silently drop on tab-switch / nav-away (FR-016) — the local section buffer is reset on remount via the next render of `mapSpaceToAboutFormValues`-equivalent. To revert a single field to its server value, the admin clears the input and re-enters the original value, OR navigates away (which discards the entire section's pending edits).

**References-section special behaviour** (FR-025 — same as 045's references handling):
- Add: appends an unsaved (temp-ID) row to `values.references[]`. The row is editable in the buffer; nothing fires server-side.
- Edit: patches the row in `values.references[]` by id.
- Delete: opens a `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`); only the dialog's Confirm queues the row for deletion in the section buffer (`pendingReferenceDelete` state pattern, copied from 045).
- The mutation batch (`createReferenceOnProfile` × N + `updateReference` × M + `deleteReference` × P) fires only when the References-section Save is clicked.

**Save handler signature**:
```typescript
type OnSaveSection = (section: SectionKey) => Promise<void>;
```
The handler reads the current section values from the local buffer, fires the targeted mutation (only that section's fields in the patch), and on success merges the fresh server values back into the local buffer's `saved` slice (so subsequent dirty-detection works correctly). On failure it sets `saveStatusByField[section] = { kind: 'error', message }` and leaves `values[section]` untouched.

**Validation** (FR-023):
- Format validators (URL, email, phone) run live on input change. While a section's input is format-invalid, the section's Save button is disabled.
- Required-field empty checks (Display Name / First Name / Last Name on User; Display Name / Description on Org) fire on Save click. Clicking Save with an empty required field surfaces an inline error beneath the offending input; the section stays dirty; no mutation fires.
- Server-side validation errors surface inline per the `error` state.

**Rationale**:
- The 045 About model is already implemented and shipped. Reusing it eliminates a dimension of risk (state-machine bugs, edge-case regressions) and gives consumers a familiar pattern across the CRD settings family.
- Per-section commit reduces network chatter for compound fields (Location's two inputs save together) and matches user mental model better than per-field saving (typing in City and tabbing to Country shouldn't fire two separate saves).
- The 5-state per-field machine added complexity (Cancel/Escape per field, edit-mode-with-error vs. idle-saved separation) without commensurate UX value. The simpler 4-state per-section model (idle / saving / saved / error) is sufficient and consistent with the production pattern.

**Alternatives considered**:
- Field-level saves with the 5-state machine — rejected per spec clarification Q4: not consistent with 045 About; introduces unnecessary UX divergence across the CRD settings vertical.
- Autosave with debounce (the 045 spec originally proposed this in FR-005a) — rejected because the actual 045 implementation moved to per-section explicit save, and clarification Q4 mandates matching the implementation, not the older spec language.
- Component-internal state — rejected: the integration hook owns the last-known server value (via `mapXToFormValues`) and needs to control resets after refetches; same as the 045 pattern.

---

## Decision 3 — Account tab actions: CRD creation dialogs + navigate-to-settings + confirm-delete (User Account + Org Account)

**Decision**: The CRD Account view is a **shared presentational component** (`src/crd/components/contributor/settings/ContributorAccountView.tsx`) consumed by both User Account and Org Account integrations. It never imports `react-router-dom` or `@mui/*` — every action is a callback prop (`onCreateSpace`, `onCreateVc`, `onCreateInnovationPack`, `onCreateInnovationHub`, `onManage`, `onDelete`), satisfying FR-006 / FR-007. The three action families are handled as follows:

- **Create `<resource>`** → the integration page (`CrdUserAccountTab` / `CrdOrgAccountTab`) opens a **CRD (shadcn) creation dialog** — a parity port of the corresponding current-MUI dialog. There are four:
  - **Create Space** → `CrdCreateSpaceDialog` — parity port of MUI `src/domain/space/components/CreateSpace/createSpace/CreateSpace.tsx` (`CreateSpaceForm` + `useSpaceCreation`). Fields: `displayName`, `nameID` (auto-generated, editable), `tagline`, `description` (markdown), `tags`, `spaceTemplateID` (template picker; the chosen template must have exactly 4 innovation-flow states, parity with MUI), `addTutorialCallouts`, `banner` + `cardBanner` visual uploads, `acceptedTerms` checkbox. Mutation: `useCreateSpaceMutation` with `licensePlanID` auto-picked from the account's first available plan; visuals uploaded after the mutation resolves; refetches `AccountInformation` (+ dashboard spaces).
  - **Create Virtual Contributor** → `CrdCreateVirtualContributorWizard` — **full parity port of the multi-step MUI `useVirtualContributorWizard`** (`src/main/topLevelPages/myDashboard/newVirtualContributorWizard/`). Steps: (1) initial profile (`name`, `tagline`, `description` markdown, `avatar` upload, `engine`, `bodyOfKnowledgeType`, source selector: *create & write knowledge* / *use existing space* / *use external AI*); (2) add-knowledge content (`posts[]` → Post callouts; `documents[]` → a Link callout collection); (3) choose-community (pick an existing space, or create a new space for the VC); (4) use-existing-space (pick a space/subspace as the VC's body of knowledge); (5) external-AI (`engine`, `apiKey`, conditional `assistantId`); (6) try-VC info. Mutations (same order as MUI): `useCreateVirtualContributorOnAccountMutation`, `useUploadVisualMutation` (avatar), `useRefreshBodyOfKnowledgeMutation`, `useCreateLinkOnCalloutMutation` (documents), `useCreateSpaceMutation` (when a space is created for the VC), `useAssignRoleToVirtualContributorMutation` (community assignment). Refetches: `MyAccount`, `AccountInformation`, the account-resources query, `LatestContributionsSpacesFlat`.
  - **Create Innovation Pack** → `CrdCreateInnovationPackDialog` — parity port of MUI `src/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog.tsx` (`InnovationPackForm`, create variant). Fields: `profile.displayName` (required), `profile.description` (markdown, required). Mutation: `useCreateInnovationPackMutation` with `packData.accountID`; refetches `AdminInnovationPacksList`, `AccountInformation`, `InnovationLibrary`.
  - **Create Innovation Hub (Custom Homepage)** → `CrdCreateInnovationHubDialog` — parity port of MUI `src/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog.tsx` (`InnovationHubForm`, create variant). Fields: `subdomain` (required, validated unique), `profile.displayName` (required), `profile.tagline`, `profile.description` (markdown, required). Mutation: `useCreateInnovationHubMutation` with `hubData.accountID`, fixed `type: List` + empty `spaceListFilter`; refetches `AdminInnovationHubsList`, `AccountInformation`.
- **Manage `<resource>`** → navigates to the resource's existing settings URL (read off the resource's `profile.url`). No CRD port — the manage/edit admin dialogs for these resource types stay MUI behind their existing routes.
- **Delete `<resource>`** → opens CRD `ConfirmationDialog`; on confirm fires the corresponding existing delete mutation (`useDeleteSpaceMutation` / `useDeleteVirtualContributorOnAccountMutation` / `useDeleteInnovationPackMutation` / `useDeleteInnovationHubMutation`). No new mutations.

**File layout**: the CRD presentational dialogs/wizard live under `src/crd/components/contributor/settings/create/` (single-step dialogs) and `src/crd/components/contributor/settings/createVc/` (the VC wizard shell + step components). Each pairs with a per-flow integration hook under `src/main/crdPages/topLevelPages/.../account/` that owns the Apollo wiring — mirroring how the existing `src/crd/components/space/settings/CreateSubspaceDialog.tsx` pairs with `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace.ts` (presentational dialog: plain props + callbacks; hook: mutation + visual upload + error/loading state). The two integration pages (`CrdUserAccountTab`, `CrdOrgAccountTab`) mount the same four CRD dialogs, differing only in the `accountId` they pass.

**Rationale**: The current MUI `ContributorAccountView`'s four "Create" buttons each open an inline MUI dialog/wizard — none of them navigates. The prior 097 research's "navigate to `/admin/spaces/new`" plan referenced routes that do not exist; the implemented `navigate('/admin/spaces/new')` calls land on nothing, which is a user-facing break. The MUI `ContributorAccountView` itself can't be embedded in CRD (heavy `@mui/*` imports — FR-006), so the create flows have to be CRD ports. Porting only the **create** dialogs (not the manage/edit surface) keeps the scope bounded while restoring the behavior the MUI page actually has. The VC flow is ported in full because the Account tab is a parity-only restyle (Out of Scope: "no new affordances, no removed behavior") — a simplified single-step VC dialog would *remove* behavior.

**Alternatives considered**:
- Navigate to a `/admin/...new` route — rejected: no such route exists; this was the bug being fixed.
- Lift the MUI create dialogs to app level (rendered in `root.tsx`, triggered via callback like the Messages/Notifications dialogs) — rejected: keeps MUI code on the CRD route's critical path and doesn't deliver the "shadcn dialogs" the migration is converging on; the CRD ports are the durable answer.
- A simplified single-step CRD VC dialog (name + description only) — rejected: drops the wizard's link-space / knowledge-base / external-AI behavior, violating the Account-tab parity rule.
- Two parallel CRD Account views (one per actor) — rejected; the shape is identical (4 card groups, same kebab actions, same data hooks, same four create dialogs) so DRY favors one shared component + one shared set of create dialogs with per-actor mappers and per-actor `accountId`.

---

## Decision 4 — Optimistic-overrides pattern (User Notifications)

**Decision**: Notifications uses an in-memory **override dictionary** keyed by `(group, property, channel)` (where channel ∈ `inApp` / `email` / `push`). The view reads from `serverValue ?? override`, where the override wins until cleared. Each `onToggle` writes the override immediately (UI flips), fires `useUpdateUserSettingsMutation`, then:
- **on success**: clears the override after the refetch resolves (server value now matches what the user wanted)
- **on failure**: rolls back the override and surfaces an inline error toast

**Rationale**: Direct port of the current MUI `UserAdminNotificationsPage` pattern (verified by reading the MUI implementation). FR-064 mandates "optimistic-overrides pattern" parity. Apollo's built-in optimistic responses don't compose well with the deeply-nested settings object — the override-dictionary approach matches exactly what MUI does today.

**Alternatives considered**:
- Apollo `optimisticResponse` — rejected because the settings tree is deep and the existing MUI does not use it; introducing it now would diverge from MUI behavior in ways that may surface subtle bugs.
- Pessimistic (no optimistic, wait for server) — rejected; UX would feel sluggish vs. current MUI.

---

## Decision 5 — Role-set manager integration (Org Community + Authorization)

**Decision**: A **shared** `RoleAssignmentView` (`src/crd/components/contributor/settings/RoleAssignmentView.tsx`) renders two columns — current members and available users — with a search input above the available column, +/× action buttons per row, and load-more pagination on the available column. Three integrations consume it:
1. **Org Community tab** — `useOrgAssociates()` → `RoleAssignmentView` for the `Associate` role.
2. **Org Authorization → Admin sub-tab** — `useOrgRoleAssignment(RoleName.Admin)` → `RoleAssignmentView`.
3. **Org Authorization → Owner sub-tab** — `useOrgRoleAssignment(RoleName.Owner)` → `RoleAssignmentView`.

All three integration hooks wrap the existing `useRoleSetManager` (from `src/domain/access/RoleSetManager/`) + `useRoleSetAvailableUsers` (from `src/domain/access/AvailableContributors/`). Add / remove actions commit immediately via `assignRoleToUser` / `removeRoleFromUser` from the manager.

**Rationale**: FR-110 / FR-120 say Community + Authorization are parity restyles of `OrganizationAssociatesView` and `OrganizationAuthorizationRoleAssignementView`. Both MUI views use the same underlying hooks (`useRoleSetManager` + `useRoleSetAvailableUsers`); the only difference is the role they pass. A single shared CRD view, parameterized by role label and the manager's output, satisfies both.

**Alternatives considered**:
- Three separate views, one per role — rejected; pure duplication.
- Different pagination strategy than current MUI — rejected; FR-113 mandates parity with current load-more behavior.

---

## Decision 6 — Identity-provider settings flow integration (User Security)

**Decision**: The integration hook `useIdentityProviderSettingsFlow` reuses the **same** flow loader the existing MUI `UserSecuritySettingsPage` uses. Specifically:
- Reuses the existing `KratosForm` + `KratosUI` components.
- Reuses the existing `REMOVED_FIELDS` filter constant (hides password change, profile fields, OIDC link / unlink).
- The CRD layer wraps these in a `SettingsCard` shell — **does not restyle** the rendered fields themselves (out of scope per spec Out of Scope and FR-080).

Returns `{ kind: 'loading' | 'error' | 'noWebauthn' | 'ready', flow?, error? }` so the view can render the correct shell variant.

**Rationale**: Spec FR-080 / FR-081 / FR-082 mandate exact parity with current MUI behavior, including the field filter and the "WebAuthn / Passkey not enabled" alert. Restyling the rendered fields would break the contract that this iteration only changes the surrounding shell.

**Alternatives considered**:
- Restyling the form fields — rejected (Out of Scope).
- Building a CRD passkey form from scratch — rejected; the identity provider's UI generates the form, restyling it would require substantial new work.

---

## Decision 7 — Per-actor authorization predicate sources

**Decision**: Two sibling hooks:

**`useCanEditUserSettings(profileUserId: string)`** — returns `{ canEditSettings, isOwner, isPlatformAdmin }`:
- `isOwner = currentUser.id === profileUserId`
- `isPlatformAdmin = userWrapper.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)` — the canonical predicate already used by `UserAdminNotificationsPage` line 172
- `canEditSettings = isOwner || isPlatformAdmin`

**`useCanEditOrganizationSettings(organizationId: string)`** — returns `{ canEditSettings, hasUpdatePrivilege }`:
- Reads `useOrganizationProvider().permissions.canEdit` — the existing predicate the MUI `NonAdminRedirect` uses on the org admin route
- `hasUpdatePrivilege = permissions.canEdit`
- `canEditSettings = hasUpdatePrivilege`

Both are pure custom hooks colocated with their actor-specific integration subtree. Both are unit-tested for true/false branches and the loading state.

**Rationale**: The two sources are fundamentally different (User: platform-level privilege OR self; Org: per-organization Update privilege). Collapsing into a discriminated union helper would obscure the two distinct authorization domains. Two named hooks make the per-actor predicate explicit at every consumption site.

**Alternatives considered**:
- One generic `useCanEditSettings(actor)` discriminated helper — rejected; the call sites are static (User route guard always uses User predicate; Org route guard always uses Org predicate), so discrimination at call time is unnecessary.

---

## Decision 8 — i18n namespace

**Decision**: Single combined namespace `crd-contributorSettings` covering both User and Org tabs. Files at `src/crd/i18n/contributorSettings/contributorSettings.<lang>.json`, all six languages maintained manually (no Crowdin), all edited in the same PR that introduces or removes a key (FR-141).

Top-level key structure:
```json
{
  "shell": {
    "tabs": {
      "user": { "profile": "...", "account": "...", ... },
      "org":  { "profile": "...", "account": "...", ... }
    }
  },
  "user": {
    "myProfile": { "identity": { ... }, "aboutYou": { ... }, "socialLinks": { ... } },
    "account":   { ... },
    ...
  },
  "org": {
    "profile":       { ... },
    "account":       { ... },
    "community":     { ... },
    "authorization": { ... },
    "settings":      { ... }
  },
  "shared": {
    "saved": "Saved",
    "saveFailed": "Couldn't save — try again",
    "addAnotherReference": "Add another reference",
    ...
  }
}
```

**Rationale**: Spec FR-140 mandates one combined namespace. Top-level scoping by `shell` / `user` / `org` / `shared` keeps the keys discoverable and avoids cross-actor key collisions. Where the current MUI uses a translation key already present in the global `translation` namespace (e.g., `forms.validations.elementMustBeValidUrl`), the CRD code reuses that key via the `translation` namespace rather than duplicating it under `crd-contributorSettings` (FR-142).

**Alternatives considered**:
- Two parallel namespaces (`crd-userSettings` + `crd-organizationSettings`) — rejected; would duplicate the shell tab labels and the shared edit-pattern strings ("Saved", "Save failed") across two files.

---

## Decision 9 — Shell + tab strip primitive shape

**Decision**: `SettingsShell` and `SettingsTabStrip` are actor-agnostic. Both accept a `tabs: SettingsTab[]` prop (User integration passes 7, Org integration passes 5).

```typescript
type SettingsTab = {
  id: string;            // 'profile' | 'account' | ...
  label: string;         // i18n-resolved
  icon: LucideIcon;      // lucide-react component
  hidden?: boolean;      // optional — User Security uses this for non-owner viewers
};

type SettingsShellProps = {
  header: { avatarUrl?: string; displayName: string; };
  tabs: SettingsTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  children: React.ReactNode;  // The active tab body
};
```

The view never knows about route paths — `onTabSelect` is a callback the integration layer wires to `useNavigate(buildSettingsTabUrl(profileUrl, tabId))` from `@/main/routing/urlBuilders`. The integration hook receives `profileUrl` from the actor's context (`useUserPageRouteContext().profileUrl` on the User side, `organization.profile.url` on the Org side) — never an inline `/user/...` / `/organization/...` template. See `docs/crd/migration-guide.md` ("URL Construction") for the project-wide convention.

**Rationale**: One shell primitive for both actors satisfies DRY and keeps behavior parity (responsive horizontal scroll, auto-scroll active into view, keyboard navigation). The `hidden` flag handles FR-083 (Security tab hidden for non-owner) without a special-case branch in the primitive.

**Alternatives considered**:
- Hard-coded 7-tab User shell + hard-coded 5-tab Org shell — rejected (the prior 097 did this; bad for consistency and maintenance).

---

## Decision 10 — Avatar / logo upload commit-on-file-select semantics

**Decision**: Uploads commit immediately on file-select on both User My Profile (FR-024) and Org Profile (FR-093). The file-picker dialog itself is the explicit confirmation — no separate Save click. The integration hook (`useUserAvatarUpload` / `useOrgAvatarUpload`) wraps the same upload mutation the existing MUI uploaders use and exposes:

```typescript
{ onAvatarFilePicked: (file: File) => Promise<void>; uploading: boolean }
```

On error, surfaces a CRD `Toast` and reverts the visual avatar via refetch.

**Rationale**: Direct parity with current MUI behavior. The `VisualUpload` component in MUI already commits immediately on file-select — there's no "preview + Save" flow today, so CRD doesn't introduce one.

**Alternatives considered**:
- Preview-then-Save flow — rejected (would be a new affordance, violating Out of Scope).

---

## Decision 11 — Reference (social link) URL validation

**Decision**: Reuses the existing `referenceSegmentSchema` URL validator from `src/domain/common/reference/`. The per-row Save button on `EditableReferenceRow` is **disabled** while the URL is invalid (FR + edge case: "malformed URLs surface an inline error on the URL input; the per-row Save button is disabled while the URL is invalid"). Validation error message uses the global `translation` key `forms.validations.elementMustBeValidUrl` (per FR-142).

**Rationale**: Parity with current MUI `UserForm` / `OrganizationForm` reference editing. No new validators introduced.

---

## Decision 12 — Verification badge on Org Profile (read-only)

**Decision**: A small read-only `OrgVerifiedBadge` component renders one of three states based on `organization.verification.status`:
- `VerifiedManualAttestation` → green check + "Verified" label
- `Pending` → muted clock icon + "Verification Pending" label
- `NotVerified` → muted shield icon + "Not Verified" label

The badge has **no edit affordance** (FR-094). Mutating verification status is owned by a separate platform-admin flow not covered here.

**Rationale**: Spec Out of Scope explicitly carves out verification-status mutation. The badge displays the current value as part of the Profile-tab parity restyle.

**Alternatives considered**:
- Hide the badge entirely — rejected; the current MUI `OrganizationForm` exposes it as a read-only field today, and removing it would lose information. CRD shows it read-only.

---

## Decision 13 — Per-row enrichment for the User Membership grid (post-implementation correction)

**Decision**: The User Membership card grid enriches each row (banner / tagline / spaceUrl / leadUsers / roleSetID) by fanning out `useSpaceContributionDetailsQuery({spaceId})` calls — exactly the source the existing MUI `ContributionCard` reads. The fan-out lives in a `useMembershipEnrichment(spaceIds)` hook in the integration layer (`src/main/crdPages/topLevelPages/userPages/settings/membership/`), which uses `useApolloClient.query()` inside a `useEffect` keyed on the sorted id list and stores the result in a `Map<spaceId, MembershipEnrichment>`. Apollo dedupes / caches per-spaceId, so revisits and overlapping spaces are free.

**Rationale**: An earlier draft used `useDashboardWithMembershipsQuery` (single query, returns banner/tagline through `me.spaceMembershipsHierarchical`). It was rejected after testing because:
- The query is `me.*`-scoped, so it returns the **viewing** user's data — wrong when a platform admin is on `/user/<other>/settings/membership`.
- In practice the banner / tagline fields didn't reliably surface through the recursive shape, so the cards rendered without enrichment even for self-views.

The per-row `useSpaceContributionDetailsQuery` approach matches MUI's proven path, takes a `spaceId` only (so it works for any viewer without scoping issues), and benefits from Apollo's request deduplication. The N+1 round-trip cost is acceptable for the page's typical row count and is fully cached after the first visit.

**Alternatives considered**:
- A single new GraphQL query `userMembershipsWithDetails(userId)` returning rich data per row in one shot — rejected; would require schema work, which is Out of Scope ("no new GraphQL types").
- A wrapper component per card that calls `useSpaceContributionDetailsQuery` itself — rejected; CRD components must not import Apollo (Constitution Principle I / `src/crd/CLAUDE.md`).
- The `useDashboardWithMembershipsQuery` approach — rejected as documented above.

---

## Decision 14 — Membership card menu items (post-implementation correction)

**Decision**: The kebab on each membership card has exactly **two items, no header**:
- **View Space** / **View Subspace** (label switches by `row.type`) — anchor `<a href={row.spaceUrl}>` rendered via `DropdownMenuItem asChild`. Hidden when `spaceUrl` is empty (enrichment hasn't resolved yet).
- **Leave Space** / **Leave Subspace** (label switches by `row.type`) — destructive variant, opens the destructive `ConfirmationDialog` (Rule #9).

No `DropdownMenuLabel` ("Options"), no `DropdownMenuSeparator`, no third item.

**Rationale**: The prototype shows "Options" + a separator + two items. Direct-and-typed labels are clearer than a generic "View Details" because they tell the user exactly what entity they'll act on. Dropping the header removes a row of chrome that doesn't carry any new information.

---

## Decision 15 — Membership card "Led by:" footer

**Decision**: Each membership card renders a footer band (`bg-muted/30 border-t`, `text-caption text-muted-foreground`) with the label "Led by:" + an overlapping avatar stack rendered via the shared `@/crd/components/common/StackedPersonAvatars` primitive (max 3 avatars + `+N` overflow tile). Lead users are extracted from `useSpaceContributionDetailsQuery.lookup.space.about.membership.leadUsers[]`. The footer is hidden entirely when `leadUsers` is empty.

**Rationale**: The prototype's footer shows a member count, but `useUserContributionsQuery` doesn't return one and adding it would require a new affordance. Lead users are already in the per-row enrichment payload (community admins / leads carry the same Profile shape we already use for avatars elsewhere in CRD), so surfacing them in the footer reuses existing data and gives each card a useful identity cue without inflating scope.

**Reused primitive**: `StackedPersonAvatars` lives at `src/crd/components/common/StackedPersonAvatars.tsx` and is consumed by **two** call sites today — this Membership "Led by:" footer and the existing `CalloutPoll` poll-voter row (where it shows who voted on a given option). Both sites pass their own pre-localized labels (`groupAriaLabel`, `overflowTooltipLabel`) and `sizeClass` via props. The component itself never calls `useTranslation`, keeping it consumer-namespace-agnostic — the prior `PollVoterAvatars` wrapper that was hardcoded to `crd-space` is replaced by this generalization. This is recorded as part of the post-implementation corrections for US3.

**Alternatives considered**:
- Member count (prototype default) — rejected; not in the available query shape.
- Status badge ("Active / Archived") in the footer — rejected for the same reason (not in `useUserContributionsQuery` and would surface a field we deliberately don't filter on; see FR-043 rationale).
- Inlining a one-off `LeadAvatarStack` inside `UserMembershipTabView` (the original implementation choice) — rejected after spotting the existing `PollVoterAvatars` component; the visual and structural overlap makes a shared primitive the right call. The poll consumer was migrated and the deprecated file deleted in the same change.

---

## Summary

No NEEDS CLARIFICATION markers remain. All technical decisions either reuse a documented prior pattern or port a well-understood MUI behavior. The next phase (Phase 1 — Design & Contracts) builds the per-tab component contracts, the data-model entity → CRD prop tables, and the quickstart smoke checklist on top of these decisions.
