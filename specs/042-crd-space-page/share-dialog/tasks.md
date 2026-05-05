# Tasks: CRD Share Dialog Migration

**Parent**: [../tasks.md](../tasks.md) | **Plan**: [./plan.md](./plan.md) | **Spec**: [./spec.md](./spec.md)

Legend: `[P]` — can be done in parallel with other `[P]` items in the same phase.

## P0 — Dialog shell + clipboard (drop the MUI portal)

- [X] **T001** Create `src/crd/components/common/ShareDialog.tsx` — controlled dialog. Props per FR-01..FR-11: `open`, `onOpenChange`, `url`, `title?`, `children?`, `className?`. Owns `copied` state and the URL absolutization. Hides itself when `url` is `undefined` (FR-11). Pulls i18n from the `crd-common` namespace (`share.title`, `share.url`, `share.copy`, `share.copied`, `close`). All these keys already exist — no i18n work needed in P0.
- [X] **T002** Refactor `src/crd/components/common/ShareButton.tsx` to compose `ShareDialog` (D7). Drop the obsolete `showShareOnAlkemio?: boolean` and `onShareOnAlkemio?: () => void` props. Keep `dialogTitle`, `tooltip`, `tooltipIfDisabled`, `disabled`, `children`, `className`. Dialog open state stays internal to the button (`useState`).
- [X] **T003** Update `src/main/crdPages/whiteboard/CrdPublicWhiteboardPage.tsx` to drop the now-stale `showShareOnAlkemio={false}` prop on the existing `<ShareButton>` (D7). Behaviour identical (no slot ⇒ no Alkemio button).
- [X] **T004** Update `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx`: replace the MUI `ShareDialog` import (`@/domain/shared/components/ShareDialog/ShareDialog`) with the CRD one (`@/crd/components/common/ShareDialog`). Replace the conditional `{shareOpen && <ShareDialog ... />}` mount with an unconditional `<ShareDialog open={shareOpen} onOpenChange={setShareOpen} url={callout.framing.profile.url} />` — the CRD dialog handles `open === false` itself. Update the file's docblock to reflect that Share is no longer an "MUI portal sibling outside `.crd-root`".
- [X] **T005** Run `pnpm lint` + `pnpm vitest run`. Confirm no new errors and no test regressions. Verify the `CrdWhiteboardView` and `CrdPublicWhiteboardPage` callsites still type-check after the `ShareButton` prop change.

## Checkpoint after P0

A user clicks 3-dots → Share on a CRD callout and sees a CRD-styled dialog (border, typography, focus ring all from `crd.css`) instead of the MUI portal. Copy-link works. The two existing `ShareButton` callsites (`CrdWhiteboardView`, `CrdPublicWhiteboardPage`) keep working without behavioural change. No new dependencies. The MUI `ShareDialog` is no longer imported by any file under `src/main/crdPages/` — verify with `grep -rn "from.*domain/shared/components/ShareDialog/ShareDialog" src/main/crdPages/`.

## P1 — Share-on-Alkemio sub-flow

### CRD primitives

