# Phase 1 — Data Model

**Feature**: CRD Space About Dialog
**Branch**: `087-crd-space-about-dialog`

This document defines the **plain TypeScript prop types** consumed by the new and modified CRD components. These types live inside the component files themselves (no separate types module). The integration layer in `src/main/crdPages/space/about/` is responsible for mapping GraphQL types to these plain types.

> No backend / persistence schema changes. All data flows through existing GraphQL queries.

---

## Shared base types (re-used across CRD About components)

These are **not** GraphQL types — they are presentation-layer DTOs.

### `SpaceLeadData` (already defined in `SpaceAboutView.tsx`, kept)

```ts
type SpaceLeadData = {
  name: string;
  avatarUrl?: string;
  type: 'person' | 'organization';
  location?: string;
  href: string;
};
```

### `CalloutReference` (already defined in `SpaceAboutView.tsx`, kept)

```ts
type CalloutReference = {
  name: string;
  uri: string;
  description?: string;
};
```

### `SpaceAboutData` (modified — extends current shape)

```ts
type SpaceAboutData = {
  name: string;
  tagline?: string;
  description?: string;
  location?: string;
  metrics: Array<{ name: string; value: string }>;
  who?: string;
  why?: string;
  provider?: SpaceLeadData;
  leadUsers: SpaceLeadData[];
  leadOrganizations: SpaceLeadData[];
  references: CalloutReference[];
  // NOTE: `guidelines` removed from this shape; the integration layer now injects
  // a fully-hydrated CommunityGuidelinesBlock via the `guidelinesSlot` prop on
  // SpaceAboutDialog/SpaceAboutView.
};
```

### `ApplicationQuestion`

```ts
type ApplicationQuestion = {
  question: string;        // also used as the field key
  required: boolean;
  maxLength: number;
  sortOrder?: number;      // defaults to 0
};
```

### `ApplicationAnswer`

```ts
type ApplicationAnswer = {
  name: string;            // = question text
  value: string;
  sortOrder: number;
};
```

### `GuidelinesData`

```ts
type GuidelinesData = {
  displayName?: string;
  description?: string;    // markdown
  references?: CalloutReference[];
};
```

---

## Component prop types

### 1. `SpaceAboutDialog` — new, `src/crd/components/space/SpaceAboutDialog.tsx`

```ts
type SpaceAboutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SpaceAboutData;

  // Slots injected by the integration layer
  joinSlot?: ReactNode;          // CRD apply button composite
  guidelinesSlot?: ReactNode;    // CommunityGuidelinesBlock (hydrated)
  contactHostSlot?: ReactNode;   // Contact-host link/button
  lockTooltipSlot?: ReactNode;   // Lock icon + tooltip with "Learn how to apply" link

  // Section title overrides (level-aware copy)
  whyTitle?: string;
  whoTitle?: string;

  // Edit affordance gating + per-section callbacks
  hasEditPrivilege?: boolean;
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;

  className?: string;
};
```

**Validation rules**:

- `open` is required; the dialog never self-mounts.
- `onOpenChange(false)` must be wired by the integration layer (typically calls `useBackWithDefaultUrl` for navigation back).
- All slot props are optional; missing slots simply omit those affordances.
- `whyTitle` / `whoTitle` override the default `t('about.why')` / `t('about.who')` strings inside the embedded `SpaceAboutView`.

---

### 2. `SpaceAboutView` — modified, `src/crd/components/space/SpaceAboutView.tsx`

```ts
type SpaceAboutViewProps = {
  data: SpaceAboutData;
  className?: string;

  // Slots
  joinSlot?: ReactNode;          // existing prop, formerly named `joinAction`
  guidelinesSlot?: ReactNode;    // NEW
  contactHostSlot?: ReactNode;   // NEW

  // Level-aware overrides
  whyTitle?: string;             // NEW
  whoTitle?: string;             // NEW

  // Edit affordances (require hasEditPrivilege === true to render)
  hasEditPrivilege?: boolean;    // NEW
  onEditDescription?: () => void;// NEW
  onEditWhy?: () => void;        // NEW
  onEditWho?: () => void;        // NEW
  onEditReferences?: () => void; // NEW
};
```

