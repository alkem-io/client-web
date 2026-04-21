# Phase 0 — Research & Decisions

**Feature**: CRD Space About Dialog
**Branch**: `087-crd-space-about-dialog`
**Date**: 2026-04-16

This document records the decisions reached during exploration and clarification, with their rationales and rejected alternatives. There are no remaining `NEEDS CLARIFICATION` items.

---

## Decision 1 — Reuse the existing partial CRD About view as the body, and wrap it in a new shadcn dialog

- **Decision**: Keep `src/crd/components/space/SpaceAboutView.tsx` as a presentational view component. Create a sibling `SpaceAboutDialog.tsx` that wraps the view in a shadcn `Dialog` from `src/crd/primitives/dialog.tsx`. The view receives slots and edit callbacks; the dialog provides chrome, focus management, sticky header with title/tagline/close, and an optional lock-tooltip slot.
- **Rationale**: Separation of concerns — the view can be embedded anywhere (future inline-About usage, standalone preview app); the dialog only owns chrome. Mirrors the precedent set by `src/crd/components/callout/CalloutDetailDialog.tsx` which similarly wraps a content composite with sticky header / scrollable body / sticky footer.
- **Alternatives considered**:
  - *Inline the dialog chrome inside `SpaceAboutView.tsx`* — rejected because it forces every consumer of the content to also adopt dialog presentation; conflicts with SRP (Constitution Arch 6a).
  - *Replace `SpaceAboutView` with a single `SpaceAboutDialog`* — rejected because the standalone `app/` preview can render the view without a portal; keeping them separate preserves that.

## Decision 2 — Build full CRD versions of the four MUI flow dialogs (Apply, Submitted, PreApplication, PreJoinParent), reuse the existing CRD `InvitationDetailDialog` for invitation acceptance

- **Decision**: New CRD components under `src/crd/components/community/` for `ApplicationFormDialog`, `ApplicationSubmittedDialog`, `PreApplicationDialog`, `PreJoinParentDialog`. Reuse `src/crd/components/dashboard/InvitationDetailDialog.tsx` as-is for the "accept invitation" branch.
- **Rationale**: User explicitly chose this scope. `InvitationDetailDialog` already exists and already handles the join-via-invitation acceptance flow used by the dashboard's `CrdPendingMembershipsDialog`; it is the natural CRD home for this branch. The other four MUI dialogs have no CRD equivalent — building them now keeps the apply/join flow fully MUI-free for CRD users.
- **Alternatives considered**:
  - *Reuse the four MUI flow dialogs by rendering them in portals from the integration layer* (same pattern as DirectMessageDialog) — rejected per user decision: would leave most of the apply funnel MUI-rendered and undermine the CRD parity goal.
  - *Build only an `Apply` CRD dialog and skip the parent / submitted / PreJoin variants* — rejected: parent-Space prompts are required for subspace flows, and the submitted confirmation is the spec's success path (FR-008). Skipping them creates UX dead-ends.

## Decision 3 — Reuse the MUI `DirectMessageDialog` (via `useDirectMessageDialog`) from the CRD integration layer for "Contact host"

- **Decision**: The integration container `CrdSpaceAboutPage.tsx` calls `useDirectMessageDialog({ dialogTitle: ... })` and renders the returned `directMessageDialog` ReactNode in the same JSX tree as the CRD dialog. The CRD dialog itself only receives an `onContactHost` callback prop (or pre-rendered link slot) — it does not import MUI.
- **Rationale**: A CRD messaging dialog does not yet exist; building one is a separate, multi-week migration. The MUI dialog renders in a portal outside `.crd-root`, so its styling does not leak into the CRD surface. This is the same pattern `CrdLayoutWrapper` uses today for the global messaging and notifications dialogs. Documented as the single permitted MUI element in the integration layer (Plan § Complexity Tracking).
- **Alternatives considered**:
  - *Build a CRD `DirectMessageDialog` now* — rejected: out of scope, would expand this feature significantly. Tracked as future work.
  - *Skip Contact host entirely in v1* — rejected by user during clarification: this is a visible, frequently-used feature, and skipping it would be a regression.

## Decision 4 — State-driven CRD apply button as a single composite, not a wrapper around the MUI button

- **Decision**: New `src/crd/components/space/SpaceAboutApplyButton.tsx` accepts a flat props type modelled on `ApplicationButtonProps` from `src/domain/community/applicationButton/ApplicationButton.tsx:40-65`. The state machine (which label, which variant, which callback to fire) is ported verbatim from `ApplicationButton.tsx:107-244`. The button forwards a ref so the dialog header's "Learn how to apply" link in the lock tooltip can programmatically click the button (mirrors MUI behavior at `SpaceAboutDialog.tsx:108-112, 192-203`).
- **Rationale**: The integration container already calls `useApplicationButton` and has `applicationButtonProps` in hand; a CRD button can consume the same props without coupling to MUI. Keeping the state machine inside the button (not split across the consumer) means future consumers of this button get the same behavior for free — SOLID/SRP (Constitution Arch 6a).
- **Alternatives considered**:
  - *Render the MUI `ApplicationButton` from the integration layer* — rejected: the MUI button itself owns four MUI flow dialogs, which would force MUI into the apply path and undermine the CRD goal.
  - *Split the state machine across the integration container with multiple smaller CRD buttons* — rejected: duplicates branching logic, harder to keep parity with the source.

