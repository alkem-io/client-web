# Research — CRD Member Settings Dialog

This document captures the technical decisions made during Phase 0 of `/speckit.plan`. It resolves the three items deferred from `/speckit.clarify` and records the reference points used to scope the implementation.

## Deferred-from-clarify decisions

### Decision 1: Translation namespace placement

**Decision**: Extend the existing `crd-spaceSettings` namespace (`src/crd/i18n/spaceSettings/spaceSettings.<lang>.json`) with `community.memberSettings.*` keys. Do **not** create a new feature namespace.

**Rationale**:
- The Members table strings already live in this namespace (`community.members.*`, `community.members.actions`, `community.members.role.*`, `community.members.pagination.*`). The Member settings dialog is the per-row settings surface for that same table — keeping its keys in the same namespace preserves locality for translators and avoids a mid-feature namespace switch when developers wire callsites.
- The legacy MUI source of truth (`src/core/i18n/en/translation.en.json`) already groups these keys under `community.memberSettings.*`. Mirroring the path inside `crd-spaceSettings` keeps copy provenance traceable across MUI ↔ CRD without renaming.
- CRD `CLAUDE.md` allows per-feature namespaces but does not require them — the rule is "feature-area = namespace," and Space Settings is one feature area whose translations are already lazy-loaded as one unit.

**Alternatives considered**:
- *New `crd-memberSettings` namespace*: rejected. It would split a single Space-Settings page across two lazy-loaded chunks and double the maintenance overhead for a small handful of strings (~10 keys). It also does not fit any of the existing dialogs, which all live inside their host page's namespace.
- *Reuse the main `translation` namespace via cross-namespace `t()` calls*: rejected. The CRD `CLAUDE.md` Critical Rule explicitly forbids importing from the default `translation` namespace inside CRD components.

### Decision 2: Self admin demotion gating in the UI

**Decision**: The CRD dialog does **not** preemptively block a user from toggling their own admin checkbox. The admin checkbox remains interactive when the dialog is opened on the current viewer's row; the server is the source of truth for cascade rules (e.g., last-admin protection). A server-side rejection surfaces via the existing toast pattern (FR-014) and the dialog stays open with controls re-enabled so the user can revert.

**Rationale**:
- The MUI dialog also does not preempt this case — it relies on backend authorization. Adding a UI-level guard would duplicate server logic and risk drifting out of sync with future authz policy changes.
- The Edge Cases section in the spec already documents this as a known scenario routed through the toast pattern; FR-014 makes the failure UX explicit. No additional code path is needed.
- Pre-blocking would also require the integration layer to know "who is the last admin" — a boolean the GraphQL Roleset query does not expose without additional aggregation. Out of scope for this iteration.

**Alternatives considered**:
- *Disable the admin checkbox when `viewer.id === member.id` AND `isAdmin === true`*: rejected. Heuristic guess that does not match the actual authz rule. A sole admin should be allowed to demote themselves once a co-admin exists, and the UI cannot reliably know that without re-querying.
- *Show a confirmation prompt on self-demotion*: rejected. Adds friction without preventing the actual error case (last admin self-demote), which the server already prevents.

### Decision 3: Save button enabled-when-clean state

**Decision**: The Save button is **always enabled** while the dialog is open and no mutation is in flight. When the user has made no changes, clicking Save is a no-op that simply closes the dialog (matching FR-010).

**Rationale**:
- Mirrors the legacy MUI `CommunityMemberSettingsDialog` behavior. Admins coming from MUI will not need to relearn the affordance.
- "Save" being enabled with no changes is a recoverable action (closes dialog, no mutation) — disabling it would force the user to track which button (Cancel vs. Save) closes the dialog when toggle states happen to land on the loaded values.
- Removes a class of bugs around computing "dirty" state under React Compiler's automatic memoization (computed dirty flags would still recompute on every render; the simplification gains nothing).

**Alternatives considered**:
- *Disable Save when `localIsLead === member.isLead && localIsAdmin === member.isAdmin`*: rejected per above.
- *Hide Cancel when no changes*: rejected. Removes a familiar affordance for no benefit.

## Confirmation prompt primitive

**Decision**: Use the existing `src/crd/primitives/alert-dialog.tsx` (Radix AlertDialog wrapped to shadcn conventions) for the destructive removal confirmation. It is the canonical destructive-confirmation primitive in the CRD design system.

**Rationale**:
- AlertDialog enforces stricter focus management (no outside-click-to-dismiss, explicit Confirm + Cancel buttons), which is the expected behavior for irreversible actions like community removal.
- The legacy MUI `ConfirmationDialog` plays the same role for the MUI dialog; the AlertDialog primitive is the natural CRD counterpart.
- The primitive is already imported in other CRD destructive flows (e.g., `SpaceSettingsCommunityView` would adopt it for "Remove from Space" — see contracts).

