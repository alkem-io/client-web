# Data Model — CRD Member Settings Dialog

This document specifies the in-memory data shapes the new CRD components consume and the local state they own. It is the contract between the CRD presentational layer and the integration layer (`src/main/crdPages/topLevelPages/spaceSettings/community/`). No GraphQL schema changes are introduced; all types here are plain TypeScript ports of existing GraphQL types, computed once in the data mapper and passed in as props.

## Entities

### `MemberSettingsSubject`

Represents the row the dialog is acting on. Discriminated by `type` so the dialog can hide the admin section for organizations.

```ts
type MemberSettingsSubject =
  | {
      type: 'user';
      id: string;
      displayName: string;
      firstName?: string;            // used by the removal confirmation prompt
      avatarUrl?: string;
      city?: string;
      country?: string;
      isLead: boolean;
      isAdmin: boolean;
    }
  | {
      type: 'organization';
      id: string;
      displayName: string;
      avatarUrl?: string;
      city?: string;
      country?: string;
      isLead: boolean;
      // organizations have no `isAdmin` field
    };
```

**Validation rules**:

- `id` is non-empty (caller must pre-filter rows lacking an id).
- `displayName` may be empty string; the Avatar fallback initials handle this gracefully.
- `firstName` defaults to `displayName` in the removal-prompt body when missing.

### `MemberSettingsLeadPolicy`

Aggregate of the two boolean gates the dialog needs to compute the lead-checkbox disabled state.

```ts
type MemberSettingsLeadPolicy = {
  canAddLead: boolean;
  canRemoveLead: boolean;
};
```

**Derivation** (in the integration layer, using existing `useCommunityPolicyChecker`):

- For users: `{ canAddLead: leadPolicy.canAddLeadUser, canRemoveLead: leadPolicy.canRemoveLeadUser }`.
- For organizations: `{ canAddLead: leadPolicy.canAddLeadOrganization, canRemoveLead: leadPolicy.canRemoveLeadOrganization }`.

**Disabled rule** (computed inside the dialog):

```ts
const leadCheckboxDisabled =
  (!policy.canAddLead && !subject.isLead) ||
  (!policy.canRemoveLead && subject.isLead);
```

This mirrors the legacy MUI dialog's disabled rule exactly.

### `MemberSettingsCallbacks`

Three callbacks injected by the integration layer; each returns a Promise that resolves on success and rejects on failure. The dialog awaits the promise to drive its busy state and to decide whether to close on completion.

```ts
type MemberSettingsCallbacks = {
  onLeadChange: (id: string, isLead: boolean) => Promise<unknown>;
  onAdminChange?: (id: string, isAdmin: boolean) => Promise<unknown>;  // user-only
  onRemoveMember?: (id: string) => Promise<unknown>;                    // gated by viewer privilege
};
```

**Contract**:

- The dialog calls `onLeadChange` only when `localIsLead !== subject.isLead`.
- The dialog calls `onAdminChange` only when `subject.type === 'user'` and `localIsAdmin !== subject.isAdmin` and the callback is provided.
- `onRemoveMember` is invoked exclusively from inside the AlertDialog's Confirm button. If the prop is omitted, the in-dialog Remove section is not rendered (mirrors FR-008 / FR-016).

### `MemberSettingsDialogState` (internal)

The component-local visual state owned by `MemberSettingsDialog`. Not exposed to consumers.

```ts
type MemberSettingsDialogState = {
  isLead: boolean;                   // initialized from subject.isLead, edited by user
  isAdmin: boolean;                  // initialized from subject.isAdmin, edited by user (user-only)
  saveInFlight: boolean;             // true while the save Promise is unsettled
  removalPromptOpen: boolean;        // true while the AlertDialog is open
  removalInFlight: boolean;          // true while the removeMember Promise is unsettled
};
```

**Transitions**:

- **Open** (consumer toggles `open=true`): seed `isLead`/`isAdmin` from `subject`; clear all `*InFlight` flags; `removalPromptOpen=false`.
- **Toggle Lead/Admin**: update `isLead`/`isAdmin`; no other state changes.
- **Click Save** (no diff): close dialog (`onOpenChange(false)`); state is discarded.
- **Click Save** (with diff): set `saveInFlight=true`; await `onLeadChange` and/or `onAdminChange`; on success clear `saveInFlight` and call `onOpenChange(false)`; on failure clear `saveInFlight` and stay open (toast surfaced by integration layer per FR-014).
- **Click Cancel / Esc / Close (X) / outside-click**: call `onOpenChange(false)`; state is discarded; no mutation runs.
- **Click in-dialog Remove affordance**: set `removalPromptOpen=true`.
- **AlertDialog Cancel**: set `removalPromptOpen=false`.
- **AlertDialog Confirm**: set `removalInFlight=true`; await `onRemoveMember`; on success clear `removalInFlight` and `removalPromptOpen` and call `onOpenChange(false)`; on failure clear `removalInFlight` only.
- **Concurrency guard**: while `saveInFlight || removalInFlight === true`, all interactive controls (checkboxes, Cancel, Save, in-dialog Remove link) are `disabled`. The AlertDialog's Confirm and Cancel are `disabled` while `removalInFlight === true`.

### `MemberSettingsRowEntryPoint` (consumer-side)

Local visual state owned by `SpaceSettingsCommunityView` (or its caller) per active row.

```ts
type ActiveMemberSettings =
  | { open: false }
  | { open: true; subject: MemberSettingsSubject };

type ActiveRemoveConfirmation =
  | { open: false }
  | { open: true; subject: MemberSettingsSubject; source: 'dropdown' | 'dialog' };
```