**State transitions / rendering rules**:

- Host position is derived from `data.leadUsers.length` and `data.leadOrganizations.length`:
  - If either list is non-empty → leads render in the right column; the host (`data.provider`) renders **after the references section**.
  - If both lists are empty → the host renders in the right column where leads would go, with the `contactHostSlot` immediately attached.
- Edit pencils render only when `hasEditPrivilege && onEdit*` for the corresponding section.
- Section title icons (lucide): `Flag` next to Why title, `Users` next to Who title, `Shield` next to Guidelines (when shown), `ExternalLink` next to References (existing).

---

### 3. `SpaceAboutApplyButton` — new, `src/crd/components/space/SpaceAboutApplyButton.tsx`

```ts
type SpaceAboutApplyButtonProps = {
  // Snapshot of current membership state — flat shape mirrors ApplicationButtonProps
  isAuthenticated: boolean;
  isMember: boolean;
  isParentMember: boolean;
  applicationState?: string;      // 'new' | 'approved' | 'rejected' | 'archived' | undefined
  userInvitation?: { id: string };  // truthy → can accept
  parentApplicationState?: string;
  canJoinCommunity: boolean;
  canAcceptInvitation: boolean;
  canApplyToCommunity: boolean;
  canJoinParentCommunity: boolean;
  canApplyToParentCommunity: boolean;
  loading: boolean;

  // Callbacks — the integration layer decides what each branch opens
  onLoginClick?: () => void;
  onApplyClick?: () => void;
  onJoinClick?: () => void;
  onAcceptInvitationClick?: () => void;
  onApplyParentClick?: () => void;
  onJoinParentClick?: () => void;

  // ref forwarded — used by the dialog header's "Learn how to apply" link
  ref?: Ref<HTMLButtonElement>;

  className?: string;
};
```

**State machine** (derived from `ApplicationButton.tsx:107-244`):

| Condition (in order) | Label | Variant | Disabled | Click handler |
|---|---|---|---|---|
| `loading` | spinner | primary | yes | — |
| `!isAuthenticated` | `t('about.signIn')` + helper | primary | no | `onLoginClick` |
| `isMember` | `t('about.member')` | outline | yes | — |
| `canAcceptInvitation` | `t('about.acceptInvitation')` | primary | no | `onAcceptInvitationClick` |
| `canJoinCommunity` | `t('about.join')` | primary | no | `onJoinClick` |
| `applicationState && isApplicationPending(applicationState)` | `t('about.applyPending')` | outline | yes | — |
| `canApplyToCommunity` | `t('about.apply')` | primary | no | `onApplyClick` |
| `isParentMember` | `t('about.applyDisabled')` | outline | yes | — |
| `parentApplicationState && isApplicationPending(parentApplicationState)` | `t('about.parentPending')` | outline | yes | — |
| `canJoinParentCommunity` | `t('about.join')` | primary | no | `onJoinParentClick` |
| `canApplyToParentCommunity` | `t('about.apply')` | primary | no | `onApplyParentClick` |
| (fallback) | `t('about.applyDisabled')` | outline | yes | — |

When `!isAuthenticated`, also renders helper text below the button using `t('about.signInHelper')`.

---

### 4. `CommunityGuidelinesBlock` — new, `src/crd/components/space/CommunityGuidelinesBlock.tsx`

```ts
type CommunityGuidelinesBlockProps = {
  displayName?: string;
  description?: string;          // markdown
  references?: CalloutReference[];
  loading?: boolean;
  canEdit?: boolean;
  onEditClick?: () => void;
  className?: string;
};
```

**Rendering rules**:

