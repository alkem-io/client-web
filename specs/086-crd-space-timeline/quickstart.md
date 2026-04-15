# Quickstart: CRD Space Timeline

How to set up a local environment and walk through every user story end-to-end.

## Prerequisites

- Node ≥ 22 (Volta-pinned to 24.14.0)
- pnpm ≥ 10.17.1
- Alkemio backend running at `localhost:3000` (existing developer setup)

## Initial setup

```bash
git checkout 086-crd-space-timeline
pnpm install      # picks up new react-day-picker + date-fns once package.json lands
pnpm start        # dev server at http://localhost:3001
```

Enable the CRD feature toggle in the browser console once:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

(Disable later with `localStorage.removeItem('alkemio-crd-enabled')`.)

## Test data

For full coverage, use a space (or create one) that has:

- At least 5 future events (multiple types: at least one Meeting, one Deadline)
- At least 1 multi-day event
- At least 1 past event
- At least 1 event with a banner image
- At least 1 event with comments
- At least 1 subspace with its own events, including one marked `visibleOnParentCalendar=true`

If your dev environment is sparse, create events via the legacy MUI dashboard first (the CRD feature still uses the same backend), then enable CRD to test the new UI.

## Walkthroughs

Each story corresponds to a numbered story in `spec.md`. Stories 1–4 are P1; stories 5–7 are P2.

### Story 1 — Sidebar Events panel (P1)

1. Open a CRD-enabled space dashboard.
2. **Verify**: the sidebar's Events panel shows up to 3 upcoming events with title + relative date ("Today" / "Tomorrow" / "in N days" / "Apr 30").
3. **Verify**: with no upcoming events, the panel shows the empty-state.
4. Click **Show calendar**: the URL changes to `<space>/calendar` and the timeline opens in list view.
5. With a `canCreateEvents` user, click **+**: URL becomes `<space>/calendar?new=1` and the create form opens.
6. With a non-`canCreateEvents` user, the **+** button is absent.

### Story 2 — Browse, filter and deeplink (P1)

1. From the dashboard, open the timeline (sidebar **Show calendar**).
2. **Verify**: calendar shows markers on every day with an event; multi-day events span correctly with rounded ends; past dates are muted.
3. Hover (or focus, with keyboard) a marked day. **Verify**: tooltip lists every event on that day with start time (or "Whole day") + title.
4. Click a marked day. **Verify**: URL gains `?highlight=YYYY-MM-DD`; the right pane scrolls to the first event of that day; that event row gets a `ring-2 ring-primary` highlight.
5. Confirm sectioning: **Upcoming** ascending; **Past events** descending and only present when past events exist.
6. Open `<space>/calendar?highlight=2026-04-15` directly in a new tab. **Verify**: timeline opens with that day highlighted.
7. Click any event card. **Verify**: URL becomes `<space>/calendar/<event-name-id>` and detail view loads.

### Story 3 — Event detail + comments (P1)

1. Open an event detail (from list or via deeplink).
2. **Verify**: banner image renders when present; otherwise the deterministic gradient fallback (verify by reloading — same colour each time).
3. **Verify**: title; author avatar + name + creation date caption near the title; tags; references; markdown description renders correctly.
4. With `canReadComments`, **verify**: comments column appears with thread + count.
5. With `canPostComments`, post a comment, then a reply, then a reaction. **Verify**: each appears immediately in the thread.
6. Delete your own comment. **Verify**: it disappears.
7. Click **Edit** (when `canEditEvents`). **Verify**: form opens pre-filled with current values.
8. Click **Back**. **Verify**: URL returns to `<space>/calendar`.

### Story 4 — Create / edit form (P1)

#### Create
1. Click sidebar **+** (or timeline **+**). **Verify** URL has `?new=1` and form is empty.
2. Try submitting empty: title-required and type-required errors show.
3. Fill title, pick type, set start date, leave end date same day. **Verify**: a duration field appears (in minutes).
4. Change end date to a later day. **Verify**: duration field is replaced by an end-time field.
5. Toggle **Whole day** on. **Verify**: time fields and duration are disabled.
6. Add markdown to description (e.g., `**bold** and [link](https://example.com)`).
7. Add tags via the tags input.
8. Set `location.city`.
9. Submit. **Verify**: URL navigates to `<space>/calendar/<new-event-name-id>` and detail view shows the new event with all fields preserved.

