# CRD Share Dialog Migration

**Feature Branch**: `042-crd-space-page-8-dialog`
**Parent**: [../spec.md](../spec.md)
**Status**: Draft

## Problem

The `callout-dialog` sub-spec (sibling: `../callout-dialog/spec.md`) intentionally left `ShareDialog` as an MUI portal — see its US17 ("Share opens the existing MUI `ShareDialog` via portal — no CRD port"), FR-106 ("Share opens the MUI `ShareDialog` via portal, unchanged, rendered outside `.crd-root`"), and Non-goal #1 ("Porting `ShareDialog` (MUI)"). The reasoning at the time was scope: the dialog has two sub-flows (clipboard copy and "Share on Alkemio" with a user picker + send-message mutation), and the user picker pulled in `FormikUserSelector` (Formik + MUI `Autocomplete` + a domain-level user-search query). Porting it would have ballooned the callout-dialog scope.

The cost of that decision became visible once the rest of the callout flow was on CRD: when a user clicks the 3-dots → Share on a CRD-rendered callout card, the dialog that opens is visually inconsistent (MUI shadows, MUI typography) with the rest of the page. It also keeps a Formik + MUI dependency wired into the CRD code path purely for one dialog, which we want to retire as the CRD migration finishes.

The CRD `ShareButton` (`src/crd/components/common/ShareButton.tsx`) already covered the **clipboard half** with a self-contained dialog (URL field + Copy button with Check feedback). What was missing:

- A **controlled** `ShareDialog` so a parent (`CalloutSettingsConnector`) can render the dialog from a context-menu callback without owning its trigger.
- A **CRD multi-select user picker** equivalent to `FormikUserSelector` — no Formik, no MUI `Autocomplete`, no `cmdk` (per "no new dependencies" rule from the parent plan).
- A **send-message form** that wires the existing `useShareLinkWithUserMutation` + `useUserSelectorQuery` from the CRD layer.

Hand-on testing confirmed the MUI dialog was reachable from the CRD callout context menu in the form `CalloutSettingsConnector.tsx:199` was rendering it via portal. That is the integration point we are replacing.

## Solution

Two passes, one branch, one PR sequence. Scope: **full Share parity with MUI for the callout context-menu Share action**, decoupled into a reusable CRD primitive that any CRD consumer can opt into.

### Pass 1 — Dialog shell + clipboard (drop the MUI portal)

Build a controlled CRD `ShareDialog` (URL + clipboard copy with Check feedback) and refactor the existing CRD `ShareButton` to compose it. Wire it into `CalloutSettingsConnector` to replace the MUI `ShareDialog` portal. The 7 other MUI `ShareDialog` callsites (memo, calendar, discussion, callout block, dashboard updates section, etc.) stay on MUI — they live inside MUI pages where the visual inconsistency does not arise.

### Pass 2 — Share on Alkemio sub-flow

Add view-switching to `ShareDialog` (default URL view ↔ "Share on Alkemio" sub-view) via a `shareOnAlkemioSlot?: ReactNode` prop. Build a CRD `UserSelector` (multi-select with avatars, no Formik, no `cmdk`, no Radix popover) and an integration component `CalloutShareOnAlkemioForm` that wires `useUserSelectorQuery` + `useShareLinkWithUserMutation` + `useCurrentUserContext`. The integration layer renders into the slot. CRD primitives stay free of Apollo / domain knowledge.

### Supersedes in parent `callout-dialog`

This sub-spec supersedes three explicit decisions from `../callout-dialog/`:

- **US17 ("Share")** — was: "Existing MUI `ShareDialog` opens via portal (outside `.crd-root`). No CRD port." Now: a CRD `ShareDialog` is rendered inside `.crd-root` with full clipboard + Share-on-Alkemio parity (this sub-spec).
- **FR-106** — was: "Share opens the MUI `ShareDialog` via portal, unchanged, rendered outside `.crd-root`." Now: Share opens the CRD `ShareDialog`. The "MUI portal" pattern still applies to `ImportTemplatesDialog` and `CreateTemplateDialog` — only `ShareDialog` is removed from that list.
- **Non-goal #1** — was: "Porting `ShareDialog` (MUI). Used as-is via portal outside `.crd-root`." This non-goal is dropped.

