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

## Decision 2 — Per-field save state machine (used by User My Profile + Org Profile)

**Decision**: Five-state state machine, owned by the parent integration hook (controlled component pattern). Each editable field passes its current `status` into `EditableField` and provides `onSave` / `onCancel` callbacks.

States:
1. `idle` — value renders as plain text. Hover reveals a pencil glyph.
2. `editing` — input is active; Save (check) and Cancel (×) icons visible.
3. `pending` — Save was clicked; mutation in flight. Spinner replaces Save icon. `aria-busy="true"` on the input. Both Save and Cancel disabled.
4. `idle-saved` — mutation succeeded. Field returns to idle visually; a transient "Saved" indicator appears next to the field label for ~2 seconds before fading. Auto-transitions back to `idle` after the timer.
5. `editing-error` — mutation failed. Field stays in `editing` visually with the user's typed value preserved. Inline error appears beneath the input. Save and Cancel re-enabled. Clicking Save again retries (re-enters `pending`); clicking Cancel discards and returns to `idle` (with the last server value).

Transitions:
- `idle` + click value/pencil → `editing`
- `editing` + click × / press Escape → `idle` (calls `onCancel`)
- `editing` + click Save / press Enter (single-line) → `pending` (calls `onSave`)
- `pending` + success → `idle-saved` → `idle` (after ~2s)
- `pending` + failure → `editing-error`
- `editing-error` + click Save → `pending` (retry)
- `editing-error` + click × / press Escape → `idle`

**Rationale**: Spec FR-022 / FR-023 explicitly mandate "stay in edit mode with typed value preserved on failure" — not an auto-revert. The five-state machine cleanly separates the success-flash state (`idle-saved`) from the error-recovery state (`editing-error`) without conflating them. Owning the state in the parent hook (rather than inside the primitive) lets the same primitive be used by integration code across User and Org without forking.

**Alternatives considered**:
- 3-state (idle / editing / pending) with error rendered as an extra badge — rejected because failure-flow has subtly different affordances (Save is re-enabled, error message visible, value preserved) that warrant a distinct state.
- Component-internal state — rejected because the integration hook owns the field's last-known server value and needs to control resets after refetches.

---

## Decision 3 — Account tab navigation pattern (User Account + Org Account)

**Decision**: The CRD Account view is a **shared presentational component** (`src/crd/components/contributor/settings/ContributorAccountView.tsx`) consumed by both User Account and Org Account integrations. Heavy create / manage / delete flows are **callbacks** that the integration layer wires to `useNavigate(...)` calls landing on existing MUI admin routes:

- **Create Space** → `/admin/spaces/new` (existing MUI flow)
- **Create Virtual Contributor** → `/admin/virtual-contributors/new` (existing MUI flow)
- **Create Innovation Pack** → `/admin/innovation-packs/new` (existing MUI flow)
- **Create Innovation Hub** → `/admin/innovation-hubs/new` (existing MUI flow)
- **Manage `<resource>`** → existing per-resource admin route (e.g., `/admin/innovation-packs/<id>`)
- **Delete `<resource>`** → opens CRD `ConfirmationDialog`; on confirm, fires the corresponding existing delete mutation (located in the existing MUI flows). No new mutations are introduced.

The CRD Account view itself never imports `react-router-dom` — it receives `onCreateSpace`, `onCreateVC`, `onManage(id)`, `onDelete(id)`, etc. as props, satisfying FR-007.

**Rationale**: The existing MUI `ContributorAccountView` imports MUI core/icons heavily and cannot be embedded in CRD per FR-006. Porting the entire admin-flow surface (create / manage dialogs) would dramatically inflate scope and break "no new affordances" (Out of Scope). Navigating to the existing MUI routes preserves behaviour exactly while keeping the CRD scope tractable. This is the same pattern the prior 097 used (research §3 in the abandoned prior research) and the same pattern 096's "Org admin shell remains MUI" assumption used.

**Alternatives considered**:
- Full CRD ports of each create / manage dialog — rejected as scope inflation. Per-dialog ports can be tackled in follow-up specs.
- Two parallel CRD Account views (one per actor) — rejected; the shape is identical (4 card groups, same kebab actions, same data hooks) so DRY favors one shared component with per-actor mappers.

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

The view never knows about route paths — `onTabSelect` is a callback the integration layer wires to `useNavigate(...)` (`/user/<slug>/settings/<id>` or `/organization/<slug>/settings/<id>`).

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

## Summary

No NEEDS CLARIFICATION markers remain. All technical decisions either reuse a documented prior pattern or port a well-understood MUI behavior. The next phase (Phase 1 — Design & Contracts) builds the per-tab component contracts, the data-model entity → CRD prop tables, and the quickstart smoke checklist on top of these decisions.