- [X] **T010** Create `src/crd/forms/UserSelector.tsx` — multi-select user picker per FR-30..FR-36. Plain TS prop type `ShareUser = { id; displayName; avatarUrl?; city?; country? }`. Renders Search-prefixed `<Input>`, inline `<ul>` result list (only when `searchQuery.trim().length > 0`), and a chip strip of selected users. Uses `Avatar` + `AvatarImage` + `AvatarFallback` (CRD primitives). All labels (placeholder, searchAriaLabel, loadingLabel, noResultsLabel, removeAriaLabel) accepted as props — no `useTranslation` inside the component (consumer i18n's). Filters already-selected users from results client-side.
- [X] **T011** Update `src/crd/components/common/ShareDialog.tsx` to add view-switching (FR-06..FR-09). New prop `shareOnAlkemioSlot?: ReactNode`. Internal `view: 'default' \| 'alkemio'` state. When `shareOnAlkemioSlot` is provided, render an outlined "Share on Alkemio" full-width button below the URL row that flips the view to `'alkemio'`. In the alkemio view, render the slot in place of the URL view, and show a Back arrow icon button (`ArrowLeft`, `aria-label={t('share.back')}`) in the dialog header. `useEffect` resets `view` to `'default'` and `copied` to `false` when `open` transitions to `false`.
- [X] **T012** Update `src/crd/components/common/ShareButton.tsx` to forward the new `shareOnAlkemioSlot?: ReactNode` prop through to `ShareDialog`. Existing consumers continue to work without setting it (Alkemio button stays hidden).

### Integration layer

- [X] **T020** Create `src/main/crdPages/space/callout/CalloutShareOnAlkemioForm.tsx` per FR-40..FR-46. Plain TS props `{ url: string; entityLabel: string }`. Wires `useUserSelectorQuery` (search), `useShareLinkWithUserMutation` (send), `useCurrentUserContext` (filter self), `useNotification` (failure toast). Owns `selectedUsers`, `message` (initialized via `useMemo` from `t('share.alkemio.defaultMessage', { entity, url })`), `searchQuery`, `messageSent`, `showErrors` state. Manual validation: `userError` (≥ 1 user) + `messageError` (non-empty + ≤ `LONG_TEXT_LENGTH`). On Send: appends `url` to message if missing (D in spec FR-46), runs the mutation, on success clears state + shows inline `<output>` confirmation, on failure fires `useNotification` toast. Maps GraphQL user → `ShareUser`, drops users without `profile`, drops the current user.
- [X] **T021** Update `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx` to wire the new form into `<ShareDialog>`'s slot. Add a second `useTranslation()` call (default namespace, aliased `tDefault`) so `entityLabel={tDefault('common.callout')}` can be passed. The existing `useTranslation('crd-space')` call stays for `t('sortContributions.saveFailed')`.

### i18n

- [X] **T030** Add new keys to `src/crd/i18n/common/common.en.json` under `share.*`: `share.back`, plus a `share.alkemio.*` subtree containing `description`, `defaultMessage`, `searchPlaceholder`, `searchAriaLabel`, `searching`, `noResults`, `removeUser`, `messageLabel`, `warning`, `send`, `sent`, and `errors.{atLeastOneUser, messageRequired, messageTooLong, sendFailed}` (FR-50..FR-52). The default message is `"I thought you'd find this {{entity}} interesting: {{url}}"`. Authoritative English copy.
- [X] **T031 [P]** Mirror the same key tree in `common.nl.json`, `common.es.json`, `common.bg.json`, `common.de.json`, `common.fr.json` (AI-assisted translations per `src/crd/CLAUDE.md`). Each language must have **every** new key — no partials. The existing T095-style i18n parity test (in the parent callout-dialog tasks) walks the JSON files; if it covers `crd-common`, it will catch any miss.

### Verification

- [X] **T040** Run `pnpm lint`. Fix the formatter warning that biome flags on `UserSelector.tsx` (long `<output>` line breaks across multiple lines). Run `pnpm exec biome format --write src/crd/forms/UserSelector.tsx` to auto-fix.
- [X] **T041** Run `pnpm vitest run`. Confirm 685 tests pass (no regressions).
- [ ] **T042** Manual smoke per spec US1..US3 (P0 + P1 paths combined):
  1. CRD callout 3-dots → Share. Dialog opens, URL absolute, Copy works.
  2. Click Share on Alkemio. Search a user, pick one, write message, Send. Confirmation appears.
  3. Send to a second user without re-typing — works (state cleared, default message restored).
  4. Click Back. URL view. Close. Reopen → URL view (not Alkemio).
  5. Try Send with 0 users → error visible. Empty message → error. > 2048 chars → error.
  6. `CrdWhiteboardView` and `CrdPublicWhiteboardPage` `ShareButton` callsites still render correctly with no Alkemio button.

## Cleanup & follow-ups

- [ ] **T050** Update `../callout-dialog/spec.md` and `../callout-dialog/plan.md` to remove `ShareDialog` from the MUI-coexistence non-goals / FR-106 / D12-style references (the parent callout-dialog spec listed Share as MUI portal; this sub-spec supersedes that). Optional — the supersession is documented in this sub-spec's "Supersedes in parent" section, so editing the upstream doc is informational only.
- [ ] **T051** File a follow-up for the 7 remaining MUI `ShareDialog` callsites (`MemoDialog`, `CalendarEventDetail`, `DiscussionView`, `CalloutSettingsUI`, `CalloutContributionPreview`, `WhiteboardView` MUI-management, `CommunityUpdatesDialog`, `DashboardUpdatesSection`, MUI `PublicWhiteboardPage`). They will switch to the CRD `ShareDialog` when their host pages migrate to CRD. No change required now.
- [ ] **T052** Consider extracting a generic `ShareOnAlkemioForm` in `src/main/crdPages/_shared/` once a second consumer (Space Share, Memo Share, etc.) needs it. Out of scope here — YAGNI.

## Checkpoints

- **After P0**: Share opens a CRD-styled dialog with URL + Copy. The MUI `ShareDialog` import is removed from `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx`. Existing CRD `ShareButton` callsites unchanged.
- **After P1**: Share on Alkemio works end-to-end from a CRD callout — user picker, message, Send, success confirmation, Back, error states. All 6 languages translated. `pnpm lint` + `pnpm vitest run` clean.
