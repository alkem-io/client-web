# Research: CRD Invite Members Dialog

**Feature**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)
**Created**: 2026-05-08

## R1: Reuse `UserSelector` vs build sibling `ContributorSelector`

**Decision**: Build a new `ContributorSelector` in `src/crd/forms/ContributorSelector.tsx` rather than extending `UserSelector`.

**Rationale**:

- `UserSelector` (`src/crd/forms/UserSelector.tsx`) is currently typed against a single `ShareUser` shape: `{ id, displayName, avatarUrl?, city?, country? }`. Its `selectedUsers: ShareUser[]` and `searchResults: ShareUser[]` props are foundational to its public contract; the chip rendering hard-codes `displayName` and `avatarUrl`.
- Adding email-only invitees would require either:
  - **(a)** Generalising `UserSelector` props to a discriminated union — every existing consumer (`ShareDialog` → `CalloutShareOnAlkemioForm`) would need to migrate to the union API simultaneously. No reuse benefit accrues until a third consumer appears.
  - **(b)** Adding parallel `selectedEmails` / `onAddEmail` props — bloats the surface and violates ISP (callers that only do existing-user picks would have to acknowledge email props).
- A sibling component is cheap (~180 LoC) and keeps each component minimal: `UserSelector` for share-with-existing, `ContributorSelector` for invite-new. Their internal layouts use the same Tailwind + Radix patterns; we copy the chip + dropdown markup.
- If we ever land a third "user-pick + extra payload" consumer, we revisit and unify into a generic `ContributorPicker<T>`. Two consumers is below the de-duplication threshold the constitution implies (DRY applies once a pattern repeats — and `ContributorSelector` is the second, not yet the third, occurrence of this pattern).

**Alternatives considered**:

- **Generic `ContributorPicker<T>`**: rejected — speculative; we only have two specific uses and the abstractions diverge meaningfully on chip content.
- **Inline in dialog (no shared form)**: rejected — the contributor list with chips, autocomplete dropdown, paginated load-more, and email validation render is ~150 LoC of UI; baking it into `InviteMembersDialog.tsx` violates SRP.
- **Reuse legacy `FormikContributorsSelectorField`**: rejected — it's MUI-based and Formik-coupled; would drag MUI into the CRD layer (forbidden by `src/crd/CLAUDE.md`).

## R2: Role picker — Popover + Checkbox group vs MultiSelect

**Decision**: Build `RoleMultiSelect` as a Popover-trigger + Checkbox list in `src/crd/forms/RoleMultiSelect.tsx`. Member is rendered as a checked + disabled checkbox; Lead and Admin are togglable.

**Rationale**:

