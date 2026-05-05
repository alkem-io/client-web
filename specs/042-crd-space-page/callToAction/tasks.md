# Tasks: CRD Call to Action (Link) Framing Migration

**Feature**: CRD Call to Action Framing Migration (sub-spec of `042-crd-space-page`)
**Branch**: `042-crd-space-page-<next>`
**Spec**: [./spec.md](./spec.md) | **Plan**: [./plan.md](./plan.md)

## User Stories (derived from spec acceptance criteria)

- **US1 (P1)** — Feed-level CTA button: `CalloutFramingType.Link` callouts render a full-width primary-filled button in `PostCard` with tooltip, external-link icon when applicable, `rel="noopener noreferrer"` on `target="_blank"`. Clicking the button navigates directly (new tab if external); clicking the rest of the card still opens the detail dialog.
- **US2 (P1)** — Detail-dialog CTA slot: the callout detail dialog renders the same button inside a new `callToActionFramingSlot`.
- **US3 (P1)** — Write-path bug fix: creating a CTA-framed callout through the CRD form saves `framing.link = { uri, profile: { displayName } }` (not `framing.profile.referencesData`). The server persists it; reopening the callout shows the CTA.
- **US4 (P2)** — Parity, a11y, cleanup: i18n keys for all 6 languages, keyboard + screen-reader QA, invalid-URL parity with MUI, forbidden-import sweep.

Each story is independently testable: US1 renders in the CRD standalone preview with mock `framingCallToAction` data; US2 renders with a mocked `callout.framing.link`; US3 is verified via live backend + devtools network; US4 is a pass/fail checklist.

---

## Phase 1: Setup

- [ ] T001 [P] Verify `src/crd/primitives/tooltip.tsx` does not yet exist; if absent, confirm `@radix-ui/react-tooltip` is in `package.json` and add it if missing (it ships with several other shadcn primitives already in the codebase). Record the result so T005 knows whether to port.
- [ ] T002 [P] Read `CalloutFramingCreateInput` in `src/core/apollo/generated/graphql-schema.ts` and capture the exact shape of its `link` field (is it `{ uri, profile: { displayName } }` or flattened `{ uri, displayName }`?). Reproduce a MUI CTA-callout creation once against a local backend with devtools network tab open, capture the payload, commit the shape decision to the T015 task description.
- [ ] T003 [P] Audit existing CRD references to `CalloutLinkAction`. Expected: only self-referenced today (not yet imported anywhere). Run `grep -rn "CalloutLinkAction" src/ --include="*.ts" --include="*.tsx"` and record the result. Confirms the component is safe to rewrite without breaking existing consumers.
- [ ] T004 [P] Confirm the light callout query's `framing` selection set — does it include `link { uri, profile { displayName } }`? Check `src/domain/collaboration/callout/` `.graphql` files for the `CalloutModelLight` fragment. If yes, US1's mapper can populate `framingCallToAction` from the light query too; if no, US1 only lights up after the details query resolves. Record the decision and update T011 accordingly.

---

## Phase 2: Foundational (blocking prerequisites)

- [ ] T005 [P] If T001 reported absent: add `src/crd/primitives/tooltip.tsx` porting shadcn's `tooltip` recipe. Exports `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`. Replace `cn()` import with `@/crd/lib/utils`. Zero MUI. Ensure `<TooltipProvider>` sits at an appropriate ancestor — typically app root; document where it should live if not already mounted. If already present, skip.
- [ ] T006 Create `src/main/crdPages/space/dataMappers/callToActionDataMapper.ts`. Pure `mapLinkToCallToActionProps(link: LinkDetails | undefined): { url: string; displayName: string; isExternal: boolean; isValid: boolean } | undefined`:
  - Returns `undefined` when `link` is `undefined` or `link.uri` is empty.
  - Wraps `new URL(uri)` in try/catch; on throw or non-`http(s)` protocol → `{ url: uri, displayName: link.profile.displayName || uri, isExternal: false, isValid: false }`.
  - On success, `isExternal = new URL(uri).origin !== window.location.origin`; returns `{ url: uri, displayName, isExternal, isValid: true }`.
