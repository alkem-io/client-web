# Implementation Plan: CRD Share Dialog Migration

**Branch**: `042-crd-space-page-8-dialog` | **Parent**: [../plan.md](../plan.md) | **Spec**: [./spec.md](./spec.md)

## Summary

Replace the MUI `ShareDialog` portal in the callout context-menu Share action with a fully CRD-styled equivalent, in two passes:

- **Pass 1**: extract the existing CRD `ShareButton`'s self-contained dialog into a controlled `ShareDialog` primitive (URL + clipboard copy). Refactor `ShareButton` to compose it. Replace the MUI portal in `CalloutSettingsConnector`.
- **Pass 2**: add view-switching to `ShareDialog` (default ↔ "Share on Alkemio" sub-view) via a `shareOnAlkemioSlot` prop. Build a presentational `UserSelector` form (multi-select, no Formik, no `cmdk`) and an integration component `CalloutShareOnAlkemioForm` that wires `useUserSelectorQuery` + `useShareLinkWithUserMutation`.

Three-layer split mirrors the parent plan: design-system primitives in `src/crd/`, presentational form in `src/crd/forms/`, integration glue in `src/main/crdPages/space/callout/`. No new dependencies, no GraphQL schema changes, no new namespaces.

## Technical Context

- TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned).
- No new dependencies. The user-picker uses existing CRD primitives (`Avatar`, `Input`, `Button`) + `lucide-react` icons. No `cmdk`, no `@radix-ui/react-popover` needed for the picker — the result list is inline.
- Mutations and queries already exist: `useShareLinkWithUserMutation`, `useUserSelectorQuery`, `useCurrentUserContext`. No codegen changes.
- Validation pattern: manual derived `userError` / `messageError` per render (matches the lightness of the form — three rules, no schema warranted). Mirrors the "no Formik" stance from the callout-dialog plan.
- No React Compiler manual-memoization (`useMemo` is used once for the default-message template; everything else flows through plain expressions).

## Architecture

Three-layer split following the parent plan:

1. **CRD presentational** (`src/crd/components/common/`, `src/crd/forms/`) — plain TS props, Tailwind, zero Apollo / domain / routing.
2. **Integration connector** (`src/main/crdPages/space/callout/`) — Apollo queries / mutation, current-user filter, plus the dialog mounting site.
3. **Existing hooks reused** (`useShareLinkWithUserMutation`, `useUserSelectorQuery`, `useCurrentUserContext`, `useNotification`) — unchanged.

## File Inventory

### New CRD components (`src/crd/`)

| Path | Role |
|---|---|
| `components/common/ShareDialog.tsx` | Controlled dialog. Props: `open`, `onOpenChange`, `url`, `title?`, `shareOnAlkemioSlot?`, `children?`, `className?`. Owns the `view: 'default' \| 'alkemio'` state, the `copied` flash, and URL absolutization. Resets state on close. |
| `forms/UserSelector.tsx` | Multi-select user picker. Plain TS prop type `ShareUser`. Renders search input + inline result list + chip strip of selected users. No popover, no `cmdk`. |

### Modified CRD components

| Path | Change |
|---|---|
| `components/common/ShareButton.tsx` | Strip the inline dialog. Owns only the trigger + open state + tooltip. Composes `ShareDialog`. Drops `showShareOnAlkemio` and `onShareOnAlkemio` props (replaced by `shareOnAlkemioSlot` passed through to `ShareDialog`). |

### New integration layer (`src/main/crdPages/space/callout/`)

| Path | Role |
|---|---|
| `CalloutShareOnAlkemioForm.tsx` | Wires `useUserSelectorQuery` (search), `useShareLinkWithUserMutation` (send), `useCurrentUserContext` (filter self). Owns form state and validation. Renders `<UserSelector>` + `<Textarea>` + Send button. Mirrors the MUI `AlkemioShareHandler` flow at `src/domain/shared/components/ShareDialog/platforms/ShareOnAlkemio.tsx`. |

### Modified integration layer

| Path | Change |
|---|---|
| `CalloutSettingsConnector.tsx` | Replace MUI `ShareDialog` import with CRD `ShareDialog`. Pass `<CalloutShareOnAlkemioForm url={...} entityLabel={tDefault('common.callout')} />` as the slot. Add a second `useTranslation()` call (default namespace) to access `common.callout` for the entity label. Update the header docblock to reflect that Share is no longer a "MUI portal sibling outside `.crd-root`". |
| `CrdPublicWhiteboardPage.tsx` | Drop now-stale `showShareOnAlkemio={false}` from the `<ShareButton>` call. The new "no slot ⇒ no button" default makes it redundant. |