## Decision 5 — Mutation-failure surfacing via the platform's existing toast/notification mechanism

- **Decision**: When apply, join, invitation accept/reject, or contact-host mutations fail, the existing notification system surfaces the error. The originating flow dialog stays open so the user can retry without re-entering data.
- **Rationale**: Existing platform pattern (used by other mutations across the app); requires no new UI; matches what the legacy MUI version does.
- **Alternatives considered**:
  - *Inline error banner inside the flow dialog* — rejected: more work, inconsistent with platform pattern.
  - *Toast + auto-close dialog* — rejected: forces users to re-enter form data.

## Decision 6 — Subspace About continues to render the legacy MUI dialog when the CRD toggle is on

- **Decision**: With `alkemio-crd-enabled = true`, navigating to `/:spaceId/challenges/:subspaceNameId/about` continues to render the legacy MUI subspace About. CRD About is L0-exclusive in this iteration. The CRD components nonetheless accept level-aware data (`whyTitle`, `whoTitle` props derived from `t('context.${space.level}.why.title')`) so that future subspace migration is a routing change, not a redesign.
- **Rationale**: `CrdSpaceRoutes.tsx` already delegates `/challenges/:subspaceNameId/*` to the legacy `SubspaceRoutes`. No new code needed for fallback. Avoids the inconsistency of CRD chrome wrapping legacy MUI subspace content.
- **Alternatives considered**:
  - *Render the new CRD About for subspaces too* — rejected: subspace routing isn't yet CRD; adopting it here would expand scope.
  - *Show a CRD-styled "not yet migrated" notice* — rejected: degrades UX for subspace users with no benefit.

## Decision 7 — Close destination when the user lacks read privilege

- **Decision**: Step browser history back two entries (`useBackWithDefaultUrl(undefined, 2)`), so the user leaves both the inaccessible Space home and the About URL itself. Fall back to the platform Home if no such prior history exists.
- **Rationale**: Mirrors the legacy MUI behavior at `src/domain/space/about/SpaceAboutPage.tsx:17-20`. Avoids the bounce loop where closing the dialog routes the user back to a Space they cannot read.
- **Alternatives considered**:
  - *Always navigate to the platform Home regardless of history* — rejected: loses context for users who came from a meaningful prior page (e.g., a search result).
  - *Always navigate to the user's Dashboard* — rejected: not all users have a dashboard pattern that fits this case.

## Decision 8 — Apply form validation: continuous validation, submit disabled until valid, per-field error text only after first submit or after blur

- **Decision**: Use `yup` (already in deps) per question to validate `required` and `maxLength`. The submit button is disabled until the form is valid. Inline error text appears next to a question only after the user has either attempted to submit the form or blurred that question with invalid content.
- **Rationale**: Matches the legacy MUI form's behavior (`Formik` with `validateOnMount: true`). Avoids both extremes (errors on first keystroke = noisy; errors only on submit = surprising). The disabled submit button gives a gentle continuous cue.
- **Alternatives considered**:
  - *Validate only on submit* — rejected: user is surprised at submit time; keystroke effort feels wasted.
  - *Validate on every keystroke and show errors immediately* — rejected: visually noisy while typing.

## Decision 9 — Mid-session permission change re-evaluation: passive only

