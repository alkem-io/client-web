# Component Contracts — CRD Space About Dialog

This document specifies the public surface of every CRD component introduced or modified by this feature. Each contract enumerates the props received, the events emitted (as callbacks), the rendering invariants, and the accessibility requirements.

> The component contracts replace the more usual REST/GraphQL contracts because this feature ships only frontend code. No backend or schema changes.

---

## 1. `SpaceAboutDialog` (new)

**Path**: `src/crd/components/space/SpaceAboutDialog.tsx`

**Type**: Presentational shadcn dialog wrapper around `SpaceAboutView`.

### Props in

```ts
type SpaceAboutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SpaceAboutData;

  joinSlot?: ReactNode;
  guidelinesSlot?: ReactNode;
  contactHostSlot?: ReactNode;
  lockTooltipSlot?: ReactNode;

  whyTitle?: string;
  whoTitle?: string;

  hasEditPrivilege?: boolean;
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;

  className?: string;
};
```

### Events out

- `onOpenChange(false)` fires on X click, Esc key press, or backdrop click.
- All `onEdit*` callbacks fire when the user clicks the corresponding section's edit pencil. Each is independent.

### Rendering invariants

- `DialogContent` has classes `w-full sm:max-w-4xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`.
- Header (sticky, `border-b`, `flex flex-row items-center justify-between gap-3 p-4`):
  - Left cluster: `lockTooltipSlot` (if provided) + `DialogTitle` (`data.name`) + `DialogDescription` (`data.tagline`).
  - Right: `DialogClose` button with lucide `X` icon, `aria-label={t('about.close')}`.
- Body: `flex-1 overflow-y-auto`, contains `<SpaceAboutView data={data} {...slots & callbacks & titles} className="px-6 py-6" />`.
- Never self-mounts; consumer fully controls `open` state.

### Accessibility

- `DialogTitle` and `DialogDescription` set semantic labelling for screen readers.
- Close button has explicit `aria-label`.
- Focus is trapped inside the dialog while `open === true` (Radix default).
- Esc closes (Radix default) → fires `onOpenChange(false)`.

---

## 2. `SpaceAboutView` (modified)

**Path**: `src/crd/components/space/SpaceAboutView.tsx`

**Type**: Presentational composite rendering the About content (description, metrics, why, who, leads, host, guidelines, references).

### Props in

```ts
type SpaceAboutViewProps = {
  data: SpaceAboutData;
  className?: string;

  joinSlot?: ReactNode;
  guidelinesSlot?: ReactNode;
  contactHostSlot?: ReactNode;

  whyTitle?: string;
  whoTitle?: string;

  hasEditPrivilege?: boolean;
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;
};
```

### Events out

- Only the `onEdit*` callbacks. No internal navigation.

### Rendering invariants

- Sections render in order: Description, Location, Metrics, Separator, Why, Who, Leads block, Host block (right column variant), Guidelines slot, References, Host block (bottom variant).
- **Host position rule**:
  - `hasLeads = data.leadUsers.length > 0 || data.leadOrganizations.length > 0`
  - If `hasLeads`: leads render in the leads section; host renders **below references** with `contactHostSlot` attached.
  - If `!hasLeads`: host renders **in place of the leads section** with `contactHostSlot` attached; no separate bottom block.
- Section title icons (lucide):
  - Why: `Flag`
  - Who: `Users`
  - References: `ExternalLink` (existing)
  - (No icon on Metrics, Description, Location.)
- Section titles `t('about.why')` / `t('about.who')` are overridden by `whyTitle` / `whoTitle` when provided.
- Edit pencil renders next to a section title only when both `hasEditPrivilege === true` AND the corresponding `onEdit*` is defined. Pencil is a shadcn ghost button with lucide `Pencil` icon, `aria-label={t('about.edit')}`.
- The `joinSlot`, `guidelinesSlot`, `contactHostSlot` are rendered as-is — the view does not re-style them.