### i18n

`src/crd/i18n/common/common.en.json` (+ mirrors in nl, es, bg, de, fr):
- New top-level: `share.back`.
- New subtree: `share.alkemio.{description, defaultMessage, searchPlaceholder, searchAriaLabel, searching, noResults, removeUser, messageLabel, warning, send, sent}` and `share.alkemio.errors.{atLeastOneUser, messageRequired, messageTooLong, sendFailed}`.

No new namespace — `crd-common` already exists. `@types/i18next.d.ts` derives types from `common.en.json` so no manual type registration is needed.

## Key Design Decisions

### D1 — Controlled dialog, not self-contained

`ShareDialog` is **controlled** (`open` / `onOpenChange`). The trigger is owned by the consumer. This is what makes it usable from a context menu (`CalloutSettingsConnector` opens it when the user clicks Share in `CalloutContextMenu`) — the MUI-trigger-shape that lived inside the original CRD `ShareButton` could not handle that case. The existing `ShareButton` keeps its self-contained shape but composes the new `ShareDialog`, so the two ergonomics coexist.

### D2 — View state is internal to the dialog

The dialog owns `view: 'default' \| 'alkemio'` internally. The consumer does not control which view is shown — they just provide the slot. Clicking the "Share on Alkemio" button (or the Back arrow) flips the state. On close (`open` → `false`), the state resets so the next open always shows the URL view. This avoids exposing a controlled `view` prop that no consumer would meaningfully drive.

### D3 — Slot pattern for the Alkemio sub-flow

The Alkemio sub-flow needs Apollo (`useShareLinkWithUserMutation`, `useUserSelectorQuery`) and current-user context — none of which CRD components are allowed to import. The cleanest split is:

- `ShareDialog` (CRD) accepts `shareOnAlkemioSlot?: ReactNode`. When present, the dialog renders the slot in the alkemio view.
- The integration layer (`CalloutSettingsConnector`) renders `<CalloutShareOnAlkemioForm />` into the slot.

The slot is a plain `ReactNode`, not a render-prop. The slot doesn't need to know about the dialog's "Back" affordance because the dialog renders that itself in the header. The slot is purely the form body.

### D4 — `UserSelector` without `cmdk` or popover

The MUI `FormikUserSelector` uses `Autocomplete` (which is heavy: dropdown, keyboard navigation, popover positioning, virtualization). The shadcn equivalent is typically `Combobox` built on `cmdk`. Adding `cmdk` would violate the parent plan's "no new dependencies" rule. The simplest equivalent that hits the requirements (search input, result list, chip strip, accessible) is **inline rendering**: render the result list as a plain `<ul>` directly under the input, only when `searchQuery.trim().length > 0`. No popover, no portal, no focus-management gymnastics. Keyboard users tab through input → result rows → message field. This is a pragmatic, dependency-free choice that's still WCAG-compliant.

If the inline list later proves too cramped on long results, we can switch to a Radix `Popover` (already in deps, used by other CRD primitives) — that's a non-breaking change.

### D5 — Validation: manual derived state, no yup

Three rules total: `selectedUsers.length > 0`, `message.trim().length > 0`, `message.length <= LONG_TEXT_LENGTH`. The form derives `userError` / `messageError` per render via simple ternaries. A `showErrors` flag gates whether to display them — flipped to `true` on first Send click so users don't see errors before they've tried to submit. This matches the lightness of the form (three rules, two fields) and avoids importing yup just for this.

### D6 — Default message templating happens client-side