**Spec assumption update**: The spec previously hedged with "if/when an AlertDialog primitive is added." The primitive **already exists**. The "interim second-Dialog with destructive styling" fallback is unnecessary and is removed from the implementation plan.

**Alternatives considered**:
- *Reuse the standard `dialog.tsx` (Dialog primitive) with destructive styling*: rejected. Loses the AlertDialog-specific focus and dismissal semantics; less accessible.
- *Native browser `window.confirm()`*: rejected. Does not match design system, does not allow interpolated member names, lacks accessible focus management.

## Component scope and reuse map

The following CRD primitives already exist and will be reused (no new primitives are introduced):

| Primitive | Source | Use |
|---|---|---|
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | `src/crd/primitives/dialog.tsx` | Member settings dialog chrome |
| `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel` | `src/crd/primitives/alert-dialog.tsx` | Removal confirmation |
| `Checkbox` | `src/crd/primitives/checkbox.tsx` | Lead and admin role toggles |
| `Label` | `src/crd/primitives/label.tsx` | Checkbox labels |
| `Button` | `src/crd/primitives/button.tsx` | Cancel / Save / Confirm / Cancel-confirm |
| `Avatar`, `AvatarFallback`, `AvatarImage` | `src/crd/primitives/avatar.tsx` | Member identification chip |
| `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger` | `src/crd/primitives/dropdown-menu.tsx` | Existing per-row dropdown — modify to include "Change Role" |
| `Trash2`, `MoreHorizontal` icons | `lucide-react` | Destructive icon, dropdown trigger |

## MUI source for porting reference

The MUI implementation is the design source for behavior parity. Files referenced (read-only — not modified):

- `src/domain/spaceAdmin/SpaceAdminCommunity/dialogs/CommunityMemberSettingsDialog.tsx` — full dialog body, lead/admin toggle wiring, removal confirmation.
- `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityUsers.tsx` (lines 184-193) — entry point pattern for users.
- `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityOrganizations.tsx` (lines 189-197) — entry point pattern for orgs (no admin checkbox shown there).
- `src/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin.ts` — `onLeadChange`, `onAdminChange`, `onRemoveMember` callback factory; reused as-is via the existing CRD integration in `useCommunityTabData.ts`.
- `src/core/i18n/en/translation.en.json` — `community.memberSettings.*` translation keys (English copy source).

## Integration-layer wiring

The integration layer in `src/main/crdPages/topLevelPages/spaceSettings/community/` already exposes:

- `community.userAdmin.onLeadChange(id, isLead)` — used today by the existing inline lead toggle.
- `community.userAdmin.onRemoveMember(id)` — needs to be exposed (currently `onUserRemove` exists; check `useCommunityAdmin` for `onRemoveMember`).
- `community.organizationAdmin.onLeadChange(id, isLead)` — same pattern for orgs.
- `leadPolicy` — `canAddLeadUser` / `canRemoveLeadUser` / `canAddLeadOrganization` / `canRemoveLeadOrganization`.

Newly exposed by this feature:

- **Admin role mutation**: `community.userAdmin.onAdminChange(id, isAdmin)` — wires `useAssignRoleToUserMutation` / `useRemoveRoleFromUserMutation` with `RoleName.Admin` (mirrors the existing MUI integration in `useCommunityAdmin.ts`).
- **Current viewer id**: `viewerId: string | undefined` from `useUserContext` — passed to the CRD dialog so it can hide the Remove section when `viewerId === member.id` (FR-016).

## Browser compatibility

No new browser APIs are introduced. The dialog uses Radix UI's existing focus-trap, ESC handling, and tab-cycling — all already deployed across other CRD dialogs (Search, About, Apply, Pending Memberships).

## Performance notes

- The dialog mounts on demand per row (controlled `open` state in the integration container). React Compiler memoization makes per-row prop computations safe; no manual `useMemo` is added.
- The dropdown menu's `DropdownMenuContent` is rendered lazily by Radix (only when triggered), keeping the table render cost flat with row count.
- Mutations (lead, admin, remove) reuse Apollo's existing optimistic / refetch patterns from `useCommunityAdmin` — no cache surgery added.

## Accessibility verification points

- Focus trap inside both `Dialog` and `AlertDialog` (Radix default).
- `aria-labelledby` / `aria-describedby` provided by `DialogTitle` / `DialogDescription` (and `AlertDialog` equivalents).
- Lead and admin checkboxes have programmatic `<Label>` association.
- Helper text below the lead checkbox uses `id` + `aria-describedby` so screen readers announce the cap context together with the checkbox state.
- Trash icon on the in-dialog Remove affordance is `aria-hidden="true"`; the affordance's accessible name comes from the visible link text.
- Tab order documented in spec Edge Cases is implementable via DOM order — no manual `tabIndex` required.

## Open questions (none)

All items necessary to begin implementation are resolved. Any remaining minor UX polish (e.g., exact icon choice for the in-dialog Remove section header, exact color tokens for destructive states) is implementation detail to be decided during PR review against the prototype reference.