- [ ] T006a [P] **(constitution §V)** Unit test `src/main/crdPages/space/dataMappers/callToActionDataMapper.test.ts`. Cover: (a) `undefined` link → `undefined`; (b) empty uri → `undefined`; (c) malformed URI (e.g. `"not a url"`) → `isValid: false`; (d) `ftp://...` → `isValid: false`; (e) external URL (mock `window.location.origin`) → `isExternal: true, isValid: true`; (f) internal URL matching origin → `isExternal: false, isValid: true`; (g) displayName fallback to uri when missing. No React, no Apollo — pure function test using Vitest + jsdom.
- [ ] T007 [P] Extend `PostType` union in `src/crd/components/space/PostCard.tsx` with `'callToAction'`. Add `typeIcons['callToAction'] = Megaphone` (import from `lucide-react`) and `typeLabels['callToAction'] = 'callout.callToAction'`. Extend `PostCardData` with `framingCallToAction?: { uri: string; displayName: string; isExternal: boolean; isValid: boolean }`.
- [ ] T008 [P] Add `CalloutFramingType.Link → 'callToAction'` case to `mapFramingTypeToPostType` in `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`. Extend `mapCalloutDetailsToPostCard` to populate `framingCallToAction` via `mapLinkToCallToActionProps(callout.framing.link)` when `callout.framing.type === CalloutFramingType.Link`. Per T004's result, decide whether to populate it in `mapCalloutLightToPostCard` too.
- [ ] T009 [P] Add CRD i18n keys to `src/crd/i18n/space/space.en.json` under `crd-space`: `callout.callToAction` (label matching `typeLabels`), `callToAction.externalLinkDisclaimer`, `callToAction.linkAriaLabel` (with `{displayName}` + `{uri}` interpolation), `callToAction.validation.invalidUrl`, `callToAction.tooltipUriLabel` (screen-reader-only prefix for the URI in the tooltip). Add equivalent translations in `space.nl.json`, `space.es.json`, `space.bg.json`, `space.de.json`, `space.fr.json` — CRD translations are AI-assisted, not Crowdin.

**Checkpoint**: After T005–T009, US1 can start (mapper + prop path + primitive ready, labels resolvable). US2 can start in parallel.

---

## Phase 3: User Story 1 — Feed-level CTA button (P1)

**Goal**: CTA-framing callouts render a full-width primary-filled CTA button in `PostCard` with tooltip, `ExternalLink` icon when applicable, and correct `target`/`rel` attributes. Clicking the button navigates; clicking the rest of the card opens the detail dialog.

**Independent test**: In the CRD standalone app (or a Vitest render test), render `PostCard` with `type='callToAction'` and `framingCallToAction: { uri: 'https://example.com', displayName: 'Visit example', isExternal: true, isValid: true }`. Verify:
- A full-width primary-filled button renders labelled "Visit example" + `ExternalLink` icon.
- The button is an `<a href="https://example.com" target="_blank" rel="noopener noreferrer">`.
- Hovering shows a tooltip with the URI + external-link disclaimer.
- Clicking the button does NOT bubble to the card's `onClick` (the propagation-stop works).
- With `isValid: false`, the button is disabled + outline-variant + shows the invalid-URL error string, no `href`.

- [ ] T010 [US1] Harden `src/crd/components/callout/CalloutLinkAction.tsx`:
  - Rename the `url` prop to keep `{ url, displayName, isExternal, isValid, className? }` (align with the mapper output).
  - Primary-filled full-width `<Button>` by default — use whatever variant the project calls primary; inspect `src/crd/primitives/button.tsx` and pick (`variant="default"` or similar). `w-full`.
  - Wrap the button in `<Tooltip>` + `<TooltipTrigger asChild>` + `<TooltipContent>`. Content shows:
    - When `isExternal`: `t('callToAction.externalLinkDisclaimer')` on one line + the URI on another.
    - When internal: just the URI.
  - `<a>` inside the button when `isValid`: `href={url}`, `target={isExternal ? '_blank' : undefined}`, `rel={isExternal ? 'noopener noreferrer' : undefined}`, `aria-label={t('callToAction.linkAriaLabel', { displayName, uri: url })}`. `e.stopPropagation()` on the `<a>` click handler so the surrounding card's click handler does not fire.
  - When `!isValid`: render a disabled `variant="outline"` button with `t('callToAction.validation.invalidUrl')` as the label, destructive border (`border-destructive text-destructive`), no `<a>`, no tooltip.
  - Inside the label, render `ExternalLink` icon at the end (trailing `gap-2`) when `isExternal && isValid`. No icon for internal valid links. Decorative icon → `aria-hidden="true"`.
  - Accept `className` for composition. Use `cn()` from `@/crd/lib/utils`.
  - Typography: button label uses `text-control font-medium` (button base token).