- When `description` and `references` are both empty AND `canEdit === false` → render nothing (parent omits the section).
- When empty AND `canEdit === true` → render header + "admins only" caption + edit pencil.
- When `description` is non-empty → render header (icon + title + edit pencil if `canEdit`), markdown body via `MarkdownContent` truncated with `[mask-image:linear-gradient(to_bottom,black_60%,transparent)]`, and a "Read more" `Button`.
- "Read more" opens a nested shadcn `Dialog` containing the full description and a list of references (each rendered as `<a target="_blank" rel="noopener noreferrer">` with the existing reference icon styling).

---

### 5. `ApplicationFormDialog` — new, `src/crd/components/community/ApplicationFormDialog.tsx`

```ts
type ApplicationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Display
  communityName?: string;        // used in title interpolation
  formDescription?: string;      // markdown subheader (apply mode only)
  questions: ApplicationQuestion[];
  guidelines?: GuidelinesData;   // optional — rendered below the form

  // Mode + submission
  mode: 'apply' | 'join';        // drives title, subtitle, submit label
  submitting: boolean;
  onSubmit: (answers: ApplicationAnswer[]) => void;

  className?: string;
};
```

**State held internally**: per-question answer string, per-question "touched" flag, "submit attempted" flag. No GraphQL.

**Validation**: `yup.object().shape({ [question]: required ? yup.string().required().max(maxLength) : yup.string().max(maxLength), ... })`.

**Field error visibility rules** (from spec FR-008 clarification):

- Submit button disabled while form is invalid.
- Per-field error text appears only after either the user has clicked submit at least once, or the user has blurred that question with invalid content.

**Submit behavior**:

- `mode === 'join'`: builds an empty answers array, calls `onSubmit([])`.
- `mode === 'apply'`: builds answers from question state with sortOrder defaults; calls `onSubmit(answers)`.
- The dialog does **not** close itself on submit. The integration layer closes via `onOpenChange(false)` after the GraphQL mutation resolves successfully (and opens the submitted-confirmation dialog). On failure, the dialog stays open so the user can retry.

---

### 6. `ApplicationSubmittedDialog` — new, `src/crd/components/community/ApplicationSubmittedDialog.tsx`

```ts
type ApplicationSubmittedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityName?: string;
  className?: string;
};
```

Single Close button (`onClick → onOpenChange(false)`). Renders `t('apply.submitted.title')` and `t('apply.submitted.body', { communityName })`.

---

### 7. `PreApplicationDialog` — new, `src/crd/components/community/PreApplicationDialog.tsx`

```ts
type PreApplicationDialogVariant = 'dialog-parent-app-pending' | 'dialog-apply-parent';

type PreApplicationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogVariant: PreApplicationDialogVariant;
  parentCommunitySpaceLevel?: 'L0' | 'L1' | 'L2';
  parentCommunityName?: string;
  subspaceName?: string;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
  className?: string;
};
```

**Behavior**: shadcn `Dialog`; title and body via `<Trans i18nKey="...">` using existing main-translation keys `components.application-button.dialog-parent-app-pending.title|body` or `components.application-button.dialog-apply-parent.title|body`. CTA is an `<a href>` button whose target is `applyUrl` if `isApplicationPending(parentApplicationState)` else `parentApplyUrl`. Button label uses `components.application-button.goToSpace` or `goToSubspace` based on `parentCommunitySpaceLevel`.

---

### 8. `PreJoinParentDialog` — new, `src/crd/components/community/PreJoinParentDialog.tsx`

```ts
type PreJoinParentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentCommunityName?: string;
  parentCommunitySpaceLevel?: 'L0' | 'L1' | 'L2';
  subspaceName?: string;
  parentApplyUrl?: string;
  className?: string;
};
```

Behavior mirrors `PreApplicationDialog` but for the join-parent prompt; uses keys `components.application-button.dialog-join-parent.*` (existing).

---

## Integration-layer (non-CRD) types

### `CrdSpaceAboutPage` — internal types only

