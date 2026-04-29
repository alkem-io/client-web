# Quickstart: Callout Publisher Meta

End-to-end implementation + verification path. Estimated effort: ~30 min including codegen and browser checks.

## Prerequisites

- Backend running locally at `localhost:4000/graphql` (required for `pnpm codegen`).
- Frontend dev server target: `localhost:3001`.
- At least one space with:
  - A **published** callout where the publisher and creator are different users.
  - A **draft** callout (visible to space admins only).
- CRD localStorage toggle on (browser console: `localStorage.setItem('alkemio-crd-enabled', 'true'); location.reload();`) for CRD verification; off for MUI verification.

## Implementation order

1. **Edit the main Callout fragment**
   `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` — add `createdDate` and a `publishedBy` selection mirroring `createdBy` (see `contracts/callout-fragment.graphql`).

2. **Edit the search-result Callout fragment**
   `src/main/search/SearchQueries.graphql` — extend `SearchResultCallout` (lines 130–164) with `createdBy`, `createdDate`, `publishedBy`, and `publishedDate` on the nested `callout` selection (see `contracts/search-callout-fragment.graphql`). All four fields are new here.

3. **Regenerate Apollo types**
   ```bash
   pnpm codegen
   ```
   Picks up both fragment edits in one pass. Stage the regenerated outputs in `src/core/apollo/generated/`.

4. **Extend the view-model type**
   `src/domain/collaboration/callout/models/CalloutModelLight.ts` — add `publishedBy?` (same shape as `createdBy`) and `createdDate?: Date | undefined` to `CalloutModelExtension<T>`.

5. **Propagate through the details hook**
   `src/domain/collaboration/callout/useCalloutDetails/useCalloutDetails.ts` (around line 72) — duplicate the `publishedDate` `Date`-coercion pattern for `createdDate`; pass `publishedBy` through unchanged.

6. **Switch the MUI callout-dialog header binding**
   `src/domain/collaboration/callout/calloutBlock/CalloutHeader.tsx:53`:
   ```tsx
   <Authorship
     author={callout.publishedBy ?? callout.createdBy}
     date={callout.publishedDate ?? callout.createdDate}
   />
   ```

7. **Switch the CRD callout mappers**
   `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` — three call sites: `mapCalloutLightToPostCard` (~line 39), `mapCalloutDetailsToPostCard` (~line 60), `mapCalloutDetailsToDialogData` (~line 127). Each gets:
   ```ts
   const authorSource = callout.publishedBy ?? callout.createdBy;
   const dateSource = callout.publishedDate ?? callout.createdDate;
   // … then reference authorSource / dateSource in the existing author / timestamp expressions.
   ```

8. **Switch the CRD search mapper**
   `src/main/crdPages/search/searchDataMapper.ts` — one call site: `mappedCallouts` inside `mapPostResults` (~lines 143–156). Replace the hard-coded `author: { name: unknownLabel }` and `date: ''` with the same fallback chain used for whiteboard / memo / post results, but starting with `publishedBy / publishedDate`:
   ```ts
   .map(r => {
     const authorSource = r.callout.publishedBy ?? r.callout.createdBy;
     const dateSource = r.callout.publishedDate ?? r.callout.createdDate;
     return {
       id: r.id,
       title: r.callout.framing.profile.displayName,
       snippet: '',
       type: 'post' as PostType,
       bannerUrl: undefined,
       author: {
         name: authorSource?.profile?.displayName ?? unknownLabel,
         avatarUrl: authorSource?.profile?.avatar?.uri,
       },
       date: dateSource ? formatDate(dateSource) : '',
       spaceName: r.space.about.profile.displayName,
       href: r.callout.framing.profile.url,
     };
   })
   ```
   The `?? unknownLabel` is preserved so callouts with neither publisher nor creator still render the localised fallback — matching the existing whiteboard / memo / post behaviour.

9. **Static checks**
   ```bash
   pnpm lint            # TypeScript + Biome + ESLint
   pnpm vitest run      # full test suite, ~9s
   ```
   Both must pass with zero new warnings.

## Verification scenarios

### Scenario 1 — Published callout with publisher ≠ creator (FR-001, US1 P1)