- [ ] T011 [US1] Extend `src/crd/components/space/PostCard.tsx`: add a branch below the existing framing branches — `post.type === 'callToAction' && post.framingCallToAction` renders `<CalloutLinkAction url={post.framingCallToAction.uri} displayName={post.framingCallToAction.displayName} isExternal={post.framingCallToAction.isExternal} isValid={post.framingCallToAction.isValid} className="mt-4" />`. Place in the same framing slot region as whiteboard thumbnail / memo preview / media-gallery grid.
- [ ] T012 [US1] Verify propagation-stop behaviour: the CTA button's click must not trigger the `PostCard`'s `onClick` (which opens the detail dialog). Inspect the existing card-wrapping pattern in `PostCard.tsx` — if the whole card is a single clickable element, the `<a>` click inside will bubble; `e.stopPropagation()` inside `CalloutLinkAction`'s click handler (T010) solves it. If the `<Button asChild>` wrapper eats the event before `stopPropagation`, add a wrapping `<div onClick={e => e.stopPropagation()}>` in T011's JSX. Confirm with a keyboard test: `Tab` to the button, `Enter` activates the link — does NOT open the dialog.
- [ ] T013 [US1] **(deferred to follow-up session)** Standalone-demo wiring in `src/crd/app/pages/SpacePage.tsx`: add a mock CTA post (external) and a mock CTA post (internal) to the demo feed. Useful for stakeholder review without a live backend.

---

## Phase 4: User Story 2 — Detail-dialog CTA slot (P1)

**Goal**: The callout detail dialog renders the same `CalloutLinkAction` in its own framing slot, alongside whiteboard / memo / media-gallery slots.