The `source` discriminator is used only for telemetry / debugging; both paths run the same removal mutation. Only one `ActiveMemberSettings` and one `ActiveRemoveConfirmation` are open at a time per page; opening another row's "Change Role" closes the prior dialog (FR-Story-5 #5).

## Mapping from existing types

The integration layer is responsible for projecting the existing CRD `CommunityMember` and `CommunityOrg` row models into `MemberSettingsSubject`:

```ts
// existing type, defined in src/crd/components/space/settings/SpaceSettingsCommunityView.tsx
type CommunityMember = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  url?: string;
  roleLabel: string;
  isLead: boolean;
  isAdmin: boolean;
  joinedDate: string;
};

type CommunityOrg = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  url?: string;
  isMember: boolean;
  isLead: boolean;
};
```

**Mapper** (in `src/main/crdPages/topLevelPages/spaceSettings/community/`):

```ts
const subjectFromUser = (m: CommunityMember): MemberSettingsSubject => ({
  type: 'user',
  id: m.id,
  displayName: m.displayName,
  // firstName: derived from the GraphQL User entity in the data mapper, not from CommunityMember row model
  avatarUrl: m.avatarUrl,
  isLead: m.isLead,
  isAdmin: m.isAdmin,
});

const subjectFromOrg = (o: CommunityOrg): MemberSettingsSubject => ({
  type: 'organization',
  id: o.id,
  displayName: o.displayName,
  avatarUrl: o.avatarUrl,
  isLead: o.isLead,
});
```

**Note on `firstName`**: The existing `CommunityMember` row type does not carry `firstName`. The data mapper in `useCommunityTabData.ts` either (a) extends `CommunityMember` with an optional `firstName` field, or (b) the integration layer reads `firstName` directly from the underlying GraphQL `RoleSetMembersList` query result when it constructs `MemberSettingsSubject`. Option (a) is preferred to keep `SpaceSettingsCommunityView` row data complete; the alternative is acceptable but spreads the read across two layers. Decision deferred to PR.

## Key Entities (from spec)

The spec's "Key Entities" section names eight conceptual entities. They map to the data-model entities above as follows:

| Spec entity | Data-model entity |
|---|---|
| Community Member (User) | `MemberSettingsSubject` with `type: 'user'` |
| Community Member (Organization) | `MemberSettingsSubject` with `type: 'organization'` |
| Community Role-Set Policy | `MemberSettingsLeadPolicy` (the dialog only consumes the relevant slice; full policy stays in the integration layer via `useCommunityPolicyChecker`) |
| Member Settings Dialog State | `MemberSettingsDialogState` |
| Removal Confirmation | Implemented via the `AlertDialog` primitive; state is tracked by `MemberSettingsDialogState.removalPromptOpen` (when triggered from inside the dialog) and by `ActiveRemoveConfirmation` at the consumer (when triggered from the row dropdown) |
| Toast / Notification (existing) | Not modeled here — it is a side effect emitted by the integration layer when `onLeadChange` / `onAdminChange` / `onRemoveMember` rejects |
| CRD Feature Toggle | Not modeled here — handled in `TopLevelRoutes.tsx` via the existing `useCrdEnabled()` hook |

## Translation key inventory

New keys added under `crd-spaceSettings` namespace at `community.memberSettings.*`:

```jsonc
"community": {
  // ...existing keys...
  "memberSettings": {
    "title": "Member settings",
    "lead": "This member is a <b>lead</b>: Leads are shown as the hosts of the community.",
    "admin": "This member is an <b>admin</b>: (s)he has the right to administer this community and all of its content and contributors.",
    "maxLeadsWarning": "Note that there is a specific <b>maximum number of leads</b> for the communities. If the maximum number is reached, this option will be disabled for others.",
    "section": {
      "role": "Role",
      "authorization": "Authorization",
      "removeMember": "Remove member"
    },
    "remove": {
      "link": "Click here to remove this user from this community. Be careful, this action cannot be undone.",
      "confirmTitle": "Are you sure you want to remove this member?",
      "confirmBody": "By clicking Confirm, {{member}} will be removed from this community and all the underlying subspaces {{memberFirstName}} may be a member of. {{memberFirstName}}'s contributions will remain in place.",
      "confirmCta": "Confirm",
      "cancelCta": "Cancel"
    },
    "footer": {
      "save": "Save",
      "cancel": "Cancel"
    }
  },
  // existing community.members.* keys are extended:
  "members": {
    "actions": {
      // existing key value remains; NEW dropdown items below
      "menu": "Member actions"   // accessible name for the ⋮ button (already present, reused)
    },
    "dropdown": {
      "viewProfile": "View Profile",
      "changeRole": "Change Role",
      "removeFromSpace": "Remove from Space"
    }
  }
}
```

All six locale files (`en`, `nl`, `es`, `bg`, `de`, `fr`) MUST contain these keys. Non-English values MAY remain English placeholders until the translation team produces localized copy (per spec SC-007).

## Out of scope for the data model

- **GraphQL queries / mutations**: existing generated hooks (`useAssignRoleToUserMutation`, `useRemoveRoleFromUserMutation`, `useAssignRoleToOrganizationMutation`, `useRemoveRoleFromOrganizationMutation`) and existing `useCommunityAdmin` orchestrator are reused. Their behavior is documented in the codebase, not duplicated here.
- **Apollo cache updates**: handled by `useCommunityAdmin` via existing refetch patterns. No new cache writes.
- **Permission gates**: the integration layer already filters which row affordances are shown using `useUserContext` privileges; the dialog itself trusts that filtering and only renders the affordances its props declare.
