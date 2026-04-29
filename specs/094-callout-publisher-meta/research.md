# Phase 0 Research: Callout Publisher Meta

## Status

No `[NEEDS CLARIFICATION]` markers remain in the spec. Q1 (independent fallback) and Q2 (search scope) were both resolved during `/speckit.clarify`. Q2 was subsequently revised by the user post-planning: CRD callout search-result cards are now in scope and follow the same fallback rule (publisher → creator → `Unknown` last-resort label). Research below captures the technical decisions that were validated against the codebase during planning so they don't need to be re-derived during implementation.

## Decisions

### D1. Fallback evaluation lives at the presentation/mapping layer, not the data layer

- **Decision**: Apply `publishedBy ?? createdBy` and `publishedDate ?? createdDate` at the four presentation call sites (one MUI component, three CRD mappers). The domain hook (`useCalloutDetails`) and the view-model type (`CalloutModelExtension`) expose **both** fields independently — no derived "displayAuthor" field, no helper function.
- **Rationale**:
  - Q1 clarification mandated **independent** fallback — the same domain value can resolve differently per consumer (e.g. one surface might later choose to show only the publisher even when null). Locking the fallback at the domain layer would foreclose that.
  - The four call sites are below the duplication-extraction threshold called out in `CLAUDE.md` ("three similar lines is better than a premature abstraction"). A shared `resolveCalloutAuthor()` helper would shuffle the conditional rather than reduce conceptual complexity.
  - Keeps the change reversible: if a future surface needs different fallback semantics (e.g. show "draft by X" explicitly), the mapper changes locally without touching the domain.
- **Alternatives considered**:
  - *Domain-derived `displayAuthor` / `displayDate` fields*: rejected — couples display logic to the domain, contradicts Constitution Principle I and the spec's FR-005 (presentation responsibility).
  - *Backend-derived field on the GraphQL schema*: rejected — out of scope (frontend repo), introduces a contract change that has to be coordinated, and offers no tangible benefit for four call sites.
  - *Shared helper in `src/main/crdPages/space/dataMappers/`*: rejected — three identical bodies, helper would obscure the trivial expression. Re-evaluate only if a fifth call site is added.

### D2. Extend two GraphQL fragments — the main Callout fragment and the search-result Callout fragment

- **Decision**: Edit two distinct fragments to expose the same four fields (`createdBy`, `createdDate`, `publishedBy`, `publishedDate`) on their respective Callout selections:
  1. The main Callout fragment in `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` (currently lines 131–142). Adds `createdDate` and `publishedBy` (already has `createdBy` and `publishedDate`).
  2. The `SearchResultCallout` fragment in `src/main/search/SearchQueries.graphql` (currently lines 130–164). Adds **all four** fields — none are currently selected on the search result, which is why `searchDataMapper.ts` falls back to `Unknown` / `''`.

  Both edits use the same nested `User` shape (`{ id profile { id displayName avatar: visual(type: AVATAR) { id uri } } }`) so Apollo normalizes a single User entity per id regardless of which fragment fetched it.
- **Rationale**:
  - The two fragments live in different domain locations and serve different consumers (space-tab callout list / detail vs. global search overlay). Each must be self-sufficient — there is no cross-fragment composition that would let one selection cover both.
  - The main fragment is already consumed by both list and detail paths (via `useCalloutsSet` and `useCalloutDetails`), so its single edit reaches the MUI dialog header and the three CRD mappers.
  - The search fragment edit is what unlocks fixing the `Unknown` / empty rendering — without selecting the fields, no mapping change can populate them.
  - Mirroring `createdBy`'s nested shape exactly keeps cache normalization clean and lets the `??` fallback be type-safe without casts.
  - Constitution Principle III requires fragment changes to ship with regenerated `apollo-hooks.ts` in the same PR; both edits are picked up by a single `pnpm codegen` run.
- **Alternatives considered**:
  - *Define a shared `CalloutAuthorshipFragment` and spread it in both places*: rejected — only two consumers and a flat 6-line projection; the indirection costs more than it saves.
  - *Separate `PublishedByFragment` mixed in*: rejected — over-engineered for two fields plus a User selection; introduces an extra file to maintain.
  - *Inline selection on each query that touches `Callout`*: rejected — duplicates the projection across multiple queries and risks drift if the avatar shape changes.

### D3. Date parsing is delegated to the existing `useCalloutDetails` `Date`-coercion path

- **Decision**: In `useCalloutDetails.ts`, the existing line that parses `publishedDate` (`calloutDetails.publishedDate ? new Date(calloutDetails.publishedDate) : undefined`) is duplicated for `createdDate` and `publishedBy` is passed through as-is. The hook continues to convert ISO strings to `Date` so downstream consumers don't have to.
- **Rationale**:
  - `formatRelativeDate` (CRD) and `<FormattedDate>` (MUI) both accept `Date` instances — the existing convention works.
  - `CalloutModelExtension.publishedDate` is already typed `Date | undefined`; matching the type for `createdDate` keeps the model symmetric and predictable.
