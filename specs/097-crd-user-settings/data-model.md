# Phase 1 — Data Model & Mapping (User Settings)

This document enumerates the entities consumed by the CRD User Settings tabs, the GraphQL hooks they originate from, the CRD prop shapes the views expect, and the mapping rules that bridge the two. Every CRD prop type listed here is plain TypeScript (no generated GraphQL imports) per FR-005.

The mapper for each tab lives at `src/main/crdPages/topLevelPages/userPages/settings/<tab>/<tab>Mapper.ts` and is the only place GraphQL types are visible. Sibling spec `096-crd-user-pages` covers the public profile view's data model — see `specs/096-crd-user-pages/data-model.md`.

---

## Source GraphQL hooks (existing — unchanged)

| Hook | File | Purpose |
|---|---|---|
| `useUserQuery` | `src/core/apollo/generated/apollo-hooks.ts` | My Profile data (`User`, `profile.*`, `firstName`, `lastName`, `email`, `phone`, `settings.*`, `account.id`) |
| `useUserAccountQuery` | same | Hosted resources (`account.spaces`, `account.virtualContributors`, `account.innovationPacks`, `account.innovationHubs`) |
| `useAccountInformationQuery` | same | Detailed account capabilities + entitlements for the Account tab |
| `useUserContributionsQuery` | same | Memberships (`rolesUser.spaces`, nested subspaces) for the Membership tab table |
| `useUserOrganizationIdsQuery` | same | Org IDs the user is associated with (Organizations tab) |
| `useUserPendingMembershipsQuery` | same | Pending applications (Membership tab read-only table) |
| `useUserSettingsQuery` | same | Notification + privacy settings |
| `useUpdateUserMutation` | same | Per-field My Profile saves (one call per field) |
| `useUpdateUserSettingsMutation` | same | Notification toggles, Home Space, Auto-redirect, allow-messages |
| `useCreateReferenceOnProfileMutation` | same | Add a new social link / arbitrary reference |
| `useUpdateReferenceMutation` | same | Edit an existing reference's URL |
| `useDeleteReferenceMutation` | same | Delete a reference (immediate, no confirmation) |
| `useCreateTagsetOnProfileMutation` | same | Create a new tagset (skills tags etc.) |
| `useRemoveRoleFromUserMutation` | same | Underlies the Leave membership / Leave organization flows (called via `useContributionProvider.leaveCommunity`) |

## Existing facade hooks reused

| Hook | File | Purpose |
|---|---|---|
| `useUserProvider` | `src/domain/community/user/hooks/useUserProvider.ts` | Resolve the profile-being-viewed user from the URL `:userSlug`; handles canonical URL redirects |
| `useCurrentUserContext` | `src/domain/community/userCurrent/useCurrentUserContext.ts` | Current viewer identity + `hasPlatformPrivilege(...)` |
| `useFilteredMemberships` | `src/domain/community/user/hooks/useFilteredMemberships.ts` | Splits memberships into "filtered" (lead/host/admin) vs. "remaining" (member-of) |
| `useContributionProvider` | `src/domain/community/profile/useContributionProvider/` | `leaveCommunity()` action + post-leave refetch |
| `usePushNotificationContext` | `src/main/pushNotifications/PushNotificationProvider` | Push subscribe/unsubscribe + availability flags |
| `useKratosSettingsFlow` (or equivalent existing hook) | `src/main/auth/kratos/...` | Kratos `settings` flow loader for the Security tab |

---

## Entities consumed (CRD prop shapes)

### Entity: `MyProfileViewModel`