1. Browser → open a space containing such a callout.
2. **CRD ON**: confirm the callout summary card on the space tab shows the **publisher's** name and the **publish date** (no longer the creator).
3. Click into the callout → CRD detail dialog header — same publisher + publish date.
4. **CRD OFF**: re-open the callout. MUI callout-dialog header (`<Authorship>`) — same publisher + publish date.
5. **Pass criterion**: every meta line shows the same publisher and publish date across both UIs and across summary + detail surfaces.

### Scenario 2 — Draft callout (FR-002, US2 P2)

1. As a space admin, open a draft callout (one with no publisher set).
2. **CRD ON**: callout meta shows the **creator's name and creation date** (not blank).
3. **CRD OFF**: MUI callout-dialog header now also shows the creation date (current behaviour today: blank — this is the latent fix called out in the plan).
4. **Pass criterion**: meta is fully populated in both UIs; no blank avatar slot, no missing date.

### Scenario 3 — CRD search-result cards now show publisher / creator (FR-003 revised, SC-001)

1. Open the CRD search overlay → search for a term that matches a published callout where the publisher and creator differ.
2. **Pass criterion**: result card shows the **publisher's** name and the **publish date** — no longer `Unknown` and an empty date.
3. Repeat the search against a draft callout (admin only). Result card shows the **creator's** name and the **creation date** (FR-002 fallback).
4. If a callout exists with neither a publisher nor a creator (rare, only via inconsistent backend data), the card still renders the localised `Unknown` label — the existing last-resort behaviour is preserved.

### Scenario 4 — Out-of-scope surfaces unchanged (FR-006/FR-007, SC-004)

1. Open a callout that contains post / whiteboard / memo contributions. Verify each contribution card still shows its **creator + creation date** (no change vs. before this work).
2. Open a comment thread on a callout. Verify message author lines unchanged.
3. Open the calendar tab in a space. Verify event detail still shows `by {{name}} • {{date}}` from the existing `calendar.details.createdBy` translation key.
4. CRD search → search for a whiteboard, memo, or post (not a callout). Confirm those result cards still render the same author + date as before (mapping for those types is unchanged).
5. **Pass criterion**: identical behaviour to pre-change for every surface listed.

### Scenario 5 — Edge: partial data (FR-002, Edge Cases)

If the test environment has any callout where `publishedBy` is null but `publishedDate` is populated (or vice versa):

1. Verify name and date resolve **independently** — see "Edge Cases" in the spec.
2. **Pass criterion**: name fallback and date fallback are decoupled.

## Definition of done

- [ ] `pnpm lint` passes.
- [ ] `pnpm vitest run` passes.
- [ ] Generated Apollo files committed alongside the source edits.
- [ ] All five verification scenarios pass in a manual browser session.
- [ ] PR description includes screenshots of (a) published callout in CRD, (b) published callout in MUI, (c) draft callout in either UI showing the new fallback date, (d) CRD search result for a callout showing publisher (no longer `Unknown`).
- [ ] **Accessibility evidence in PR description** (per Constitution Engineering Workflow §4): confirm the rendered markup, the `aria-label` on the avatar (`avatar-of {{user}}`), and keyboard tab order for `<Authorship>` (MUI) and the CRD callout / search result cards are unchanged from pre-feature. State explicitly that no JSX, ARIA, or semantic-element edits were made — only data-binding expressions changed — so WCAG 2.1 AA compliance is preserved by construction.
- [ ] No edits to files listed as out of scope (`PostCard.tsx` for contributions, `ContributionPostCard.tsx`, `contributionDataMapper.ts`, `MessageView.tsx`, `EventDetailView.tsx`, calendar i18n files, common/callout `createdBy` translation keys).

## Rollback

If a regression is observed post-merge:

1. Revert the source-code commits in `src/domain/collaboration/callout/...`, `src/domain/collaboration/calloutsSet/...`, `src/main/search/SearchQueries.graphql`, `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`, and `src/main/crdPages/search/searchDataMapper.ts`.
2. Re-run `pnpm codegen` against the (reverted) fragments to regenerate matching Apollo types.

The change is fully presentational — no data migrations, no cache invalidation, no schema changes — so rollback is a code-only operation.
