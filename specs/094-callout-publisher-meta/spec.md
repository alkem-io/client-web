# Feature Specification: Show publisher (not creator) on callout meta

**Feature Branch**: `094-callout-publisher-meta`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Switch the author/date metadata shown on callouts so it reflects who/when the entity was published, falling back to who/when it was created when no publisher exists yet (drafts)."

## Clarifications

### Session 2026-04-29

- Q: When publisher and publish-date are not both present or both absent (partial data), how should each field resolve? → A: Independent fallback — name resolves as `publisher ?? creator`; date resolves as `publishDate ?? createdDate`. Each field falls back on its own.
- Q: Are CRD callout search-result cards in scope? → A: **In scope.** They MUST follow the same `publishedBy ?? createdBy` (name) and `publishedDate ?? createdDate` (date) rule and only fall back to the localised `Unknown` label when both publisher and creator are absent. *(Revised on review: the answer was originally "out of scope, fix separately" because the search-result author is hard-coded to `Unknown` today. The revision brings it back into scope so this feature satisfies the original "all callout/post meta" brief in one change rather than leaving a contradicting surface for a separate ticket.)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reader sees who published a callout (Priority: P1)

A community member is browsing callouts in a space. For each published callout — both in the summary card lists and in the detail dialog — the small metadata line that today shows "creator name · creation date" should instead show "publisher name · publish date". The community member needs to know who *made the callout visible to the community* and *when*, not who originally drafted it (those can be different people, e.g. an admin publishing a contributor's draft).

**Why this priority**: This is the entire point of the change. Without it, the displayed attribution is misleading whenever the publisher and creator differ (which is common in moderated spaces).

**Independent Test**: Open a space that contains a callout known to have been published by a user different from its creator. Verify both the callout summary card and the callout detail dialog show the publisher's name and the publish date in the meta line. Re-test in both the legacy interface and the new CRD interface — behaviour must match.

**Acceptance Scenarios**:

1. **Given** a published callout where the publisher and creator are the same person, **When** the reader views the callout meta in either UI, **Then** the meta shows that person's name and the publish date.
2. **Given** a published callout where an admin published a contributor's draft, **When** the reader views the callout meta in either UI, **Then** the meta shows the admin (publisher) and the publish date — not the original contributor (creator) or the creation date.
3. **Given** a published callout, **When** the reader opens the callout detail dialog, **Then** the header meta and any summary card meta for the same callout show the same publisher and publish date.

---

### User Story 2 - Reader sees attribution on draft callouts (Priority: P2)

A space admin is reviewing draft callouts that have not yet been published. Drafts have no publisher and no publish date. The meta line for a draft callout should fall back to showing the creator's name and the creation date so the admin can still see who drafted it and when — instead of seeing a blank or partial meta line (today the legacy UI shows the creator name but no date for drafts, which is inconsistent).

**Why this priority**: Drafts are a routine state — the meta must not become less informative because of this change. Falling back to creator + creation date keeps the information visible while still letting Story 1's primary rule apply once the callout is published.

**Independent Test**: Create or open a draft callout. Verify the meta line in both UIs shows the creator's name and the creation date — no blank field, no missing date.

**Acceptance Scenarios**:

1. **Given** a draft callout (no publisher, no publish date), **When** the admin views it in either UI, **Then** the meta shows the creator's name and the creation date.
2. **Given** a draft callout, **When** the admin publishes it (the callout now has a publisher and publish date), **Then** the meta switches to show the publisher and publish date the next time the page loads or refetches.

---

### Edge Cases

- **Draft with no publisher and no publish date** — both fields fall back: meta shows creator and creation date (Story 2).
- **Published callout where publisher equals creator** — meta shows that single person and the publish date; no duplication.
- **Partial data — publisher missing but publish date present** (e.g. a callout published by an automated process or by a user whose account has since been removed) — name field falls back to the creator while the date field continues to use the publish date (per FR-002, fallbacks are independent).
- **Partial data — publisher present but publish date missing** (rare, indicates inconsistent backend data) — name field uses the publisher while the date field falls back to the creation date (per FR-002).
- **Callout with a publisher but the publisher's profile is missing** (e.g. account deleted, profile not loaded) — the existing "no author" rendering rule applies (the meta hides the author segment), same as current behaviour for missing creators.
- **Post / whiteboard / memo contribution cards inside a callout** — out of scope. These remain unchanged; they continue to show the contribution's creator and creation date (these entities have no separate publisher concept in the data).
- **Comments / messages, calendar events** — out of scope; unaffected by this change.
- **CRD callout search-result cards** — **in scope** (revised). Today these hard-code the author to `Unknown` and leave the date empty because the relevant fields are not queried by the search GraphQL fragment. The fragment will be extended to query `publishedBy`, `publishedDate`, `createdBy`, and `createdDate` on the search-result callout, and the mapper will apply the same fallback rule as the other surfaces. The `Unknown` label remains as the last-resort fallback when both publisher and creator are absent — consistent with how whiteboard, memo, and post search results already behave.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Callout meta MUST display the publisher's name when a publisher exists, and the publish date when a publish date exists.
- **FR-002**: The two fields MUST fall back independently: when the publisher is absent the name MUST fall back to the creator; when the publish date is absent the date MUST fall back to the creation date. A callout with neither — i.e. a draft — therefore shows creator + creation date for both.
- **FR-003**: The rule in FR-001/FR-002 MUST be applied consistently in every callout-meta surface, including: the MUI callout-dialog header, the CRD callout summary cards in space tabs, the CRD callout detail dialog, and the CRD callout search-result cards. For search-result cards specifically, the existing `Unknown` label MUST remain only as a last-resort fallback for callouts with neither a publisher nor a creator (matching the behaviour already used for whiteboard, memo, and post search results).
- **FR-004**: The rule MUST behave identically in both the legacy interface and the new CRD interface.
- **FR-005**: The visual presentation of the meta line (avatar, name, separator, formatted date) MUST be unchanged from current behaviour — only the underlying person and date being displayed change.
- **FR-006**: Post, whiteboard, and memo contribution cards inside a callout MUST remain unchanged: they continue to show the contribution's creator and creation date.
- **FR-007**: Comment / message author lines and calendar event author lines MUST remain unchanged.

### Key Entities

- **Callout**: A unit of content posted to a space. Has a *creator* (the user who initially drafted it) and, once published, a *publisher* (the user who made it visible to the community). Has a *creation date* and, once published, a *publish date*. Publisher and publish date are absent while the callout is in draft.
- **Callout draft**: A callout in the unpublished state — no publisher, no publish date.
- **Post / Whiteboard / Memo contribution**: A unit of content contributed inside a callout. Has only a creator and creation date — no separate publisher concept. Out of scope for this change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of callout-meta surfaces in both UIs (the MUI callout-dialog header, the CRD callout summary cards, the CRD callout detail dialog, and the CRD callout search-result cards) show the publisher and publish date when the callout has been published.
- **SC-002**: 100% of draft callouts show the creator and creation date as a fallback in both UIs (no blank or partially populated meta lines).
- **SC-003**: For a sample of callouts where the publisher differs from the creator, a reader can correctly identify the publisher from the meta in under 5 seconds without opening the callout's settings or history.
- **SC-004**: No regression in any other meta line: post / whiteboard / memo contribution cards, comments, messages, and calendar events display the same name and date they displayed before this change.