- The CRD primitive set today (`primitives/select.tsx`, `primitives/dropdown-menu.tsx`, `primitives/popover.tsx`) does **not** include a multi-select. The shadcn/ui `Select` primitive is single-select only.
- Building a generic `MultiSelect` primitive is overkill for a 3-option, single-screen-on-the-platform requirement. The Popover + Checkbox group is well-supported in CRD primitives (`primitives/popover.tsx`, `primitives/checkbox.tsx`, `primitives/label.tsx`) and gives full control over the "Member fixed" requirement.
- The Popover trigger renders a summary line ("Member, Lead") with a chevron — matching shadcn `Select`-trigger visuals — and opens to a labelled checkbox list with one row per role. This pattern is used elsewhere in shadcn projects and is accessible (`role="combobox"` + `aria-expanded`, each option is a labelled `<input type="checkbox">`).
- A future generic `MultiSelect` primitive can be promoted from this code if a third multi-select use case appears. For now `RoleMultiSelect` lives in `forms/` not `primitives/` because it embeds the Member-locked semantics (which a generic primitive shouldn't).

**Alternatives considered**:

- **Three separate Switch toggles** (`primitives/switch.tsx`): rejected — disabled-because-required Member would render confusingly as a permanently-on switch with no explanation. Checkboxes naturally accommodate disabled-checked.
- **A single `<select multiple>`**: rejected — clashes with CRD's overall picker style and forces native styling we'd then have to override.
- **`DropdownMenu` with `DropdownMenuCheckboxItem`** (`primitives/dropdown-menu.tsx`): considered — actually provides multi-select-like checkbox items. Rejected for two reasons: (a) Radix `DropdownMenu` is intended for action menus and closes on each select by default (works around but feels wrong), (b) the locked-Member semantics fit checkbox-with-label more naturally than a menu item.

## R3: Connector location

**Decision**: `src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx`.

**Rationale**:

- The directory `src/main/crdPages/space/dialogs/` already hosts two sibling connectors (`CrdSpaceAboutDialogConnector.tsx`, `CrdSpaceCommunityDialogConnector.tsx`). The new connector matches the established naming and structural pattern.
- Both invite entry points (`CrdSpaceCommunityPage.tsx` under `space/tabs/` and `CrdSpaceSettingsPage.tsx` under `topLevelPages/spaceSettings/`) live within the space surface — placing the connector under `space/dialogs/` keeps the dialog and its consumers in the same conceptual neighbourhood and avoids cross-feature imports.
- The connector is a glue file: it owns the dialog's `open` state via an externally-controlled prop, fetches `roleSetId` + `spaceName` via `useInviteUsersDialogQuery`, runs the email parser via the existing `emailParser`, paginates user search via `useContributors`, and submits via `useRoleSetApplicationsAndInvitations.inviteContributorsOnRoleSet`. This is exactly the connector pattern used by `CrdSpaceCommunityDialogConnector.tsx`.

**Alternatives considered**:

- **`src/main/crdPages/community/dialogs/`**: rejected — no such directory; would create a fragmented surface for one file. Community lives inside the Space domain in this codebase.
- **`src/domain/community/inviteContributors/crd/`**: rejected — would invert the layering (`src/domain/` should not import from `src/crd/`).

## R4: Result view rendering — same dialog or two dialogs?

**Decision**: Single `InviteMembersDialog` component with internal view state.

```tsx
const [view, setView] = useState<'form' | 'result'>('form');
```

- Result view is reached via `setView('result')` after the connector resolves the Send mutation and passes back `results: InvitationResult[]`.
- `Back` button (in result view) calls a prop `onBack()` that the connector wires to clear the `contributors` state and call `setView('form')`.
- `Close` button (in result view) calls the same `onClose` prop the form view uses.
- View resets to `'form'` whenever `open` transitions from `false → true` (i.e. on every reopen).

**Rationale**:

- The Radix `Dialog` primitive is happy to re-render its body. Mounting two separate `<Dialog>` components for the same conceptual interaction would force Radix to manage two independent focus traps and produce a flicker on transition.
- Header (title + close button) is shared across both views; the body and footer swap. This is the same pattern as `ShareDialog` (which has a `'default' | 'shareOnAlkemio'` view).
- View state is purely visual — fits the CRD rule that presentational components own only visual state.

**Alternatives considered**:

- **Two-dialog wrapper component**: rejected — duplicates focus management, complicates the consumer's `open` handling, and adds a transition gap.
- **Render result as a `<Sheet>` or `<Tooltip>`**: rejected — UX mismatch; result deserves the same modal weight as the form.

## R5: i18n namespace — reuse `crd-space` vs new `crd-community`

**Decision**: Create new `crd-community` namespace at `src/crd/i18n/community/community.<lang>.json` for all six supported languages and register it in `crdNamespaceImports` (`src/core/i18n/config.ts`).

**Rationale**:

- The dialog opens from two surfaces today: the Community tab on a Space page (currently uses `crd-space`) and the Community tab in Space Settings (currently uses `crd-spaceSettings`). Putting the strings into either namespace would force the OTHER consumer to load it as a second namespace anyway — no real saving.
- The CRD i18n architecture (`src/crd/CLAUDE.md` § Namespaces) prescribes per-feature namespaces. Community member management (invitations + future member-edit dialogs + member directory copy) is a coherent feature area worthy of its own namespace.
- The existing `crd-spaceSettings` namespace already hosts settings strings for the Community tab inside settings; adding invite copy there would tangle settings UI strings with member-management UI strings (different mental model, different eventual ownership).
- Future predictable additions: `members.role.*` labels, `application.dialog.*` strings (when the existing `ApplicationFormDialog` migrates), `removeMember.*` confirmation copy. All sit naturally in `crd-community`.

**Alternatives considered**:

- **`crd-space`**: rejected — `crd-space` is already a large namespace tracking Space-page content, callout types, and member directory copy. Adding invite/admin-adjacent strings further dilutes the namespace's purpose.
- **`crd-spaceSettings`**: rejected — strings would only co-locate with one of the two consumers; the Community tab on the public Space page would have to load `crd-spaceSettings` (a settings namespace) just for the invite dialog, which is conceptually wrong.
- **`crd-common`**: rejected — `crd-common` is for genuinely cross-feature copy (button labels, generic states). Invite copy is feature-specific.
- **No namespace, embed in component**: rejected — violates the i18n constitution rule (no hardcoded strings).

## Open questions / NEEDS CLARIFICATION

None remaining. All five decision points raised in the user input have a recorded outcome above.