- **Decision**: The dialog re-evaluates read privilege on the next user interaction or the next natural Apollo cache refresh. No active polling, no focus-triggered re-fetch, no real-time subscription.
- **Rationale**: Edge case is low-frequency; existing GraphQL cache invalidation handles common cases (e.g., after the user joins in another tab and Apollo's cache normalization propagates the membership update). Adding active polling would be unjustified background load.
- **Alternatives considered**:
  - *Refetch on window focus* — rejected: marginal UX improvement at the cost of additional implementation. Not warranted for an edge case.
  - *Real-time subscription* — rejected: large complexity for a rare scenario.

## Decision 10 — Community Guidelines "Read more" implemented as a nested Radix dialog

- **Decision**: `CommunityGuidelinesBlock` renders a truncated markdown preview (Tailwind `[mask-image]` fade) with a "Read more" `Button` that opens a nested shadcn `Dialog` containing the full description and references list.
- **Rationale**: Radix dialogs nest cleanly: the inner dialog's overlay paints over the outer, Esc closes only the innermost. Mirrors the MUI pattern (`CommunityGuidelinesBlock.tsx:88` opens `CommunityGuidelinesInfoDialog`). Single new component, no special primitives needed.
- **Alternatives considered**:
  - *Expand inline (no nested dialog)* — rejected: long guidelines + references would dominate the About dialog.
  - *Open as a separate route* — rejected: adds routing complexity, breaks "About is one self-contained surface" model.

## Decision 11 — Translation key strategy: extend `crd-space` namespace; reuse existing `translation` namespace keys for shared copy

- **Decision**: Add new keys for dialog chrome and apply state machine to `src/crd/i18n/space/space.<lang>.json` under `about.*` and `apply.*` blocks. Reuse existing main-translation keys where the legacy dialog already provides good copy (e.g., `context.${level}.why.title`, `context.${level}.who.title`, `aboutDialog.applyNotSignedInHelperText`, `components.application-button.dialog-*`, `pages.space.application.*`).
- **Rationale**: Consistency of voice across CRD and MUI; avoids translation drift; reduces translator workload. The CRD layer can call `useTranslation()` for default-namespace keys when needed, while preferring the namespaced `crd-space` for new strings.
- **Alternatives considered**:
  - *Duplicate every key into `crd-space`* — rejected: doubles translation work and risks drift.
  - *Move all CRD-relevant keys to a new `crd-community` namespace* — rejected: more namespaces, higher i18n config churn, no obvious benefit while CRD About is the only consumer.

## Decision 12 — Dialog sizing: `w-full sm:max-w-4xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`

- **Decision**: Match the precedent set by `src/crd/components/callout/CalloutDetailDialog.tsx`: full width on mobile, ~896px max on `sm+`, near-full viewport height, no padding (children manage their own), flex column for sticky header / scrollable body.
- **Rationale**: Visually consistent with the existing CRD dialog; works on mobile (95vh near-fullscreen via Radix's responsive `max-w-[calc(100%-2rem)]`); leaves the implementation room for sticky header without nested scroll boxes.
- **Alternatives considered**:
  - *Custom sizing* — rejected: adds visual inconsistency; no design rationale to deviate.
  - *Use a `Sheet` from `src/crd/primitives/sheet.tsx`* — rejected: About is a content overlay, not a side panel; the existing dialog precedent is correct.

---

## Inventory of reusable building blocks

Confirmed available in the codebase, no need to recreate:

- **CRD primitives** (`src/crd/primitives/`): `dialog`, `button`, `tooltip`, `avatar`, `separator`, `card`, `scroll-area`, `popover`, `sheet`.
- **CRD common components**: `MarkdownContent` (`src/crd/components/common/MarkdownContent.tsx`), `LoadingSpinner` (`src/crd/components/common/LoadingSpinner.tsx`).
- **CRD existing components**: `InvitationDetailDialog` (`src/crd/components/dashboard/InvitationDetailDialog.tsx`), `SpaceAboutView` (`src/crd/components/space/SpaceAboutView.tsx`).
- **Domain hooks**: `useApplicationButton`, `useInvitationActions`, `useInvitationHydrator`, `useDirectMessageDialog`, `useBackWithDefaultUrl`, `useCurrentUserContext`, `useSpace`, `useNavigate`.
- **Generated GraphQL hooks**: `useSpaceAboutDetailsQuery`, `useCommunityGuidelinesQuery`, `useApplicationDialogQuery`, `useApplyForEntryRoleOnRoleSetMutation`, `useUserPendingMembershipsQuery`.
- **Helpers**: `isApplicationPending`, `getMessageType`, `pickColorFromId`, `buildSettingsUrl`, `buildLoginUrl`, `buildSignUpUrl`, `cn` (`src/crd/lib/utils.ts`).
- **Routing**: `TopLevelRoutes.tsx` (toggle wired), `CrdSpaceRoutes.tsx` (`/about` route wired).

## Key MUI source files for porting reference (not modified)

- `src/domain/space/about/SpaceAboutDialog.tsx` (306 lines) — full reference for dialog body, sections order, dual host position, lock tooltip, edit pencils.
- `src/domain/space/about/components/AboutHeader.tsx` (66 lines) — header layout reference.
- `src/domain/space/about/components/AboutDescription.tsx` (95 lines) — section block reference.
- `src/domain/community/applicationButton/ApplicationButton.tsx` (348 lines) — apply-button state machine (`107-244`) and dialog wiring patterns.
- `src/domain/community/applicationButton/ApplicationDialog.tsx` (177 lines) — apply form reference.
- `src/domain/community/applicationButton/ApplicationSubmittedDialog.tsx` (26 lines) — submitted confirmation reference.
- `src/domain/community/applicationButton/PreApplicationDialog.tsx` (74 lines) — parent-app-pending / apply-parent prompt reference.
- `src/domain/community/applicationButton/PreJoinParentDialog.tsx` (61 lines) — join-parent prompt reference.
- `src/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock.tsx` (105 lines) — guidelines truncation + read-more pattern.
- `src/domain/community/community/CommunityGuidelines/CommunityGuidelinesInfoDialog.tsx` — full-content read-more dialog reference.
