# Component Contracts — CRD Member Settings Dialog

This document specifies the public surface of every CRD component introduced or modified by this feature. Each contract enumerates the props received, the events emitted (as callbacks), the rendering invariants, and the accessibility requirements.

> The component contracts replace the more usual REST/GraphQL contracts because this feature ships only frontend code. No backend or schema changes.

---

## 1. `MemberSettingsDialog` (new)

**Path**: `src/crd/components/space/settings/MemberSettingsDialog.tsx`

**Type**: Presentational Radix Dialog wrapping a member identification chip, role/authorization checkboxes, an in-dialog Remove affordance, and an inline Cancel/Save footer.

### Props in

```ts
import type {
  MemberSettingsSubject,
} from '@/crd/components/space/settings/memberSettingsTypes';

type MemberSettingsLeadGate = {
  canAddLead: boolean;
  canRemoveLead: boolean;
};

type MemberSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: MemberSettingsSubject;
  leadGate: MemberSettingsLeadGate;

  // Callbacks (the consumer omits those the viewer cannot invoke; the dialog hides
  // the corresponding section automatically when the callback is `undefined`).
  onLeadChange: (id: string, isLead: boolean) => Promise<unknown>;
  onAdminChange?: (id: string, isAdmin: boolean) => Promise<unknown>;
  /** Outward removal trigger. The dialog calls this when the in-dialog Remove
   *  link is clicked; the consumer is responsible for opening the destructive
   *  confirmation surface and running the actual mutation. The dialog stays
   *  open underneath the confirmation prompt. */
  onRemoveMember?: (id: string) => void;
};
```

The dialog has **no `hideRemoveSection` prop** and **no `className` prop** in the shipped API. To suppress the Remove section, the consumer omits `onRemoveMember` (e.g., when `viewerId === subject.id`, per FR-016). Visual sizing is hard-coded internally to the standard `sm:max-w-2xl` width with `max-h-[90vh] overflow-y-auto`.

`MemberSettingsLeadGate` is exported by the component module itself; the broader `MemberSettingsSubject` lives in `memberSettingsTypes.ts`. There is no `MemberSettingsLeadPolicy` or `MemberSettingsCallbacks` type — the integration layer derives the per-subject `leadGate` from the role-set policy and passes the three callbacks directly.

### Events out