```ts
type MyProfileViewModel = {
  identity: {
    displayName: EditableTextValue;        // required
    firstName: EditableTextValue;          // required
    lastName: EditableTextValue;           // required
    email: { value: string; readOnly: true; helperText: string }; // Kratos-managed
    phone: EditableTextValue;              // optional, validated via existing phone regex
  };
  aboutYou: {
    tagline: EditableTextValue;
    city: EditableTextValue;
    country: EditableSelectValue<CountryCode>;
    bio: EditableMarkdownValue;
    tags: EditableTagsValue;               // tagset
  };
  socialLinks: {
    recognized: EditableReferenceRow[];    // LinkedIn / Bluesky / GitHub (auto-inserted if missing)
    arbitrary: EditableReferenceRow[];     // everything else, in user-defined order
  };
  avatar: {
    imageUrl: string | null;
    displayName: string;
    tagline: string | null;
    helperText: string;                    // "Recommended: 400x400px. JPG, PNG or GIF."
  };
};

type EditableTextValue = {
  value: string;
  saving: boolean;
  error: string | null;                    // present in editing+error state
};

type EditableSelectValue<T> = {
  value: T | null;
  options: { value: T; label: string }[];
  saving: boolean;
  error: string | null;
};

type EditableMarkdownValue = {
  markdown: string;
  saving: boolean;
  error: string | null;
};

type EditableTagsValue = {
  tags: string[];
  tagsetId: string | null;                 // null → first save fires createTagsetOnProfile
  saving: boolean;
  error: string | null;
};

type EditableReferenceRow = {
  id: string | null;                       // null → unsaved row created via Add Another Reference
  recognizedKind: 'LinkedIn' | 'Bluesky' | 'GitHub' | null; // null → arbitrary
  name: string;                            // editable for arbitrary, fixed for recognized
  uri: string;
  description: string | null;
  saving: boolean;
  error: string | null;
};
```

**Per-field save mapping** (one targeted `updateUser` call per field unless otherwise noted):

| Field | Mutation | Mutation input shape (essentials) |
|---|---|---|
| `firstName` | `updateUser` | `{ ID, firstName, lastName, profile: { … } }` (preserve all other fields) |
| `lastName` | `updateUser` | same — only `lastName` differs |
| `phone` | `updateUser` | same — only `phone` differs |
| `profile.displayName` | `updateUser` | `profile.displayName` updated, rest preserved |
| `profile.tagline` | `updateUser` | `profile.tagline` updated |
| `profile.location.city` | `updateUser` | `profile.location.city` updated |
| `profile.location.country` | `updateUser` | `profile.location.country` updated |
| `profile.description` (Bio) | `updateUser` | `profile.description` updated |
| Add tag (first) | `createTagsetOnProfile` | `{ profileID, name: 'default', tags: [...] }` |
| Add tag (existing tagset) | `updateUser` | `profile.tagsets[].tags` updated for the existing tagset id |
| Add reference | `createReferenceOnProfile` | `{ profileID, name, uri, description }` |
| Edit reference URL | `updateReference` | `{ ID, uri }` |
| Delete reference (trash icon) | `deleteReference` | `{ ID }` — fires immediately; no confirmation |
| Avatar file-pick | `useUploadVisualMutation` | targets `profile.avatar.id` — no separate Save click |

---

### Entity: `AccountTabViewModel`

```ts
type AccountTabViewModel = {
  helpText: string;                        // "Here you can view your active resources …" (parity copy)
  hostedSpaces: {
    items: AccountResourceCardItem[];
    onCreate: () => void;                  // navigates to existing creation route
  };
  virtualContributors: {
    items: AccountResourceCardItem[];
    onCreate: () => void;
  };
  innovationPacks: {
    items: AccountResourceCardItem[];
    onCreate: () => void;
  };
  innovationHubs: {
    items: AccountResourceCardItem[];
    onCreate: () => void;
  };
};

type AccountResourceCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
  url: string;                             // existing entity URL
  kebab: AccountKebabAction[];             // every action a CRD-styled menu entry → calls a navigate-to-existing-MUI-route handler
};

type AccountKebabAction =
  | { kind: 'view';          onClick: () => void; label: string }
  | { kind: 'manage';        onClick: () => void; label: string }
  | { kind: 'transferOut';   onClick: () => void; label: string }   // navigates to existing transfer flow
  | { kind: 'delete';        onClick: () => void; label: string }   // CRD ConfirmationDialog → existing delete mutation
  ;
```

The integration layer (`useAccountActions`) maps each action to the corresponding existing route, exactly as today's MUI Account tab dispatches its dialogs (research §3).

---

### Entity: `MembershipTabViewModel`