**Independent test**: In the CRD standalone app, mount `CalloutDetailDialog` with `callToActionFramingSlot={<CalloutLinkAction … />}` and verify:
- The button renders in the framing region (next to / replacing the whiteboard/memo slots).
- Width matches the available container (full-width inside the slot).
- Clicking the button does not close the dialog (the dialog remains open — Radix default; tested because the `<a>` is inside the dialog's focus trap).

- [ ] T014 [US2] Extend `src/crd/components/callout/CalloutDetailDialog.tsx`:
  - Add `callToActionFramingSlot?: ReactNode` to `CalloutDetailDialogProps`.
  - Render it in the same region as the other framing slots: `{callToActionFramingSlot && <div className="pt-2">{callToActionFramingSlot}</div>}`.
- [ ] T015 [US2] Create `src/main/crdPages/space/callout/CallToActionFramingConnector.tsx`:
  ```tsx
  type Props = { callout: CalloutDetailsModelExtended };
  export function CallToActionFramingConnector({ callout }: Props) {
    const props = mapLinkToCallToActionProps(callout.framing.link);
    if (!props) return null;
    return <CalloutLinkAction url={props.url} displayName={props.displayName} isExternal={props.isExternal} isValid={props.isValid} />;
  }
  ```
  No Apollo queries, no state, no hooks beyond what the mapper needs. Pure pass-through.
- [ ] T016 [US2] Wire the connector into `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`:
  - Add `const hasCallToAction = callout.framing.type === CalloutFramingType.Link && !!callout.framing.link;`.
  - Add `const callToActionFramingSlot = hasCallToAction ? <CallToActionFramingConnector callout={callout} /> : undefined;`.
  - Pass the slot into both `<CalloutDetailDialog>` render sites (the `!callout.comments?.id` branch and the main branch). Mirror the wiring pattern for `mediaGalleryFramingSlot` exactly.

---

## Phase 5: User Story 3 — Write-path bug fix (P1)

**Goal**: Creating a CTA-framed callout through the CRD form persists `framing.link = { uri, profile: { displayName } }` on the server. The existing broken `framing.profile.referencesData` write is removed.

**Independent test**: With CRD toggle ON, open the callout creation dialog, choose attachment type CTA, fill in displayName + URL, submit. In devtools:
- Network tab shows the `CreateCalloutOnCalloutsSet` mutation payload with `variables.calloutData.framing.link = { uri, profile: { displayName } }`.
- Reopen the newly created callout → feed shows the CTA button (populated by US1); detail dialog shows the CTA slot (populated by US2).

- [ ] T017 [US3] Update `src/main/crdPages/space/callout/CalloutFormConnector.tsx` — replace the `CalloutFramingType.Link` submit branch:
  ```ts
  // BEFORE
  if (framingType === CalloutFramingType.Link && values.linkUrl) {
    callout.framing.profile.referencesData = [
      { uri: values.linkUrl.trim(), name: values.linkDisplayName.trim() || values.linkUrl.trim() },
    ];
  }

  // AFTER (adjust nested shape to match T002's codegen finding)
  if (framingType === CalloutFramingType.Link && values.linkUrl) {
    callout.framing.link = {
      uri: values.linkUrl.trim(),
      profile: { displayName: values.linkDisplayName.trim() || values.linkUrl.trim() },
    };
  }
  ```
  Adjust the object shape if T002 reveals a flattened shape (`{ uri, displayName }`) on `CalloutFramingCreateInput.link`. Remove the `referencesData` path entirely — CTA has no relationship to Profile references.
- [ ] T018 [US3] Smoke-test the edit path: if `CalloutEditConnector` also writes CTA data, audit it for the same bug and fix analogously. The edit path was not inspected during the initial audit — confirm during implementation whether it needs a matching fix.
- [ ] T019 [US3] Manual verification against live backend: (a) create a CTA callout via CRD form → reopen → CTA button renders; (b) edit the same callout (if T018's edit path exists) → CTA label + URL update; (c) delete and recreate with a different URL → reflects the change on reopen.

---

## Phase 6: User Story 4 — Parity, a11y, cleanup (P2)

- [ ] T020 [US4] Manual a11y + parity pass (MUI vs CRD side-by-side with the CRD toggle):
  - Keyboard path: `Tab` to the CTA button → `focus-visible:ring` is visible → `Enter` activates the link (new tab for external, same tab for internal). Tooltip appears on focus (shadcn default).
  - `aria-label` on the `<a>` announces the action and the destination URL (screen-reader test via VoiceOver or NVDA).
  - Disabled invalid-URL button is announced as disabled by the screen reader; the invalid-URL reason is in the accessible name.
  - Tooltip content is readable by screen reader via `aria-describedby` (shadcn default).
  - External-link icon has `aria-hidden="true"` (decorative — the `isExternal` info is already in the `aria-label` and visually in the icon).
  - Invalid-URL parity vs MUI: feed a callout with `framing.link.uri = "ftp://example.com"` and confirm both MUI and CRD render a disabled error button with matching visual tone.
  - Record pass/fail in the PR description.
- [ ] T021 [P] [US4] Grep CTA-touching files for hardcoded JSX strings — `src/crd/components/callout/CalloutLinkAction.tsx` and `src/main/crdPages/space/callout/CallToActionFramingConnector.tsx`. Every user-visible string must resolve via `useTranslation('crd-space')`.
- [ ] T022 [P] [US4] Forbidden-import sweep on the touched `src/crd/` files: grep for `@mui/`, `@emotion/`, `react-router-dom`, `window.location`, `window.open`, `useNavigate`. Zero hits expected inside `src/crd/`. The mapper in `src/main/crdPages/space/dataMappers/` is allowed to reference `window.location.origin` (it's the integration layer, not CRD).
- [ ] T023 [P] [US4] Verify no regressions on the existing test suite: `pnpm vitest run` + `pnpm exec tsc --noEmit`. If either of T006a's tests introduce a `window.location.origin` mock, ensure the mock is scoped so other tests in the suite are unaffected.
- [ ] T024 [US4] Bundle-size sanity check: `pnpm analyze` — verify no accidental inclusion of `react-image-gallery`, `@mui/material`, or other MUI chunks into CRD-only bundles. `@radix-ui/react-tooltip` is the only new dep if T005 needed to port the primitive.

---

## Dependencies

```
Setup (T001–T004)
   │
Foundational (T005–T009)
   │
   ├──► US1 (T010–T013)              ← feed button
   │
   ├──► US2 (T014–T016)              ← detail-dialog slot; can overlap US1
   │
   ├──► US3 (T017–T019)              ← write-path bug fix; independent of US1/US2 but best done after US1+US2 so verification is end-to-end
   │
   └──► US4 (T020–T024)              ← gating; do not start until US1–US3 merged green

Unit tests:
   T006a  ← accompanies T006 (mapper)
```

- US1 and US2 are visually independent — either can ship first against a mocked `framingCallToAction`.
- US3 is a bug fix that can land independently (separate commit / reviewable unit) but practically depends on US1+US2 for end-to-end verification.
- US4 is gating.

## Parallel Execution Examples

**After Foundational completes:**
- Contributor A: T010 → T011 → T012 → T013 (US1 end-to-end).
- Contributor B: T014 → T015 → T016 (US2 end-to-end).
- Contributor C: T017 → T018 → T019 (US3 bug fix + verification) — can start any time after T002 is done, but the live-backend verification in T019 is stronger once US1/US2 are in place.

**Inside US4:**
- T021, T022, T023 are `[P]`-safe (grep / static-analysis, different scopes).

## Implementation Strategy

- **MVP = US1 + US2 + US3 shipping together** in one PR. CTA is small enough that splitting the PR adds more review overhead than it saves. Bundle the three user stories behind the existing CRD toggle.
- **No new feature flag.** CTA is a parity migration, not a new feature.
- **Defer US4 until parity QA** — a11y + screen-reader QA + bundle check are faster with the full flow in place.
- **If T002 reveals a codegen mismatch**, resolve in the same PR — do not ship US1+US2 against a still-broken write path, because the acceptance test in spec.md depends on round-tripping a newly-created CTA.

## Format Validation

All tasks follow `- [ ] TNNN [P?] [USn?] Description with file path` — checkboxes present, IDs T001–T024 plus inserted T006a (total **25 tasks**), story labels on Phase 3–6 tasks only, file paths on every implementation task.