The default message uses `t('share.alkemio.defaultMessage', { entity, url })` with `{{entity}}` and `{{url}}` interpolation. The integration layer passes `entityLabel` (a translated string from the consumer's namespace) and `url`; the CRD form does the i18n lookup. This keeps:

- The `crd-common` namespace owning the message shape (so it can change consistently across consumers).
- The consumer free of message-construction logic.
- The CRD form free of business-namespace knowledge (it doesn't need to know `'common.callout'` — only that `entityLabel` is a translated string).

If a future Share-on-Alkemio consumer wants a different default message (e.g., for Spaces), it can override by passing the message as a prop — this sub-spec does not add that prop because there is one consumer right now and YAGNI.

### D7 — `ShareButton` API change is a deliberate simplification

The old `ShareButton` accepted `showShareOnAlkemio?: boolean` (default `true`) and `onShareOnAlkemio?: () => void`. In practice, the existing two consumers used these only to **hide** the button, never to wire a real handler — the button rendered as a no-op when the flag was `true` but no handler was provided. The new API drops both props and uses **slot presence** as the only gate: `shareOnAlkemioSlot` provided ⇒ button rendered. Both existing consumers keep working without behavioural change because neither was meaningfully using the dropped props. `CrdPublicWhiteboardPage`'s `showShareOnAlkemio={false}` is removed as redundant.

### D8 — `view` reset on close, not on the slot's actions

When the user successfully sends a message, the `CalloutShareOnAlkemioForm` clears its own state (selection, message, query) but the dialog **stays in the alkemio view** — the user might want to send to additional people. This matches the MUI behaviour. The view only resets on dialog close. This means: if the user sends, then closes, then reopens, they see the URL view first (FR-09). If they want to send again immediately, they click "Share on Alkemio" again. Acceptable.

### D9 — URL absolutization stays in `ShareDialog`

The dialog calls `new URL(url).toString()` with a fallback to `window.location.protocol` + `host` concatenation. Yes, this is a browser-API read inside a CRD component — but it's a pure read, not a side effect, and the alternative (forcing every consumer to absolutize) would add friction without value. Matches the original CRD `ShareButton`'s behaviour. The CRD CLAUDE.md golden rule on "no business logic" targets data fetching / mutations / navigation — reading `window.location` for display is a neutral utility (similar to `useMediaQuery` already in CRD).

### D10 — No CRD port of the 7 other MUI `ShareDialog` callsites

The MUI `ShareDialog` is consumed in 7+ other places across MUI pages (memo, calendar, discussion, MUI callout block, MUI whiteboard view, dashboard updates, community updates, public whiteboard MUI variant). They all live inside MUI pages where the visual inconsistency does not appear. Migrating them now would couple this sub-spec to migrations of those entire pages. We do **not** touch them. They will switch to the CRD `ShareDialog` when their host pages migrate.

This is consistent with the callout-dialog plan's pattern: keep the MUI version alive at non-CRD callsites until the host page migrates.

## Data Flow

### Clipboard share flow (URL view)

```
User clicks 3-dots → Share in CalloutContextMenu
  → setShareOpen(true) in CalloutSettingsConnector
  → <ShareDialog open={true} onOpenChange={setShareOpen} url={callout.framing.profile.url} ... />
  → ShareDialog renders URL absolutized + Copy button
  → User clicks Copy
  → ShareDialog.handleCopy() → navigator.clipboard.writeText(fullUrl)
  → setCopied(true) → 2 s timeout → setCopied(false)
  → User closes dialog (X / Escape / outside-click)
  → onOpenChange(false) → useEffect resets view + copied
```

### Share-on-Alkemio flow

```
User clicks "Share on Alkemio" inside ShareDialog
  → ShareDialog.setView('alkemio')
  → ShareDialog renders <CalloutShareOnAlkemioForm url={...} entityLabel={...} /> in the slot
  → User types in the search input
  → CalloutShareOnAlkemioForm.searchQuery → useUserSelectorQuery
  → Results filtered (current user excluded, already-selected excluded by UserSelector)
  → User clicks a result → handleSelect → setSelectedUsers + clear query
  → User edits message → handleMessageChange
  → User clicks Send
  → validate (userError + messageError)
  → if invalid → setShowErrors(true), abort
  → if valid → message.includes(url) ? message : `${message}\n\n${url}`
  → useShareLinkWithUserMutation({ messageData: { receiverIds, message } })
  → on success → setMessageSent(true), reset selection / message / query
  → on failure → notify(t('share.alkemio.errors.sendFailed'), 'error')
  → User clicks Back arrow → setView('default')
  → User closes dialog → useEffect resets dialog state (view, copied)
  → Form's local state is unmounted with the slot
```

## Phased implementation

| Phase | User stories | What ships | Effort |
|---|---|---|---|
| P0 | US1, US3, US4 | `ShareDialog` controlled component (URL + clipboard). `ShareButton` refactored to compose it. `CalloutSettingsConnector` swaps MUI import for CRD. `CrdPublicWhiteboardPage` callsite cleanup. i18n already present. | Small |
| P1 | US2 | `UserSelector` form. `ShareDialog` view-switching + Back arrow. `CalloutShareOnAlkemioForm` integration component. `CalloutSettingsConnector` passes the slot. New i18n keys for `share.alkemio.*` across 6 languages. | Medium |

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| The user picker without `cmdk` lacks keyboard arrow-key navigation across results | Tab works (each result is a `<button>`), which meets WCAG. If users complain, swap the inline list for a Radix `Popover` + roving-tabindex list — non-breaking change. |
| `useUserSelectorQuery` runs on every keystroke and could spam the backend | Acceptable for now (matches MUI). If observed in production, add a debounce in the integration layer (not in CRD). |
| The `<output>` confirmation announcement may not be loud enough for screen readers | Backed by implicit `role="status"`. If insufficient, upgrade to `role="alert"`-style via `aria-live="assertive"` on a wrapper. |
| `mapToShareUser` returns `null` for users without `profile`, which might silently hide search results | Acceptable — the GraphQL schema marks `profile` as optional but in practice it is always present. We log nothing because the case is unreachable in normal data. If it becomes reachable, a Sentry breadcrumb in the integration layer is the right place to add visibility. |
| `view` reset on close means an in-flight send cannot finish if the user closes the dialog mid-mutation | The dialog actually stays open while `sending === true` (Send button is disabled + `aria-busy`); the user has to wait. They can still close via X / Escape — Apollo will continue the mutation in the background and the cache will update. The form's `messageSent` state is lost (the dialog has unmounted), so the success confirmation is not shown — but the message *is* sent. Acceptable. |
| Consumers other than the callout context menu may want the Alkemio sub-flow with a different default message template | Out of scope for this sub-spec — the integration layer (`CalloutShareOnAlkemioForm`) is callout-specific. A future generic `ShareOnAlkemioForm` in `src/main/crdPages/_shared/` is the right place when a second consumer materializes. |

## Testing

- **Vitest unit tests** are not added in this sub-spec. The form's three validation rules and the dialog's view-switching are simple enough that visual + manual smoke covers them. If we later want coverage, the targets would be:
  - `ShareDialog`: view switches on button click, view resets on close, Copy button flips label on success.
  - `UserSelector`: result list excludes selected users, chip remove fires `onRemove`.
  - `CalloutShareOnAlkemioForm.validate`: each of the three rules produces / clears its message; URL is appended only when missing from the message.
- **Manual smoke** (P0 + P1):
  1. Open a CRD callout, click 3-dots → Share. Dialog opens, URL visible. Click Copy: label flips for 2 s.
  2. Click Share on Alkemio. View switches. Search a user, pick them, write a message, send. Confirmation appears. Selection clears. Send to a second user without re-typing message — works.
  3. Click Back. View returns to URL.
  4. Close dialog. Reopen — URL view (not Alkemio).
  5. Try to send with no users → error shows. Try with empty message → error. Try with > 2048 chars → error.
  6. Verify `CrdWhiteboardView` and `CrdPublicWhiteboardPage` `ShareButton` callsites still render the dialog correctly (no Alkemio button in either).
- **No e2e**. The dialog is a CRD component; existing test suites cover the larger callout flow.

## Constitution check

| Principle | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | PASS | CRD layer owns presentation; Apollo + current-user lookup live in the integration connector. |
| II. React 19 Concurrent UX | PASS | No manual memoization in components; `useMemo` only for the default-message string (deliberate — recomputing it on each keystroke is wasteful). |
| III. GraphQL Contract Fidelity | PASS | No schema changes. Reuses existing `useShareLinkWithUserMutation` + `useUserSelectorQuery`. |
| IV. State & Side-Effect Isolation | PASS | Form state owned by `CalloutShareOnAlkemioForm`; mutation in the same connector. CRD components are stateless except for visual `useState` (`view`, `copied`, `open`). |
| V. Experience Quality & Safeguards | PASS | WCAG 2.1 AA covered: aria-labels on icon buttons, aria-hidden on decorative icons, role="alert" on error messages, aria-busy on the Send button, persistent aria-label on the search input. |
| Arch-1 Feature taxonomy | PASS | New files under existing CRD subtrees (`components/common/`, `forms/`) and existing crdPages subtree (`space/callout/`). |
| Arch-2 Styling | PASS | The callout flow now has only `ImportTemplatesDialog` and `CreateTemplateDialog` left in the MUI-coexistence exception (Share is removed). |
| Arch-3 i18n | PASS | `crd-common` namespace; 6 languages updated in the same PR. |
| Arch-5 Imports | PASS | No barrel exports; explicit paths only. |
| Eng-5 Root cause | PASS | The MUI portal was the actual root of the visual inconsistency, not a symptom — replacing it is the fix, not a workaround. |