```ts
// Local helper for mapping GraphQL provider/lead → SpaceLeadData
function mapPersonOrOrgToLead(
  entity: { id: string; profile: { displayName: string; avatar?: { uri?: string }; location?: { city?: string; country?: string }; url: string; type?: ProfileType } },
  type: 'person' | 'organization'
): SpaceLeadData;

// Local helper that derives PreApplication / PreJoinParent props from applicationButtonProps
function preAppPropsFromButtonProps(p: ApplicationButtonProps): Pick<PreApplicationDialogProps, 'parentCommunitySpaceLevel' | 'parentCommunityName' | 'subspaceName' | 'parentApplicationState' | 'applyUrl' | 'parentApplyUrl'>;
function preJoinPropsFromButtonProps(p: ApplicationButtonProps): Pick<PreJoinParentDialogProps, 'parentCommunitySpaceLevel' | 'parentCommunityName' | 'subspaceName' | 'parentApplyUrl'>;
```

### `ApplyDialogConnector` — props

```ts
type ApplyDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  canJoinCommunity: boolean;
  onJoin: () => void;            // forwarded to applicationButtonProps.onJoin
  onApplied: () => void;         // called after successful apply submission → opens ApplicationSubmittedDialog
};
```

Internally calls `useApplicationDialogQuery({ variables: { spaceId }, skip: !open || canJoinCommunity })` to fetch questions, form description, and community guidelines. Calls `useApplyForEntryRoleOnRoleSetMutation`. Maps GraphQL result to `ApplicationFormDialog` props.

### `InvitationDetailConnector` — props

```ts
type InvitationDetailConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation?: PendingInvitationItem;  // from useApplicationButton's userInvitation
};
```

Internally calls `useInvitationActions` and `useInvitationHydrator(invitation, { withCommunityGuidelines: true })`, mapping outputs to `InvitationDetailDialog` props the same way `CrdPendingMembershipsDialog`'s `InvitationDetailContainer` does (lines 89-187).

---

## Translation keys (new additions to `crd-space` namespace)

```json
{
  "about": {
    "close": "Close",
    "edit": "Edit",
    "readMore": "Read more",
    "lockTooltip": "You don't have access to this space.",
    "learnWhy": "Learn how to apply",
    "hostTooltip": "The host organization or person responsible for this space.",
    "contactHost": "Contact host",
    "apply": "Apply",
    "join": "Join",
    "member": "Member",
    "applyPending": "Application pending",
    "parentPending": "Parent application pending",
    "applyDisabled": "Apply not available",
    "acceptInvitation": "Accept invitation",
    "signIn": "Sign in to apply",
    "signInHelper": "You'll be redirected to sign in to Alkemio first.",
    "context": {
      "L0": { "why": "Why are we here?", "who": "Who is involved?" },
      "L1": { "why": "Why this subspace?", "who": "Who is involved?" },
      "L2": { "why": "Why this subspace?", "who": "Who is involved?" }
    }
  },
  "apply": {
    "apply": "Apply",
    "join": "Join",
    "processing": "Processing…",
    "applyTitle": "Apply to {{name}}",
    "joinTitle": "Join {{name}}",
    "subheader": "Tell us a bit about why you want to join.",
    "subheaderJoin": "You're about to join {{name}}.",
    "submitted": {
      "title": "Application submitted",
      "body": "Your application to {{communityName}} has been submitted."
    }
  }
}
```

Mirror to `space.nl.json`, `space.es.json`, `space.bg.json`, `space.de.json`, `space.fr.json` (English values acceptable as placeholders until translated, consistent with current `about.*` block convention).

For the four flow dialogs, copy is reused from existing `translation` namespace keys (do not duplicate):

- `components.application-button.dialog-parent-app-pending.title|body`
- `components.application-button.dialog-apply-parent.title|body`
- `components.application-button.dialog-join-parent.title|body`
- `components.application-button.goToSpace|goToSubspace`
- `pages.space.application.applyTitle|joinTitle|subheader|subheaderJoin`
- `aboutDialog.applyNotSignedInHelperText` (alias for the new `about.signInHelper`)

When the legacy MUI dialog is removed in a future iteration, the duplicated `apply.*` and `about.signInHelper` keys can be migrated entirely to the `crd-space` namespace and the legacy keys removed.
