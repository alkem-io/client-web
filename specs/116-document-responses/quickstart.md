# Quickstart: Documents as Post Responses

## Prerequisites

- `pnpm install` up to date (no new runtime dependency added by this feature).
- A running Alkemio backend at `localhost:3000/graphql` (required once, to
  regenerate the `ImportCollaboraDocument` mutation hook via `pnpm codegen`
  — see contracts/graphql-operations.md). No backend changes are needed;
  the mutation already exists server-side.
- A space with the office-documents license entitlement enabled (the same
  gate the framing Document option already uses) so the Documents response
  type and its "not enabled" tooltip behave as expected during manual
  verification.

## Dev loop

```bash
# 1. Add the new mutation operation file, then regenerate types/hooks
pnpm codegen

# 2. Typecheck (tsc --noEmit) + Biome + ESLint, continuously while implementing
pnpm lint

# 3. Run the unit suite (fast; no backend needed for these)
pnpm vitest run

# 4. Manually verify in the app (Polina runs `pnpm start` herself — do not start it here)
```

## Manual verification recipe (per user story)

**US1 — Enable Documents as the response type**
1. Open a space with permission to create posts.
2. Start post creation → scroll to Responses.
3. Confirm a "Documents" chip appears, selectable, not disabled.
4. Select it, set actor switches, submit.
5. Reopen the post's edit dialog → confirm "Documents" shows locked/active.

**US2 — Add a document response by uploading**
1. On a Documents-type post, open the "Add document" affordance from the
   feed-level post-card preview.
2. Drag a `.docx` file onto the zone (or click to pick one).
3. Confirm the staged file shows name/size with a remove affordance.
4. Confirm; verify the busy state during upload; verify the new card
   appears in the grid afterward with the file's derived name.
5. Repeat step 1–4 from the full post/callout detail dialog instead — verify
   identical behavior (FR-016).

**US3 — Client-side rejection**
1. Attempt to upload a `.pdf` → verify inline "unsupported format" message,
   no network request (check devtools Network tab), dialog stays open.
2. Attempt to upload a `.docx` > 15 MB → verify inline size-cap message, no
   network request.

**US4 — Open, rename, delete**
1. Click a document response card → verify the fullscreen Collabora editor
   opens directly (no intermediate preview step).
2. Use the rename control → verify the new name persists in the grid after
   closing.
3. Trigger delete → verify the shared confirm-before-delete dialog appears;
   confirm → verify the card is removed from the grid.
4. As a member without update/delete rights, verify the same document opens
   read-only with no rename/delete affordance.

## Automated coverage added by this feature

- `contributionDataMapper.test.ts` (new) — the `collaboraDocument` branch of
  `mapAnyContributionToCardData`.
- `calloutFormMapper.test.ts` (extended) — `RESPONSE_TO_CONTRIBUTION_TYPE`
  and `contributionSettings` for `responseType: 'document'`.
- `ResponseTypeChipStrip.test.tsx` (extended) — the new `'document'` chip
  renders, is selectable, and respects `allowedChips` filtering.
- `deriveCollaboraImportErrorMessage.spec.ts` (new) — table-driven coverage
  of all `ValidationError` kinds for the shared import-error mapping helper.

Connector-level components (`DocumentContributionAddConnector`,
`DocumentContributionConnector`, `CollaboraContributionEditorOverlay`) follow
the existing convention for this file family (Whiteboard/Memo/Post add
connectors) of no dedicated unit test — they are thin Apollo-mutation wiring
covered by the manual verification recipe above and, longer-term, by
cross-service test-suites coverage (out of scope for this story to author).