The callout-dialog spec's Constitution check (`Arch-2 Styling`) noted "PASS (with parent's known MUI-coexistence exception) — Only `ShareDialog` + `ImportTemplatesDialog` stay MUI." After this sub-spec lands, only `ImportTemplatesDialog` and `CreateTemplateDialog` remain in the CRD-MUI coexistence exception for the callout flow.

### Goals

1. A user can click **Share** on a CRD callout (3-dots menu, on both `PostCard` and `CalloutDetailDialog`) and a **CRD-styled dialog** opens with the entity URL + copy-to-clipboard.
2. The dialog also offers **"Share on Alkemio"**: clicking it switches the body to a user-picker form with a message textarea; submitting calls `useShareLinkWithUserMutation` exactly as the MUI flow does.
3. Anywhere the existing CRD `ShareButton` is consumed (whiteboard view, public whiteboard page) keeps working without behavioural regression.
4. CRD layer stays clean: `ShareDialog` and `UserSelector` are pure presentational components with plain TS props (no Apollo, no Formik, no MUI, no business types). All side effects (search, mutation, current-user filter) live in the integration layer.
5. All user-visible strings live in `src/crd/i18n/common/` under `share.*` and `share.alkemio.*` (the `crd-common` namespace), in all 6 languages.

## User Scenarios

### US1 — Share via clipboard (Priority P0)

A user clicks the 3-dots on a callout, then **Share**. The CRD `ShareDialog` opens with the entity URL pre-filled and selected. They click **Copy link**; the icon flips to a Check and the label reads "Copied" for 2 seconds, then reverts.

**Acceptance**:
1. **Given** the dialog is open with a relative URL (e.g., `/space/foo/callout/bar`), **When** rendered, **Then** the URL field shows the absolute URL using `window.location.protocol` + `host`.
2. **Given** the user clicks **Copy link**, **When** the clipboard write resolves, **Then** the button label switches to "Copied" with a Check icon for 2 s, then reverts.
3. **Given** `navigator.clipboard.writeText` rejects (denied permission, insecure origin), **When** the user clicks Copy, **Then** the dialog stays usable — they can manually select the URL field (auto-select on focus / click).

### US2 — Share on Alkemio (Priority P0)

From the dialog, a user clicks **Share on Alkemio**. The dialog body switches to a user-picker view: a search input, a results list as they type, and a message textarea pre-filled with a default template. They pick one or more users, optionally edit the message, and click **Send**.

**Acceptance**:
1. **Given** the dialog is open and the user clicks **Share on Alkemio**, **When** the click fires, **Then** the dialog header shows a Back arrow and the body is replaced by the user-picker + message form. The default message reads "I thought you'd find this {{entity}} interesting: {{url}}" (from `share.alkemio.defaultMessage`).
2. **Given** the user types a query, **When** the query is non-empty, **Then** the form runs `useUserSelectorQuery({ filter: { displayName, email } })` and shows up to `SEARCH_PAGE_SIZE` (= 20) candidates, **excluding** the current user (`useCurrentUserContext`) and any already-selected users.
3. **Given** the user clicks a result, **When** the click fires, **Then** the user is added as a chip below the input, the search input clears, and the search results disappear (no query).
4. **Given** the user clicks the X on a chip, **When** the click fires, **Then** the user is removed from the selection.
5. **Given** the form has zero selected users, **When** the user clicks Send, **Then** an inline error "Select at least one user." is shown next to the picker; no mutation is sent.
6. **Given** the message is empty, **When** Send is clicked, **Then** an inline error "Message cannot be empty." is shown; no mutation.
7. **Given** the message exceeds `LONG_TEXT_LENGTH` (2048) characters, **When** Send is clicked, **Then** an inline error "Message must be {{max}} characters or fewer." is shown; no mutation.
8. **Given** validation passes, **When** Send is clicked, **Then** if the message does not already include the URL, the URL is appended on a new line; the form runs `useShareLinkWithUserMutation({ messageData: { receiverIds, message } })`.
9. **Given** the mutation resolves, **When** complete, **Then** an inline confirmation "Message sent successfully." is shown, the selection is cleared, the message is reset to the default template, and the search field is cleared. The dialog **stays open** (matching MUI behaviour) so the user may send to additional people or close manually.
10. **Given** the mutation rejects, **When** the rejection arrives, **Then** a localized notification "Could not send the message. Please try again." is fired via `useNotification` and the dialog stays open.