```ts
type MembershipTabViewModel = {
  homeSpace: {
    options: { id: string; displayName: string }[];   // every L0 the user belongs to
    selectedSpaceId: string | null;
    autoRedirect: boolean;
    autoRedirectDisabledReason: string | null;        // i18n caption when no Home Space is selected
    saving: boolean;
    onSelectSpace: (id: string | null) => void;
    onToggleAutoRedirect: (next: boolean) => void;
  };
  myMemberships: {
    rows: MembershipRow[];                           // already filtered / paginated client-side
    search: string;
    onSearchChange: (next: string) => void;
    filter: MembershipFilter;
    onFilterChange: (next: MembershipFilter) => void;
    page: number;
    pageSize: 10;
    totalRows: number;
    onPageChange: (next: number) => void;
    onLeaveRow: (row: MembershipRow) => void;        // opens CRD ConfirmationDialog → leaveCommunity
  };
  pendingApplications: {
    rows: PendingApplicationRow[];                   // read-only
  };
};

type MembershipRow = {
  id: string;                              // role-set member ID
  displayName: string;
  spaceUrl: string;                        // for click-through
  type: 'Space' | 'Subspace';
  description: string | null;
  role: string;                            // "Admin" | "Lead" | "Member" | …
  memberCount: number;
  status: 'Active' | 'Archived';
  avatarImageUrl: string | null;
};

type MembershipFilter = 'all' | 'spaces' | 'subspaces' | 'active' | 'archived';

type PendingApplicationRow = {
  id: string;
  spaceDisplayName: string;
  appliedAt: string;                       // ISO date
  status: string;                          // "Pending"
};
```

---

### Entity: `OrganizationsTabViewModel`

```ts
type OrganizationsTabViewModel = {
  rows: OrganizationRow[];                 // filtered client-side
  search: string;
  onSearchChange: (next: string) => void;
  canCreateOrganization: boolean;          // CreateOrganization platform privilege
  onCreateOrganization: () => void;        // navigates to existing flow
  onLeaveRow: (row: OrganizationRow) => void;
};

type OrganizationRow = {
  id: string;
  url: string;                             // org profile page
  displayName: string;
  description: string | null;
  city: string | null;
  country: string | null;
  role: 'Admin' | 'Associate';
  associatesCount: number;
  verified: boolean;
  websiteUrl: string | null;
  avatarImageUrl: string | null;
};
```

---

### Entity: `NotificationsTabViewModel`

```ts
type NotificationsTabViewModel = {
  pushAvailability: PushAvailability;
  pushSubscriptionList: PushSubscriptionItem[];
  groups: NotificationGroup[];
};

type PushAvailability =
  | { available: true;  master: { value: boolean; saving: boolean; onToggle: (next: boolean) => Promise<void> } }
  | { available: false; reason: 'unsupported' | 'requiresPWA' | 'privateBrowsing' | 'serverDisabled' };

type PushSubscriptionItem = {
  id: string;
  displayName: string;                     // device / browser name
  lastUsedAt: string | null;               // ISO date
  isCurrentDevice: boolean;
  onRemove: () => Promise<void>;
};

type NotificationGroup = {
  key: 'space' | 'spaceAdmin' | 'user' | 'platform' | 'platformAdmin' | 'organization' | 'virtualContributor';
  visible: boolean;                        // privilege-gated; hidden groups simply omit
  title: string;                           // i18n
  rows: NotificationRow[];
};

type NotificationRow = {
  property: string;                        // i18n key for the row label
  inApp: NotificationToggle;
  email: NotificationToggle;
  push: NotificationToggle | null;         // null when push column is hidden
};

type NotificationToggle = {
  value: boolean;                          // optimistic-overrides applied
  saving: boolean;
  onToggle: (next: boolean) => Promise<void>;
};
```

**Group → property mapping** mirrors the current MUI `UserAdminNotificationsPage` exactly (FR-070). The integration layer reads the source-of-truth list of properties from the existing `NotificationSettings.model.ts` so additions / removals on the model land in CRD automatically. Privilege gating (`isPlatformAdmin`, `isSpaceAdmin`, `isSpaceLead`, `isOrgAdmin`) reuses `useCurrentUserContext.userWrapper.hasPlatformPrivilege(...)` exactly as MUI does.

---

### Entity: `SettingsTabViewModel`