- `onOpenChange(false)` fires on X click, Esc key press, outside-click, Cancel button click, or after a successful Save. (Successful Remove is owned by the consumer's confirmation surface, which closes the dialog via `onOpenChange(false)` itself.)
- `onLeadChange(id, isLead)` fires from inside the Save handler when the local lead state diverges from `subject.isLead`.
- `onAdminChange(id, isAdmin)` fires from inside the Save handler when the local admin state diverges from `subject.isAdmin` (user-only).
- `onRemoveMember(id)` fires when the user clicks the in-dialog Remove link. The consumer opens the existing community confirmation surface (`pendingRemoval` + page-level `ConfirmationDialog`); the dialog does NOT mount its own confirmation prompt.

### Rendering invariants

- `Dialog` root is controlled (`open` from props); never self-mounts.
- `DialogContent` classes: `w-full sm:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col`.
- Header (`flex flex-row items-center justify-between gap-3 px-6 py-4 border-b`):
  - Left: `DialogTitle` rendering `t('community.memberSettings.title')`.
  - Right: `DialogClose` icon button with `lucide-react`'s `X`, `aria-label={t('community.memberSettings.close')}` (or reuse existing `t('common.close')` if already present).
- Body (`flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4`):
  1. **Member chip** — `Avatar` (size `h-10 w-10`, rounded, with `AvatarImage src={subject.avatarUrl}` and `AvatarFallback` initials derived from `subject.displayName`) followed by the display name and optional location text (city + country).
  2. **Role section** — `<h3>` titled `t('community.memberSettings.section.role')` using `text-label uppercase`; below it a `<Checkbox>` + `<Label>` pair labelled with a `<Trans>` over `community.memberSettings.lead`. Below the checkbox, a `<p>` with `text-caption text-muted-foreground` containing a `<Trans>` over `community.memberSettings.maxLeadsWarning`.
  3. **Authorization section** (only when `subject.type === 'user'` AND `onAdminChange` is provided) — `<h3>` titled `t('community.memberSettings.section.authorization')`; `<Checkbox>` + `<Label>` pair labelled with a `<Trans>` over `community.memberSettings.admin`.
  4. **Remove member section** (only when `onRemoveMember` is provided AND `hideRemoveSection !== true`) — `<h3>` titled `t('community.memberSettings.section.removeMember')`; below it a `<button type="button">` styled as a destructive-coloured link, containing a `Trash2` icon (`aria-hidden="true"`, `mr-2 size-4 text-destructive`) and the text `t('community.memberSettings.remove.link')`.
- Footer (`flex justify-end gap-2 px-6 py-4 border-t`):
  - `<Button variant="ghost">` for Cancel.
  - `<Button variant="default">` for Save (`aria-busy={saveInFlight}` while in flight).
- The lead checkbox's `disabled` value follows the rule defined in `data-model.md` (computed from `leadPolicy` and `subject.isLead`).
- All interactive controls (both checkboxes, both footer buttons, the in-dialog Remove link) are `disabled` when `saveInFlight === true` OR `removalInFlight === true`.

### Accessibility

- Dialog is labelled by `DialogTitle` (Radix default).
- Each checkbox is paired with a `<Label htmlFor={id}>` that wraps the `<Trans>` translation.
- The maxLeadsWarning paragraph has an `id` referenced by the lead checkbox via `aria-describedby` so screen readers announce the cap context.
- Trash icon is `aria-hidden="true"`; the destructive link's accessible name is its visible text.
- Focus is trapped while open; focus returns to the trigger element on close (Radix default).
- Tab order: Avatar/Name (read-only, skipped) → Lead checkbox → Admin checkbox (when present) → in-dialog Remove link (when present) → Cancel → Save → Close (X). The Close button can also be reached via Esc.

### Internal state

- See `data-model.md` § `MemberSettingsDialogState`. The dialog owns `isLead`, `isAdmin`, `saveInFlight`, `removalPromptOpen`, `removalInFlight`. State seeds from `subject` on open and resets on close.

---

## 2. `RemoveMemberAlertDialog` (new)

**Path**: `src/crd/components/space/settings/RemoveMemberAlertDialog.tsx`

**Type**: Presentational Radix AlertDialog wrapping the destructive removal confirmation. Rendered both from inside `MemberSettingsDialog` (when the in-dialog Remove link is clicked) and from `SpaceSettingsCommunityView` (when the `⋮` dropdown's "Remove from Space" item is activated).

### Props in

```ts
type RemoveMemberAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberDisplayName: string;
  memberFirstName?: string;     // falls back to `memberDisplayName` in the body when missing
  busy?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;        // optional; defaults to onOpenChange(false)
  className?: string;
};
```

### Events out

- `onOpenChange(false)` fires on Cancel click, Esc key press, or successful confirmation flow (consumer is responsible for closing on success).
- `onConfirm()` fires from the destructive Confirm button. Consumer awaits the underlying mutation; the component does not auto-close — it lets the consumer flip `open` to `false` after success.
- `onCancel()` fires from the Cancel button if provided; otherwise defaults to `onOpenChange(false)`.

### Rendering invariants

- `AlertDialog` root is controlled (`open` from props).
- `AlertDialogContent` classes match other CRD destructive prompts: `w-full sm:max-w-md`.
- Body:
  - `AlertDialogTitle` renders `t('community.memberSettings.remove.confirmTitle')`.
  - `AlertDialogDescription` renders `<Trans i18nKey="community.memberSettings.remove.confirmBody" values={{ member: memberDisplayName, memberFirstName: memberFirstName ?? memberDisplayName }} />`.
- Footer:
  - `AlertDialogCancel` rendering `t('community.memberSettings.remove.cancelCta')`. `disabled={busy}`.
  - `AlertDialogAction` rendering `t('community.memberSettings.remove.confirmCta')` with destructive styling (`variant="destructive"` if the underlying button supports it; otherwise inline destructive Tailwind classes). `aria-busy={busy}`, `disabled={busy}`.
- Outside-click and Esc dismiss are governed by Radix AlertDialog defaults (Esc cancels; outside-click is blocked unless overridden — keep blocked so the user must explicitly Confirm or Cancel).

### Accessibility

- Title labels the dialog; description provides the warning context.
- Both buttons are reachable in tab order; Confirm receives initial focus or remains on Cancel per Radix default (default focus on Cancel is acceptable for destructive prompts).

### Internal state

- None. Component is fully controlled.

---

## 3. `SpaceSettingsCommunityView` (modify existing)

**Path**: `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx`

**Type**: Existing presentational community settings tab. Modified to (a) add a "Change Role" dropdown item that opens `MemberSettingsDialog`, (b) reorder the dropdown to match the prototype, (c) drop the inline "Promote/demote lead" item, (d) replace the immediate-Remove flow with the AlertDialog confirmation surfaced via `RemoveMemberAlertDialog`.

### Props in (delta)

```ts
// Existing props remain. Added:
type SpaceSettingsCommunityViewPropsDelta = {
  /** Opens the Member settings dialog scoped to a member row. */
  onMemberChangeRole: (subject: MemberSettingsSubject) => void;

  /** Opens the Member settings dialog scoped to an organization row. */
  onOrgChangeRole: (subject: MemberSettingsSubject) => void;

  /** Triggers the Remove confirmation flow for a user (caller manages the AlertDialog open state). */
  onUserRemoveRequest: (subject: MemberSettingsSubject) => void;

  /** Triggers the Remove confirmation flow for an organization. */
  onOrgRemoveRequest: (subject: MemberSettingsSubject) => void;
};
```

The existing `onUserRemove(id: string)` and `onOrgRemove(id: string)` props are **renamed and re-typed** to `onUserRemoveRequest` and `onOrgRemoveRequest` taking the full `MemberSettingsSubject` (so the consumer has the data needed to populate the AlertDialog body). The previous `onUserLeadChange` / `onOrgLeadChange` row-level callbacks are **removed** from this view's surface — lead changes now flow through `MemberSettingsDialog`.

### Events out (delta)

- The `⋮` dropdown for each user row emits, in order:
  1. `<a href={m.url}>` — `t('community.members.dropdown.viewProfile')` (when `m.url` exists).
  2. `onClick={() => onMemberChangeRole(subject)}` — `t('community.members.dropdown.changeRole')` (gated by viewer's Roleset-Entry-Role-Assign privilege; integration layer omits the prop / disables the item when absent).
  3. `<DropdownMenuSeparator />`.
  4. `onClick={() => onUserRemoveRequest(subject)}` — `t('community.members.dropdown.removeFromSpace')`, destructive styling.
- The `⋮` dropdown for each organization row emits the same shape, replacing the user callbacks with the organization equivalents.

### Rendering invariants

- The dropdown order (View Profile → Change Role → separator → Remove from Space) matches the prototype (`prototype/src/app/components/space/SpaceSettingsCommunity.tsx:534-562`).
- Pending-state items (Approve / Reject) — if/when introduced for pending memberships in this same dropdown — are inserted between Change Role and the Remove separator, also matching the prototype. Out of scope for this feature; keys reserved.
- View Profile remains visible for any viewer; Change Role and Remove from Space are hidden when the corresponding `on*` prop is omitted (integration-layer privilege gating).

### Accessibility

- Dropdown trigger keeps its existing `aria-label={t('community.members.actions.menu')}` (or whatever existing key labels the trigger today).
- Destructive dropdown item uses both colour (`text-destructive focus:text-destructive`) and the trailing destructive verb in the visible label — never colour alone.

### Internal state

- No new internal state. The dialog and AlertDialog open states live in the consumer (see Component 4).

---

## 4. `CrdSpaceSettingsCommunityConnector` (modify existing) — integration layer

**Path**: `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` and `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts`

**Type**: Existing integration container. Modified to (a) own the `MemberSettingsDialog` and `RemoveMemberAlertDialog` open state, (b) provide the new `onMember/OrgChangeRole` and `onUser/OrgRemoveRequest` callbacks to `SpaceSettingsCommunityView`, (c) wire the dialog's `onLeadChange` / `onAdminChange` / `onRemoveMember` props through `useCommunityAdmin`.

### State held

```ts
const [activeMemberSettings, setActiveMemberSettings] = useState<ActiveMemberSettings>({ open: false });
const [activeRemoveConfirmation, setActiveRemoveConfirmation] = useState<ActiveRemoveConfirmation>({ open: false });
const { user: viewer } = useUserContext();   // existing hook reused
```

### New callbacks emitted to `SpaceSettingsCommunityView`

- `onMemberChangeRole = (subject) => setActiveMemberSettings({ open: true, subject })`
- `onOrgChangeRole = (subject) => setActiveMemberSettings({ open: true, subject })`
- `onUserRemoveRequest = (subject) => setActiveRemoveConfirmation({ open: true, subject, source: 'dropdown' })`
- `onOrgRemoveRequest = (subject) => setActiveRemoveConfirmation({ open: true, subject, source: 'dropdown' })`

### Mutation wiring

- `MemberSettingsDialog.onLeadChange` ← for users: `community.userAdmin.onLeadChange`; for orgs: `community.organizationAdmin.onLeadChange` (existing).
- `MemberSettingsDialog.onAdminChange` ← `community.userAdmin.onAdminChange` (NEW — integration adds it; mirrors `onLeadChange` but uses `RoleName.Admin`). Omitted for org subjects.
- `MemberSettingsDialog.onRemoveMember` ← opens `activeRemoveConfirmation` with `source: 'dialog'` (the actual mutation runs from the AlertDialog's onConfirm, see below). Omitted when `viewer.id === subject.id` (FR-016) — passing `hideRemoveSection={true}` is also acceptable; pick one and document.
- `RemoveMemberAlertDialog.onConfirm` ← for users: `community.userAdmin.onRemoveMember(subject.id)`; for orgs: `community.organizationAdmin.onRemoveMember(subject.id)`. On promise resolution, set `activeRemoveConfirmation={open:false}` AND if `source === 'dialog'`, also `setActiveMemberSettings({open:false})`.
- All callbacks toast on rejection via the existing `useNotification`-style platform toast (whatever the codebase uses today — `useCommunityAdmin` already does this; no new toast plumbing is added).

### Why this layer (not a new file under `src/crd/`)

CRD `CLAUDE.md` forbids Apollo / domain imports inside `src/crd/`. The dialog open/close orchestration touches `useCommunityAdmin` (which uses Apollo mutations), `useUserContext` (auth), and `useCommunityPolicyChecker` (domain) — all forbidden in CRD. Therefore the orchestration lives in the existing integration container.

---

## 5. Translation keys (new)

**Namespace**: `crd-spaceSettings`. **Files**: `src/crd/i18n/spaceSettings/spaceSettings.{en,nl,es,bg,de,fr}.json`.

See `data-model.md` § "Translation key inventory" for the full key tree.

**Crowdin scope check**: `src/crd/i18n/**/*.json` is **NOT** managed by Crowdin (per `src/crd/CLAUDE.md`). All six locale files are edited in this PR. Non-English locales MAY contain English placeholder values.

---

## Component diagram

```text
SpaceSettingsCommunityView (CRD)
├─ Members table
│   └─ ⋮ Dropdown (per row)
│       ├─ "View Profile"        → href navigation
│       ├─ "Change Role"         → onMemberChangeRole(subject)
│       └─ "Remove from Space"   → onUserRemoveRequest(subject)
│
└─ Organizations table
    └─ ⋮ Dropdown (per row)
        ├─ "View Profile"        → href navigation
        ├─ "Change Role"         → onOrgChangeRole(subject)
        └─ "Remove from Space"   → onOrgRemoveRequest(subject)

CrdSpaceSettingsPage (integration)
├─ <SpaceSettingsCommunityView ...wired callbacks />
│
├─ <MemberSettingsDialog
│     open={activeMemberSettings.open}
│     subject={activeMemberSettings.subject}
│     leadPolicy={leadPolicyFor(subject.type)}
│     onLeadChange={leadChangeFor(subject.type)}
│     onAdminChange={subject.type === 'user' ? userAdminChange : undefined}
│     onRemoveMember={openRemoveConfirmation('dialog', subject)}
│     hideRemoveSection={viewer?.id === subject.id}
│     onOpenChange={...}
│  />
│
└─ <RemoveMemberAlertDialog
      open={activeRemoveConfirmation.open}
      memberDisplayName={subject.displayName}
      memberFirstName={subject.type === 'user' ? subject.firstName : subject.displayName}
      busy={removeInFlight}
      onConfirm={() => runRemove(subject)}
      onOpenChange={(open) => setActiveRemoveConfirmation({ ..., open })}
   />
```

Both dialogs are rendered as siblings of the table, controlled by integration-layer state. The `RemoveMemberAlertDialog` is mounted exactly once and consumed from both Remove paths (dropdown and in-dialog), guaranteeing FR-008 / FR-Story-3 #3 / FR-Story-5 #3 are satisfied with a single confirmation surface.