### US3 — Back to URL view (Priority P0)

A user is in the Share-on-Alkemio view and decides not to send. They click the Back arrow in the dialog header.

**Acceptance**:
1. **Given** the dialog is in the Alkemio view, **When** the Back arrow is clicked, **Then** the body switches back to the URL + Copy view. The form's local state (selected users, message draft) is preserved while the dialog remains open.
2. **Given** the dialog closes (X, Escape, outside-click), **When** it reopens, **Then** the view resets to the default URL view; the copied flag and form state are reset.

### US4 — Existing CRD ShareButton consumers keep working (Priority P0)

The pre-existing CRD `ShareButton` (`src/crd/components/common/ShareButton.tsx`) is consumed by `CrdWhiteboardView` and `CrdPublicWhiteboardPage`. It must continue to render the trigger + dialog without regression after the refactor onto `ShareDialog`.

**Acceptance**:
1. **Given** `CrdWhiteboardView` renders `<ShareButton url={whiteboardShareUrl} disabled={!whiteboardShareUrl}>{children}</ShareButton>`, **When** the user clicks the icon, **Then** the dialog opens with URL + Copy and the children render below the URL row inside a `border-t border-border` block (existing behaviour).
2. **Given** `CrdPublicWhiteboardPage` renders `<ShareButton url={computedGuestShareUrl} disabled={!computedGuestShareUrl} />`, **When** the user clicks, **Then** the dialog opens with URL + Copy only — no Share-on-Alkemio button is shown. (The button is hidden because no `shareOnAlkemioSlot` is provided.)

## Functional Requirements

### Dialog shell (`ShareDialog`)

- **FR-01** Controlled component — props: `open: boolean`, `onOpenChange: (open: boolean) => void`. The trigger is owned by the consumer.
- **FR-02** Title slot — accepts `title?: ReactNode`; defaults to `t('share.title')` ("Share").
- **FR-03** URL is rendered as a readonly `<Input>` (CRD primitive) with `aria-label={t('share.url')}`. Click / focus selects the field's contents (so manual copy is possible if clipboard is denied).
- **FR-04** URL absolutization happens in the dialog: relative URLs are resolved against `window.location.protocol` + `host` via `new URL(...)` with a fallback to string concat. The consumer may pass either a relative or absolute URL.
- **FR-05** Copy button — calls `navigator.clipboard.writeText(fullUrl)` inside a try/catch. On success, flips local state `copied` to true for `COPIED_FEEDBACK_MS` (= 2000 ms). On failure, fail silently — the user can still select-and-copy manually (FR-03).
- **FR-06** When `shareOnAlkemioSlot` is omitted, the Share-on-Alkemio button is **not rendered**. There is no other behaviour-bearing prop for this — the slot's presence is the toggle.
- **FR-07** When `shareOnAlkemioSlot` is provided, a full-width outlined "Share on Alkemio" button is rendered below the URL row. Clicking it switches the dialog's internal `view` state from `'default'` to `'alkemio'`.
- **FR-08** When `view === 'alkemio'`, the dialog body renders the slot in place of the URL view. The header gains a Back arrow (`ArrowLeft`, icon button, `aria-label={t('share.back')}`) to the left of the title that switches `view` back to `'default'`.
- **FR-09** When `open` transitions to `false`, the internal `view` state resets to `'default'` and `copied` resets to `false` — the next open always shows the URL view.
- **FR-10** When the consumer passes `children`, they render below the URL view inside a `pt-2 border-t border-border` block (preserves the existing CRD `ShareButton` extension point used by `CrdWhiteboardView`).
- **FR-11** When `url` is `undefined`, the dialog returns `null`. The consumer can render `<ShareDialog>` unconditionally without a wrapping `{open && ...}` guard.