### Accessibility

- All section headings render as `<h2>`.
- All edit pencils have explicit `aria-label`.
- Decorative section icons have `aria-hidden="true"`.

---

## 3. `SpaceAboutApplyButton` (new)

**Path**: `src/crd/components/space/SpaceAboutApplyButton.tsx`

**Type**: Presentational state-driven button + helper text composite.

### Props in

See [data-model.md § 3](../data-model.md#3-spaceaboutapplybutton--new-srccrdcomponentsspacespaceaboutapplybuttontsx).

### Events out

- One of `onLoginClick`, `onApplyClick`, `onJoinClick`, `onAcceptInvitationClick`, `onApplyParentClick`, `onJoinParentClick` fires on click, depending on the current state branch.
- No callback fires when the button is disabled.

### Rendering invariants

- Single shadcn `Button` (full width, `w-full`) plus optional `<p className="text-xs text-muted-foreground mt-2">` helper text below it.
- Helper text only renders when `!isAuthenticated`, with body `t('about.signInHelper')`.
- Label, variant, disabled state derived per the [state machine table](../data-model.md#3-spaceaboutapplybutton--new-srccrdcomponentsspacespaceaboutapplybuttontsx).
- `loading === true` overrides label to a lucide `Loader2` (animated spin) icon.
- Button forwards a ref via the `ref` prop so the lock-tooltip "Learn how to apply" link can call `.click()`.

### Accessibility

- Button has visible focus ring.
- When disabled, `aria-disabled="true"` and `disabled` are both set.
- When `loading`, `aria-busy="true"`.

---

## 4. `CommunityGuidelinesBlock` (new)

**Path**: `src/crd/components/space/CommunityGuidelinesBlock.tsx`

**Type**: Presentational composite that renders truncated guidelines with a nested "Read more" dialog.

### Props in

See [data-model.md § 4](../data-model.md#4-communityguidelinesblock--new-srccrdcomponentsspacecommunityguidelinesblocktsx).

### Events out

- `onEditClick()` fires when the edit pencil is clicked (only rendered if `canEdit && onEditClick`).
- No other events emitted upward; the "Read more" nested dialog open/close is managed internally.

### Rendering invariants

- Header row: lucide `Shield` icon + `displayName` (or `t('about.guidelines')` fallback) + edit pencil (if applicable).
- When `description` is non-empty: `MarkdownContent` body, truncated via `[mask-image:linear-gradient(to_bottom,black_60%,transparent)]` Tailwind, height-limited; "Read more" `Button` (variant `link` or `ghost` with text styling) below.
- When `description` is empty AND `canEdit === true`: render `<p className="text-sm text-muted-foreground">{t('about.guidelinesAdminsOnly')}</p>` plus edit pencil.
- When `description` is empty AND `canEdit === false`: render nothing (component returns `null`).
- "Read more" opens a nested `Dialog` whose `DialogContent` contains: `DialogTitle` = `displayName`, full `MarkdownContent`, references list (if any) — each reference is an `<a target="_blank" rel="noopener noreferrer">` styled like the existing CRD reference items.

### Accessibility

- Nested dialog has its own `DialogTitle` for screen reader announcement.
- "Read more" button has accessible name (`t('about.readMore')`).
- External-link references include `<ExternalLink aria-hidden="true">` icon and explicit `rel="noopener noreferrer"`.

---

## 5. `ApplicationFormDialog` (new)

**Path**: `src/crd/components/community/ApplicationFormDialog.tsx`

**Type**: Presentational form dialog for submitting an application or confirming a join.

### Props in

See [data-model.md § 5](../data-model.md#5-applicationformdialog--new-srccrdcomponentscommunityapplicationformdialogtsx).

### Events out

- `onOpenChange(false)` on close (X / Esc / backdrop / Cancel button).
- `onSubmit(answers)` when the submit button is clicked AND form is valid.

### Rendering invariants

- `DialogContent` wide enough for form (`sm:max-w-2xl max-h-[85vh] flex flex-col`).
- Header: title (`mode === 'apply'` → `t('apply.applyTitle', { name: communityName })`; `mode === 'join'` → `t('apply.joinTitle', { name: communityName })`).
- Body (scrollable): subheader (`mode === 'apply' && formDescription` → markdown via `MarkdownContent`; else `t('apply.subheader')` or `t('apply.subheaderJoin')`), then one labelled `<textarea>` per question, then optional guidelines block (display name + markdown + references).
- Each `<textarea>` is associated with its `<label>` via `htmlFor`/`id`.
- Submit button label: `mode === 'apply'` → `t('apply.apply')`, `mode === 'join'` → `t('apply.join')`.
- Submit button disabled when `submitting || !isValid`.
- When `submitting === true`, button label switches to `t('apply.processing')` and `aria-busy="true"`.
- Field error text rendering follows the [validation visibility rules](../data-model.md#5-applicationformdialog--new-srccrdcomponentscommunityapplicationformdialogtsx).

### Accessibility

- Each textarea has a persistent `<label>` (not just placeholder).
- Required fields have `aria-required="true"` and the visual asterisk.
- Error messages are wired with `aria-describedby` and `role="alert"`.
- Focus moves to first invalid field on failed submit attempt.

---

## 6. `ApplicationSubmittedDialog` (new)

**Path**: `src/crd/components/community/ApplicationSubmittedDialog.tsx`

### Props in

See [data-model.md § 6](../data-model.md#6-applicationsubmitteddialog--new-srccrdcomponentscommunityapplicationsubmitteddialogtsx).

### Events out

- `onOpenChange(false)` on Close button click, X, Esc, backdrop.

### Rendering invariants

- Compact `DialogContent` (`sm:max-w-md`).
- Title: `t('apply.submitted.title')`.
- Body: `t('apply.submitted.body', { communityName })`.
- Single button: `t('about.close')`, primary variant.

### Accessibility

- Standard Radix dialog accessibility.

---

## 7. `PreApplicationDialog` (new)

**Path**: `src/crd/components/community/PreApplicationDialog.tsx`

### Props in

See [data-model.md § 7](../data-model.md#7-preapplicationdialog--new-srccrdcomponentscommunitypreapplicationdialogtsx).

### Events out

- `onOpenChange(false)` on close.
- The CTA is an `<a href>` link, not a callback — navigation is browser-native.

### Rendering invariants

- Compact `DialogContent` (`sm:max-w-md`).
- Title: `<Trans i18nKey={`components.application-button.${dialogVariant}.title`} values={{ parentCommunityName }} components={{ strong: <strong /> }} />`
- Body: `<Trans i18nKey={`components.application-button.${dialogVariant}.body`} values={{ spaceName: parentCommunityName, subspaceName }} components={{ strong: <strong /> }} />`
- Footer: single CTA `<a>` styled as primary `Button` whose `href` is `applyUrl` if `isApplicationPending(parentApplicationState)` else `parentApplyUrl`. Label: `t('buttons.apply')` if pending else `t(`components.application-button.goTo${parentCommunitySpaceLevel === 'L0' ? 'Space' : 'Subspace'}`)`.

### Accessibility

- CTA is a real `<a>` element so keyboard / screen reader access is native.
- Dialog has standard Radix accessibility.

---

## 8. `PreJoinParentDialog` (new)

**Path**: `src/crd/components/community/PreJoinParentDialog.tsx`

### Props in

See [data-model.md § 8](../data-model.md#8-prejoinparentdialog--new-srccrdcomponentscommunityprejoinparentdialogtsx).

### Events out

- `onOpenChange(false)` on close.
- CTA is `<a href>`.

### Rendering invariants

- Same shape as `PreApplicationDialog` but uses `components.application-button.dialog-join-parent.title|body` keys. CTA href is `parentApplyUrl`. CTA label is `t(`components.application-button.goTo${...}`)`.

---

## 9. Reused — `InvitationDetailDialog`

**Path**: `src/crd/components/dashboard/InvitationDetailDialog.tsx`

**Status**: Reused without changes. See its existing JSDoc and the `InvitationDetailContainer` usage in `src/main/crdPages/dashboard/CrdPendingMembershipsDialog.tsx:89-187` for wiring reference.

---

## Integration-layer connectors (in `src/main/crdPages/space/about/`)

These are not CRD components and may use GraphQL hooks freely. They are listed here for completeness of the contract surface.

### `CrdSpaceAboutPage` (rewrite)

- Calls `useSpace`, `useSpaceAboutDetailsQuery`, `useApplicationButton`, `useCommunityGuidelinesQuery`, `useCurrentUserContext`, `useDirectMessageDialog`, `useBackWithDefaultUrl`, `useNavigate`.
- Manages `useState` flags: `isApplyDialogOpen`, `isInvitationDialogOpen`, `isPreAppDialogOpen`, `isPreJoinDialogOpen`, `isSubmittedDialogOpen`.
- Holds `applyButtonRef` for the lock-tooltip "Learn how to apply" link.
- Maps GraphQL `about` to `SpaceAboutData`; maps `about.provider` and `about.membership.lead*` to `SpaceLeadData[]`.
- Renders `<SpaceAboutDialog>`, the four CRD flow connectors (`ApplyDialogConnector`, `ApplicationSubmittedDialog`, `InvitationDetailConnector`, `PreApplicationDialog`, `PreJoinParentDialog`), and the reused MUI `directMessageDialog`. Wraps everything in `<StorageConfigContextProvider locationType="space" spaceId={space.id}>`.

### `ApplyDialogConnector` (new)

- Calls `useApplicationDialogQuery({ variables: { spaceId }, skip: !open || canJoinCommunity })` and `useApplyForEntryRoleOnRoleSetMutation`.
- Maps GraphQL response to `ApplicationFormDialog` props (`questions`, `formDescription`, `guidelines`, `communityName`).
- Resolves `mode` from `canJoinCommunity` flag.
- On submit success, calls `onApplied()` and `onOpenChange(false)`.
- On submit failure, surfaces error via the platform's notification mechanism and keeps the dialog open.

### `InvitationDetailConnector` (new)

- Calls `useInvitationActions` and `useInvitationHydrator(invitation, { withCommunityGuidelines: true })`.
- Maps hydrated invitation to `InvitationDetailDialog` props following the existing dashboard `InvitationDetailContainer` pattern.
- On accept/reject, calls `onOpenChange(false)`.

---

## Cross-cutting requirements (apply to all components above)

| Requirement | Source |
|---|---|
| No `@mui/*` or `@emotion/*` imports anywhere in `src/crd/components/space/SpaceAbout*`, `src/crd/components/space/CommunityGuidelinesBlock.tsx`, or `src/crd/components/community/`. | Constitution Arch 2 + spec FR-001 |
| All user-visible strings via `useTranslation('crd-space')` or the default `useTranslation()` for reused main-translation keys. No hardcoded English in JSX. | Spec FR-019, Constitution Arch 3 |
| WCAG 2.1 AA: focus-visible rings, semantic interactive elements, decorative icons hidden from AT, keyboard operability. | Spec FR-020, FR-021, Constitution V |
| Mobile responsive (≥ 360 px viewport): content scrolls inside dialogs; no overlapping controls. | Spec FR-022, SC-010 |
| All event handlers received as props; CRD components never call `useNavigate`, never mutate global state, never call `i18n.changeLanguage`. | Constitution IV + `src/crd/CLAUDE.md` Rule 3 |
| Props are plain TypeScript types; never GraphQL generated types. | Constitution III + `src/crd/CLAUDE.md` Rule 4 |
