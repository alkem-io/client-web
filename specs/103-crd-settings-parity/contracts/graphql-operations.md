# GraphQL Operations Contract: CRD Settings Parity

Per Constitution III (GraphQL Contract Fidelity), this lists every GraphQL operation the feature touches. **All operations already exist** except one fragment field addition. Only generated hooks from `src/core/apollo/generated/apollo-hooks.ts` are used; no raw `useQuery`.

## Schema/document change (requires `pnpm codegen`)

| # | Operation | File | Change | Story |
|---|---|---|---|---|
| C1 | `InnovationFlowCollaboration` fragment | `src/domain/collaboration/InnovationFlow/graphql/InnovationFlowCollaboration.fragment.graphql` | Add `url` to `callouts { framing { profile { id displayName **url** } } }` | US6 |

After C1: run `pnpm codegen` (backend at `localhost:3000/graphql`), commit regenerated `apollo-hooks.ts` and `graphql-schema.ts`, and include a one-line schema-diff note in the PR. C1 is additive (new selected field) — no breaking change expected.

## Existing operations reused (no change)

| Operation | Hook | Used by | Story |
|---|---|---|---|
| `updateSubspacesSortOrder` (`spaceID`, `subspaceIds`) | `useUpdateSubspacesSortOrderMutation` | `useSubspacesTabData` (already defined, newly wired) | US4 |
| `updateSubspacePinned` (`pinnedData`) | `useUpdateSubspacePinnedMutation` | `useSubspacesTabData` (existing pin action) | US4 |
| `updateSpaceSettings` (`settingsData.settings.sortMode`) | `useUpdateSpaceSettingsMutation` | `useSubspacesTabData` (new `onSortModeChange`) | US4 |
| `SubspacesInSpace` (reads `subspaces`, `settings.sortMode`) | `useSubspacesInSpaceQuery` | `useSubspacesTabData` | US4 |
| `updateInnovationFlowCurrentState` (`innovationFlowId`, `currentStateId`) | `useUpdateInnovationFlowCurrentStateMutation` | `useColumnMenu` (already wired) | US3 |
| `InnovationFlowSettings` (+ `InnovationFlowCollaboration` fragment) | `useInnovationFlowSettingsQuery` | `useLayoutTabData` / `layoutMapper` | US3/US5/US6 |
| `inviteForEntryRoleOnRoleSet` (`roleSetId`, `invitedActorIds`, `invitedUserEmails`, `welcomeMessage`, `extraRoles`) | `useInviteForEntryRoleOnRoleSetMutation` via `useRoleSetApplicationsAndInvitations.inviteContributorsOnRoleSet` | `InviteMembersDialogConnector` (member + VC invites) | US1/US2 |
| `userSelector` (filter `{ displayName, email }`) | `useUserSelectorQuery` via `useContributors` | `ContributorSelector` (live search) | US1 |
| Available VCs on account | `useAvailableVirtualContributorsInSpaceAccount…` / `…InSpace…` (via `useVirtualContributorsAdmin`) | `VirtualContributorInviteConnector` | US2 |
| Available VCs in library | `useAvailableVirtualContributorsInLibrary…` | `VirtualContributorInviteConnector` | US2 |
| Add VC to community (on-account) | `virtualContributorAdmin.onAdd` (`useCommunityAdmin`) | `VirtualContributorInviteConnector` | US2 |

## Notes

- US2 library VC invites reuse the same `inviteForEntryRoleOnRoleSet` mutation as member invites (contributor IDs are the VC's), so no new mutation is introduced.
- No cache-shape changes; existing refetch/normalization (e.g. refetch `SubspacesInSpace` after sort/pin/mode mutations) is reused.