#### Subspace create
1. Inside a subspace dashboard (CRD enabled), open the timeline and **+**.
2. **Verify**: **Visible on parent calendar** toggle appears.
3. Toggle on, save. **Verify**: event appears on the parent space's CRD timeline as well, with an "in {Subspace}" chip on the card. Calendar marker uses the same colour as the parent's own events.
4. Toggle off, save. **Verify**: event disappears from the parent calendar but remains in the subspace.

#### Edit
1. Open an event detail and click **Edit**.
2. Change one field, save. **Verify**: dialog returns to detail view (or list view if you reached edit from list); change is reflected.
3. Open edit form again and click **Cancel** / **Back**. **Verify**: dialog closes (or returns) without saving.

### Story 5 — Delete (P2)

1. Open an event in edit mode (must have `canDeleteEvents`).
2. Click **Delete**. **Verify**: AlertDialog appears with the event title in the body.
3. Confirm. **Verify**: dialog returns to list view and event no longer appears on calendar / list / parent calendar.
4. Repeat and click **Cancel** to verify the form remains open.

### Story 6 — External calendar export (P2)

#### Per-event
1. Open an event detail.
2. Open the **Add to calendar** menu. **Verify**: the dropdown is empty until first open (DevTools Network shows `CalendarEventImportUrls` query firing on first open).
3. Click **Google Calendar**: a new tab opens to Google's "add event" URL with prefilled data.
4. Click **Outlook Calendar**: a new tab opens to Outlook.
5. Click **Download ICS**: a single-event `.ics` file downloads. Open it in macOS Calendar / Outlook to verify.

#### Batch
1. From the timeline list view (with at least one upcoming event), trigger **Export upcoming events** (icon button in the right-pane top bar).
2. **Verify**: a single `alkemio-events-YYYY-MM-DD.ics` file downloads with all upcoming events.
3. Open it in two desktop calendar apps to verify it parses (per SC-009).

### Story 7 — Subspace event sharing (covered above in Story 4 Subspace create)

## Responsive (mobile) walkthrough

In Chrome DevTools, switch to a phone preset (e.g., iPhone 14 Pro, 393×852).

1. Reload a CRD-enabled space dashboard.
2. Click sidebar **Show calendar**. **Verify**: timeline opens as a full-screen Sheet.
3. **Verify**: in list view, the calendar is collapsed behind a "Pick a date" trigger above the list. Tap to expand the calendar; pick a date; calendar collapses; list scrolls.
4. Open an event detail. **Verify**: banner + body stack vertically followed by comments below.
5. Open the create form. **Verify**: every row stacks vertically.
6. Verify the **Add to calendar** dropdown still works inside the Sheet (no double-modal stacking issues).

## Accessibility walkthrough

1. With keyboard only, complete each of stories 1–6: open the dialog, navigate the calendar with arrow keys, focus and click event cards (Enter), open the edit form, fill it, submit, post a comment, open the AddToCalendar dropdown, export ICS.
2. **Verify**: visible focus rings on every focusable element; focus is trapped while the dialog is open; focus returns to the trigger button on close.
3. **Verify**: every icon-only button has an accessible name (use VoiceOver / NVDA: announce should include the button purpose, not just "button").
4. **Verify**: the calendar grid announces day names and selected state correctly.

## i18n walkthrough

Switch language via the existing language selector to NL / ES / BG / DE / FR.

1. **Verify**: every visible label updates without a page reload.
2. **Verify**: calendar month names and weekday names switch to the new locale.
3. **Verify**: the relative-date sidebar labels ("Today" / "Tomorrow" / "in N days") localize.
4. **Verify**: validation messages localize.

## Static checks before opening a PR

```bash
pnpm lint                     # tsc + biome + eslint
pnpm vitest run               # unit tests
pnpm build                    # production build (sanity check; ~20s)
```

## Things to inspect during review

- The Apollo `useSpaceCalendarEventsQuery` fires only once per dashboard load (not twice — sidebar + dialog should share via cache).
- The `CalendarEventImportUrls` query fires only on first dropdown open per event detail.
- Closing the dialog cleanly strips `?highlight=`, `?new=1`, and the `/calendar` path so the URL is bookmarkable on the dashboard.
- The legacy MUI dashboard route still works when `localStorage.removeItem('alkemio-crd-enabled')` is run — the legacy `CalendarDialog` and `DashboardCalendarSection` should be untouched (per FR-043).