### CRD `ShareButton` (refactor)

- **FR-20** Existing self-contained API. Owns its own `open` state and triggers a 32 px ghost icon button (`Share2`).
- **FR-21** Composes `ShareDialog` underneath. Passes `dialogTitle`, `shareOnAlkemioSlot`, `children` through.
- **FR-22** Drop pre-existing `showShareOnAlkemio?: boolean` and `onShareOnAlkemio?: () => void` props. Behaviour matches FR-06: provide a slot or get no button. Existing consumers (`CrdWhiteboardView`, `CrdPublicWhiteboardPage`) only used the boolean to **hide** the button — the new "no slot ⇒ no button" default makes the boolean redundant. Update `CrdPublicWhiteboardPage`'s call to remove the now-stale `showShareOnAlkemio={false}`.

### CRD `UserSelector` (form)

- **FR-30** Pure presentational. Plain TS prop type `ShareUser = { id; displayName; avatarUrl?; city?; country? }` — never a GraphQL type.
- **FR-31** Renders three regions: a Search-icon-prefixed `<Input>`, an inline result list (only shown when `searchQuery.trim().length > 0`), and a chip strip of selected users.
- **FR-32** Result list excludes already-selected users (component-side filter). Loading state shows `loadingLabel`; empty state shows `noResultsLabel`. Both are passed as `ReactNode` props (the consumer i18n's them).
- **FR-33** Each result row is a `<button type="button">` with the user's avatar (size-8) + display name + optional `city, country` line. Click invokes `onSelect(user)`.
- **FR-34** Each selected chip is a rounded-full `<span>` with avatar (size-6) + display name + an X button. The X button has `aria-label={removeAriaLabel(displayName)}`.
- **FR-35** Avatars use `<Avatar>` + `<AvatarImage>` + `<AvatarFallback>` (CRD primitives). When no `avatarUrl`, fall back to up-to-2-letter initials.
- **FR-36** No popover, no `cmdk`. The result list is a regular `<ul>` rendered inline below the input.

### Integration layer (`CalloutShareOnAlkemioForm`)

- **FR-40** Lives at `src/main/crdPages/space/callout/CalloutShareOnAlkemioForm.tsx`. Plain TS props `{ url: string; entityLabel: string }`. The consumer (`CalloutSettingsConnector`) provides `entityLabel` via `t('common.callout')` from the default `translation` namespace.
- **FR-41** Owns local form state: `selectedUsers: ShareUser[]`, `message: string`, `searchQuery: string`, `messageSent: boolean`, `showErrors: boolean`. No Formik, no yup library — manual validation in `userError` / `messageError` derived per render.
- **FR-42** Initial message is `useMemo`-computed from `t('share.alkemio.defaultMessage', { entity: entityLabel, url })`.
- **FR-43** User search runs `useUserSelectorQuery` with `{ filter: { displayName: trimmedQuery, email: trimmedQuery }, first: 20 }`, skipped when `trimmedQuery` is empty. Results are filtered to exclude `currentUser?.id` (from `useCurrentUserContext`). A `mapToShareUser` helper drops users without `profile` (TS-strictness fallout from the schema's optional profile).
- **FR-44** Send button: validation gates the mutation. On success, the form **stays mounted** with cleared selection, reset message, cleared query, and an inline `<output>` confirmation ("Message sent successfully."). On failure, `useNotification` fires `t('share.alkemio.errors.sendFailed')` as a toast and the form remains intact for retry.
- **FR-45** Send button shows `aria-busy={sending}` and is `disabled` while the mutation is in flight.
- **FR-46** Mirrors MUI behaviour: if `message` does not already contain `url`, prepend `url` with `\n\n` separator before sending. (See `src/domain/shared/components/ShareDialog/platforms/ShareOnAlkemio.tsx`.)

### i18n

- **FR-50** All new strings live in `src/crd/i18n/common/common.<lang>.json` under `share.*` (existing) and the new `share.alkemio.*` subtree, in all 6 languages (en, nl, es, bg, de, fr).
- **FR-51** New keys: `share.back`; `share.alkemio.{description, defaultMessage, searchPlaceholder, searchAriaLabel, searching, noResults, removeUser, messageLabel, warning, send, sent}`; `share.alkemio.errors.{atLeastOneUser, messageRequired, messageTooLong, sendFailed}`. EN is authoritative; the other 5 are AI-assisted per `src/crd/CLAUDE.md`.
- **FR-52** No new namespace — the `crd-common` namespace already exists and is what the existing CRD `ShareButton` uses.

### Accessibility (WCAG 2.1 AA)

- **FR-60** All icon-only buttons (Back arrow, chip-remove X) have `aria-label`.
- **FR-61** All decorative icons (Search, Send, ArrowLeft, X, Share2, Copy, Check) have `aria-hidden="true"`.
- **FR-62** The success confirmation uses `<output>` (implicit `role="status"`); the inline error messages use `<p role="alert">` so screen readers announce them when validation fails.
- **FR-63** The Send button uses `aria-busy={true}` and `disabled` while mutating (FR-45).
- **FR-64** Search input has `aria-label={searchAriaLabel ?? placeholder}` so the persistent label is exposed regardless of placeholder visibility.

## Out of scope (explicitly deferred)

- **The 7 other MUI `ShareDialog` callsites** — `MemoDialog`, `CalendarEventDetail`, `DiscussionView`, `CalloutSettingsUI` (MUI callout block), `CalloutContributionPreview`, `WhiteboardView` (MUI whiteboard management), `CommunityUpdatesDialog`, `DashboardUpdatesSection`, and `PublicWhiteboardPage` (the MUI public whiteboard, distinct from the CRD `CrdPublicWhiteboardPage`). These render inside MUI pages where the visual inconsistency does not arise. They will switch to the CRD `ShareDialog` when their hosting pages migrate to CRD.
- **A reusable CRD `UserSelector` for non-Share contexts.** This sub-spec extracts the selector into `src/crd/forms/UserSelector.tsx` so it is available to future consumers (e.g., invitation flows), but does not migrate any existing user-picker callsite. That is a separate sub-spec.
- **Search debounce / pagination.** The query runs on every keystroke (matches MUI). Adding a debounce or "Load more" is a follow-up if the search becomes a hot spot.
- **Sharing to external platforms** (email, social). The MUI dialog had a `MUI button group` shape that supports adding external platforms; the CRD design ports only the two existing handlers (clipboard, Alkemio). A future external-share platform would slot in next to the Alkemio button.
- **Sharing without authentication.** The `useShareLinkWithUserMutation` requires the current user to be authenticated to send a message; anonymous users see only the URL + Copy view (Share-on-Alkemio button is meaningless and would error on send). The integration layer relies on `CalloutSettingsConnector` only being rendered in authenticated contexts — out of scope to gate the Alkemio button itself behind auth.

## Assumptions

- `useShareLinkWithUserMutation`, `useUserSelectorQuery`, and `useCurrentUserContext` are stable and unchanged. No GraphQL schema changes.
- `LONG_TEXT_LENGTH` (= 2048) from `@/core/ui/forms/field-length.constants` matches the server-enforced max. No new validation constants.
- The CRD `Avatar`, `Input`, `Textarea`, `Label`, `Button`, `Tooltip`, and `Dialog` primitives are already in the CRD primitives folder.
- `cmdk` is **not** in `package.json` dependencies and we will not add it for this sub-spec — the `UserSelector` is built from existing primitives only (per parent plan's "no new dependencies" rule).
- The default `translation` namespace exposes `common.callout` — and, in future consumers, `common.<entity>` keys for any entity type that wants to use the CRD `ShareDialog` with an entity-templated default message.