- **Alternatives considered**:
  - *Pass raw ISO strings through the model and parse at the consumer*: rejected — would force every consumer to repeat the parse, violating DRY and the existing convention.

### D4. CRD mappers introduce two local `const`s rather than calling a helper

- **Decision**: Each of the three callout mappers in `calloutDataMapper.ts` (`mapCalloutLightToPostCard`, `mapCalloutDetailsToPostCard`, `mapCalloutDetailsToDialogData`) prepends a two-line preamble:
  ```ts
  const authorSource = callout.publishedBy ?? callout.createdBy;
  const dateSource = callout.publishedDate ?? callout.createdDate;
  ```
  then references `authorSource` and `dateSource` in the existing `author` / `timestamp` expressions. The search mapper in `searchDataMapper.ts` (one call site, `mappedCallouts`) follows the same pattern, with one extra step: the resolved name is then passed through the existing `?? unknownLabel` fallback that already exists for whiteboard/memo/post results, so a callout with neither publisher nor creator still renders the localised "Unknown" label.
- **Rationale**:
  - Mirrors the MUI implementation (`author={callout.publishedBy ?? callout.createdBy}`) — same conceptual operation, applied at each layer's "boundary point."
  - Keeps each mapper self-contained and readable; the source of truth for each field is one line away from where it's used.
  - For search specifically, layering the existing `?? unknownLabel` on top of the `??` chain preserves consistency with how whiteboard/memo/post search results already render and avoids introducing a new "no author" branch.
- **Alternatives considered**:
  - *Inline `?? ` directly in the `author: { name: …, avatarUrl: …}` literal*: rejected — produces an unreadably nested expression; the local `const` approach is one line longer per mapper but markedly clearer.
  - *Extract a single shared helper across `calloutDataMapper.ts` and `searchDataMapper.ts`*: rejected — the two mappers serve different presentation prop shapes (`PostCardData` vs. `PostResultCardData`) and the fallback strategies differ slightly (search adds the `unknownLabel` last-resort). Four call sites with a two-line preamble is below the abstraction threshold called out in `CLAUDE.md`.

### D5. Visual-presentation neutrality is enforced by *not* changing the consuming components

- **Decision**: `Authorship` (MUI), `<CardHeader>`-derived layouts, and the CRD `PostCard` / `CalloutDetailDialog` rendering paths receive **only different prop values**. Their internals — markup, classes, separators (`·` for MUI, `•` for CRD), date formatting — remain untouched.
- **Rationale**: FR-005 requires no visual change; SC-004 guards against regression in adjacent meta lines. The smallest possible diff is the strongest evidence of compliance.
- **Alternatives considered**: none — touching presentation components would expand scope and risk regressions.

### D6. Verification is browser-driven, not unit-test-driven

- **Decision**: Verification relies on (a) `pnpm lint` to confirm type-level correctness end-to-end (fragment → generated types → model → hook → consumer); (b) `pnpm vitest run` to confirm no incidental regressions; (c) manual browser scenarios documented in `quickstart.md` against a backend that has callouts in both draft and published states.
- **Rationale**:
  - No targeted unit tests exist today for the affected mappers or for `CalloutHeader`. Adding tests just for this small data-binding switch would be tooling-heavy relative to the change.
  - Type-level guarantees are strong: if `publishedBy` is mistyped or missing from the model, `pnpm lint` fails at the consumer.
  - The user-facing rule (publisher vs. creator on a published callout, fallback on a draft) is straightforward to validate by eye in two minutes per UI.
- **Alternatives considered**:
  - *Add Vitest coverage for the three CRD mappers*: deferred — worth doing as part of a broader CRD-mapper test pass, not bundled here. Tracked separately if priority emerges.

## Open Questions

None.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Generated Apollo types drift from the new fragment shape if `pnpm codegen` is skipped | Low (CI gate) | High (breaks consumers) | Constitution Principle III is enforced in PR review; `pnpm lint` will fail at the consumer level if generated types are stale. |
| A consumer of the existing Callout fragment that I haven't enumerated relies on the *absence* of `publishedBy` (e.g. a deeply nested cache update) | Very low | Medium | Apollo's normalized cache adds new fields to existing entities transparently; no consumer should break by *gaining* a field. Spot-check by running the app after codegen. |
| `Authorship` MUI component renders `null` if `author` is `undefined` (legacy null-guard) — current behavior on a draft with no `createdBy`. After the change, drafts always have a `createdBy`, so the null branch is reached only when the data is truly absent. No regression. | N/A | N/A | No mitigation needed. |
| Ambient prop-typing mismatch on `Authorship` if `publishedBy` happens to be typed slightly differently than `createdBy` in generated types | Low | Low | The fragment selects the exact same nested shape for both fields, so generated types are structurally identical. `pnpm lint` is the gate. |