```ts
type SettingsTabViewModel = {
  allowOtherUsersToSendMessages: {
    value: boolean;
    saving: boolean;
    onToggle: (next: boolean) => Promise<void>;
  };
  designSystem: {
    crdEnabled: boolean;                   // reads localStorage at mount
    onToggle: (next: boolean) => void;     // writes localStorage + reload
    captionI18nKey: string;                // "The page will reload after the change."
  };
};
```

---

### Entity: `SecurityTabViewModel`

```ts
type SecurityTabViewModel = {
  state:
    | { kind: 'loading' }
    | { kind: 'error'; errorMessage: string }
    | { kind: 'noWebauthn' }                              // info banner
    | { kind: 'ready'; flow: KratosFlow };                // KratosFlow type imported in mapper, not in view
};
```

The view receives the `flow` as an opaque value and renders it via `KratosForm` + `KratosUI` — the CRD layer does not introspect Kratos's internal node types.

---

## Validation rules (carried over from MUI parity)

- **First Name / Last Name / Display Name**: required (non-empty after trim).
- **Phone**: must match the existing phone regex used by `UserForm` (validated client-side; server-side validation is the source of truth — failures surface as inline errors via the per-field state machine).
- **Email**: read-only — never validated client-side.
- **City**: free text.
- **Country**: must be one of `COUNTRIES` constant values.
- **Bio**: markdown — no length cap client-side.
- **Tags**: each tag is non-empty string; duplicates are de-duplicated client-side before save.
- **Reference URL**: must be a syntactically valid URL (existing `referenceSegmentSchema` regex). Per-row Save button is disabled while invalid; an inline error surfaces under the URL input.
- **Reference name** (arbitrary only): free text; required (non-empty after trim).

---

## State transitions

### `EditableField` state machine

```
idle ── click value/pencil ──▶ editing
editing ── type ──▶ editing (value updated, error cleared)
editing ── click Save / Enter (single-line) ──▶ pending
editing ── click × / Escape ──▶ idle (value reset to server)
pending ── mutation success ──▶ idle (transient "Saved" indicator for ~2 s)
pending ── mutation failure ──▶ editing (typed value preserved, inline error shown)
```

The `editing` ⇄ `pending` ⇄ `editing+error` cycle preserves the user's input across retries — no retyping.

### Reference row lifecycle

```
(no row) ── click Add Another Reference ──▶ unsaved row in editing (id=null)
unsaved row in editing ── click Save ──▶ pending → on success: row becomes saved (id set), idle
unsaved row in editing ── click × ──▶ row removed entirely
saved row in idle ── click value ──▶ saved row in editing
saved row in editing ── click Save ──▶ pending → on success: idle
saved row ── click trash ──▶ row removed (deleteReference fires immediately, no confirmation)
```

### Membership / Organization Leave flow

```
idle ── click kebab → Leave ──▶ ConfirmationDialog open
ConfirmationDialog ── click Cancel ──▶ idle (no mutation)
ConfirmationDialog ── click Confirm ──▶ pending (button shows spinner)
pending ── leaveCommunity success ──▶ row removed, list refetches
pending ── leaveCommunity failure ──▶ ConfirmationDialog stays open with inline error; user can retry or cancel
```

### CRD design-system toggle

```
idle ── click Switch ──▶ pending (Switch becomes disabled briefly)
pending ── localStorage write ──▶ window.location.reload() — page reloads in the chosen renderer
```

No rollback path: the reload commits the change.

---

## Cross-tab invariants

- **Slug → user resolution**: every tab resolves the profile-being-edited user via `useUserPageRouteContext()` (a thin wrapper around `useUserProvider`); the same user object feeds the settings shell header and every settings tab in the same render cycle.
- **`canEditSettings` is computed once per route** at the settings shell boundary; it is passed as a prop to every settings tab view (every tab view ALSO accepts it for its own conditional rendering, but the shell guarantees the value is identical across tabs).
- **Mutation refetch**: every mutation that affects the User entity uses `refetchQueries: [UserDocument]` (or the equivalent Apollo cache update) so the next render sees the new value — same strategy current MUI uses; no custom optimistic cache writes are introduced beyond the Notifications optimistic-overrides dictionary (research §8).
