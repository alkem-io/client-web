# Data Model: CRD Invite Members Dialog

**Feature**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)
**Created**: 2026-05-08

> View-model entities only. No GraphQL schema changes. Names below are the TypeScript types that flow between the connector and the CRD presentational dialog.

## `Role`

```ts
type Role = 'Member' | 'Lead' | 'Admin';
```

- Mirrors a subset of the GraphQL `RoleName` enum (`Member`, `Lead`, `Admin`) used by `INVITE_USERS_TO_ROLES` in the legacy dialog.
- The CRD presentational layer uses string literals to avoid importing the generated GraphQL enum into `src/crd/`. The connector translates back to `RoleName` when invoking the mutation.
- **Invariant**: `Member` is always present in any submitted batch. The dialog enforces this in the UI; the connector enforces it again before submitting.

## `Invitee`

```ts
type Invitee =
  | { kind: 'user'; userId: string; displayName: string; avatarUrl?: string; location?: string }
  | { kind: 'email'; email: string; validationError?: 'invalid' | 'duplicate' };
```

- Discriminated union — every chip in the contributor list is one variant.
- `kind: 'user'`: produced by `ContributorSelector` when the admin picks a row from the autocomplete dropdown. `userId` is the platform user id; `location` is `"city, country"` if available.
- `kind: 'email'`: produced by the connector running the existing `emailParser` over the input string when the admin presses Enter or clicks Add. `validationError` carries either `'invalid'` (parser rejected) or `'duplicate'` (already present in the list).
- **Invariant**: an `Invitee` with a `validationError` is **excluded** from the submitted batch by the connector but stays visible in the chip list so the admin can fix or remove it.

## `InvitationBatch`

```ts
type InvitationBatch = {
  contributors: Invitee[];
  welcomeMessage: string;
  extraRoles: Role[]; // always contains 'Member'
};
```

- The dialog's working state. Stored in connector-owned local state (`useState`).
- **Send-disabled rules** (the form returns `disableSend === true` if any of these hold):
  - `contributors` is empty.
  - Any element of `contributors` has `validationError`.
  - `welcomeMessage.trim()` is empty.
  - `extraRoles` does not include `'Member'` (defensive — UI prevents this anyway).
  - The connector reports `loading || sending`.

## `InvitationResult`

```ts
type InvitationResult = {
  invitee: Invitee;          // always the original chip — never a surrogate
  outcome: 'sent' | 'alreadyMember' | 'error';
  errorMessage?: string;     // only present when outcome === 'error'
};
```

- One per invitee in the original `InvitationBatch.contributors` (post-validation slice — `validationError`-flagged invitees are NOT in the batch and therefore NOT in the result list).
- The connector builds these from the legacy `InvitationResultModel[]` returned by `inviteContributorsOnRoleSet`. The CRD layer never sees `InvitationResultModel`.
- **Invariant**: `result.invitee` always carries enough info (display name OR email) to render a row without a second lookup. Avatars are best-effort (already on the `Invitee`).

## State machine: `view`

```text
        ┌─────────┐      Send resolves      ┌──────────┐
open=>  │  form   │ ──────────────────────▶ │  result  │
        └─────────┘                         └──────────┘
             ▲                                   │
             │                                   │
             └──────── Back / open=false ────────┘
```

- `view` is local state in `InviteMembersDialog`. Initial value `'form'`.
- Transitions:
  - `'form' → 'result'`: triggered by parent passing `results !== undefined`.
  - `'result' → 'form'`: triggered by `onBack()` — the connector clears `contributors` and `results` and the dialog auto-resets `view` to `'form'` because `results === undefined` again.
  - `* → 'form'` (on reopen): triggered by `open` going `false → true`. The dialog watches `open` in a `useEffect` and resets `view` to `'form'`.

## Mutation contract (connector → existing domain)

The connector calls the existing `inviteContributorsOnRoleSet` (from `src/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations.ts`) with this argument shape:

```ts
{
  roleSetId: string;                     // from useInviteUsersDialogQuery
  invitedContributorIds: string[];       // userId of each kind:'user' invitee
  invitedUserEmails: string[];           // email of each kind:'email' invitee (validation-clean)
  welcomeMessage: string;
  extraRoles: RoleName[];                // mapped from Role[] via the connector
}
```

This mirrors the legacy `InviteUsersDialog.tsx` payload exactly. **No backend changes.**
