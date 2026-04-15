# Feature Specification: CRD Space Timeline / Calendar / Events

**Feature Branch**: `086-crd-space-timeline`
**Created**: 2026-04-15
**Status**: Draft
**Input**: User description: "Migrate the Space Timeline / Calendar / Events feature from MUI to the CRD design system. Preserve all capabilities of the MUI version: a calendar that previews and highlights events (including multi-day spans), a list of events with deeplinks, full create/edit form (do not skip fields), the ability to share events to the parent space (and in the future to child spaces), event detail with comments, and ICS / Google / Outlook export. The UI surface is a modal dialog mirroring the existing MUI flow and preserving its deeplink schema."

## Clarifications

### Session 2026-04-15

- Q: How should the timeline behave on phone-sized viewports? → A: Full-screen sheet on phones (calendar collapsed behind a date trigger; list and detail stack vertically); modal dialog on tablet+.
- Q: How should event times be stored and displayed across time zones? → A: Store in UTC (existing GraphQL behaviour), display in the viewer's local browser time. No per-space or per-event time-zone configuration in v1.
- Q: How should the event author and creation date be displayed in the detail view? → A: Author avatar + name + creation date as a small caption near the event title (MUI parity).
- Q: How should subspace events surface on the parent calendar? → A: Interleaved chronologically with parent events; subspace name shown as a chip on the card; calendar marker uses the same colour as the parent's own events.
- Q: What should the user see while events are loading on dialog open? → A: Calendar shell rendered immediately; right pane shows 3–5 skeleton list rows; calendar markers fade in when data arrives.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse a space's upcoming events from the dashboard sidebar (Priority: P1)

A space member opens a space dashboard and sees the next few upcoming events in the sidebar's Events panel. They can click "Show calendar" to open the full timeline, or — if they have permission — click "+" to start creating a new event. The sidebar list, the empty state, and both buttons must be functional in the new CRD dashboard exactly as they are in the legacy dashboard.

**Why this priority**: Today the CRD dashboard ships a placeholder Events panel whose buttons do nothing. This is a visible regression vs. the legacy dashboard and blocks any further timeline work. Fixing it restores feature parity for the most common entry point (passive discovery of upcoming events).

**Independent Test**: Open a space with at least one upcoming event in the CRD dashboard. Confirm the sidebar panel shows the next three future events with their dates, that "Show calendar" opens the full calendar view, and that the "+" button (for users with create permission) opens the new-event form.

**Acceptance Scenarios**:

1. **Given** a space with three or more future events, **When** the dashboard loads, **Then** the sidebar Events panel lists the next three in ascending date order with each event's title and a human-readable date.
2. **Given** a space with no upcoming events, **When** the dashboard loads, **Then** the sidebar Events panel shows an empty-state message ("No upcoming events").
3. **Given** the panel is rendered, **When** the user clicks "Show calendar", **Then** the timeline opens in list view and the URL reflects this so the view is bookmarkable.
4. **Given** the user has permission to create events, **When** they click the "+" button, **Then** the timeline opens in create mode with an empty event form; users without create permission do not see the "+" button.

---

### User Story 2 — Browse, filter and deeplink to events in the timeline view (Priority: P1)

A space member opens the timeline and sees a calendar on one side and a chronological list of events on the other. Days that contain events are visually marked, including multi-day spans. Clicking a marked day filters the list to events on that day and bookmark-friendly URL params reflect the selection. The user can share a link to the timeline, to a specific date, or to a specific event, and the receiver lands in the right view.

**Why this priority**: Browsing and sharing events are the core "consume" actions on the timeline. They must work regardless of whether the user can create events. Without this story, the feature has no readable surface.

**Independent Test**: Open the timeline in a space with multiple events including a multi-day event. Verify calendar markers, hover tooltips, and the upcoming/past list. Click a marked day and confirm the URL gains a `?highlight=YYYY-MM-DD` parameter and the matching event scrolls into view. Open a deeplink URL in a fresh tab and confirm the same view.

**Acceptance Scenarios**:

1. **Given** a space has events on several days including a multi-day span, **When** the timeline opens, **Then** the calendar marks each event's start day, end day, and every day in between, and past dates are visually de-emphasised.
2. **Given** a calendar day is marked with one or more events, **When** the user hovers or focuses that day, **Then** a tooltip shows each event's start time (or "Whole day") followed by the event title.
3. **Given** the user clicks a marked day, **When** the click is processed, **Then** the URL is updated with `?highlight=YYYY-MM-DD`, the right-side list scrolls to the first event on that day, and that event is visually highlighted.
4. **Given** events exist, **When** the timeline opens, **Then** future events appear in ascending order; past events appear under a "Past events" heading in descending order.
5. **Given** the user opens a URL of the form `<space>/calendar?highlight=2026-04-15` directly, **When** the page loads, **Then** the timeline opens in list view with that day highlighted.
6. **Given** the user clicks an event card, **When** the navigation completes, **Then** the URL becomes `<space>/calendar/<event-name-id>` and the event detail view is shown.

---

### User Story 3 — View an event's full details and discuss it (Priority: P1)

A space member opens an event from the list (or via a shared link) and sees the full detail: banner image, title, date and time, location, type, tags, references and a markdown-rendered description. If they have read access to comments they see the discussion thread; if they have post access they can post comments and replies, react with emojis, and delete their own messages.

**Why this priority**: Detail is the natural destination from any list interaction or external share. Without it, the deeplinks in story 2 are broken. Comments are a parity requirement vs. the MUI version.

**Independent Test**: Open an event with a banner, description, references, tags, and existing comments. Verify all fields render. Post a comment, then a reply, then delete the comment. Verify reactions work both ways.

**Acceptance Scenarios**:

1. **Given** an event has a banner image, **When** the detail view opens, **Then** the banner appears at the top of the page; **And** when the event has no banner image, a deterministic colour gradient derived from the event's identity is shown instead.
2. **Given** the event description contains markdown, **When** the detail view loads, **Then** the description renders with formatting and any links are clickable.
3. **Given** the user has comments-read permission, **When** the detail view loads, **Then** the comments column shows the thread and the comment count; **And** when the user has comments-post permission, an input is visible at the bottom.
4. **Given** the user has comments-post permission, **When** they post a comment, reply to a comment, react to a comment, or remove a reaction, **Then** the change appears in the thread.
5. **Given** the user has permission to delete their own comments, **When** they delete one, **Then** it disappears from the thread.
6. **Given** the user has edit permission for the event, **When** they click "Edit", **Then** the form opens pre-filled with the current values.
7. **Given** the user clicks "Back", **When** the navigation completes, **Then** the URL returns to `<space>/calendar` and the list view is shown.

---

### User Story 4 — Create or edit an event using the modernised form (Priority: P1)

A space lead or admin clicks "+" (from the sidebar or the timeline) and fills in the event form. The form supports the same fields as the legacy version — title, type, start date, start time (or "whole day"), end date, end time *or* duration (when same day), description (markdown), location (city), tags (free-form). On a subspace, an additional toggle controls whether the event is visible on the parent space's calendar. Saving creates (or updates) the event and returns the user to the appropriate view. Editing an existing event uses the same form pre-filled.

**Why this priority**: Without create/edit, the timeline is read-only — and a regression vs. MUI. The "share to parent space" toggle is a long-standing requirement that must not be dropped. The form may be modernised visually but every field must remain.

**Independent Test**: As a user with create permission, open the create form, fill the required fields, save, and verify the new event appears in the list and on the calendar at the expected day. Open the same event for editing, change one field, save, and verify the change is reflected.

**Acceptance Scenarios**:

1. **Given** the create form is open, **When** the user submits without a title or without a type, **Then** validation errors appear and submission is blocked.
2. **Given** the start date is selected, **When** the user selects an end date that is the same day, **Then** the form shows a duration field (in minutes); **And** when the end date is later, the form shows an end-time field instead.
3. **Given** the "whole day" toggle is on, **When** the form is rendered, **Then** the time fields are disabled and the saved event is marked as a whole-day event.
4. **Given** the user is editing an event in a subspace, **When** the form loads, **Then** the "Visible on parent calendar" toggle is shown; its current value is reflected and any change persists on save.
5. **Given** the user is editing an event in a top-level space (not a subspace), **When** the form loads, **Then** the "Visible on parent calendar" toggle is hidden.
6. **Given** the user submits a valid create form, **When** the request succeeds, **Then** the dialog navigates to the new event's detail view; **And** when the user submits an edit, **Then** the dialog returns to the previous view.
7. **Given** the user opens the create form via the sidebar "+" button, **When** the dialog opens, **Then** the URL gains a `?new=1` parameter and the form is empty.
8. **Given** the user cancels or closes the form, **When** the dialog closes, **Then** any in-progress changes are discarded and the URL params for "create" or "edit" are cleared.

---

### User Story 5 — Delete an event (Priority: P2)

A user with delete permission opens an event for editing and chooses to delete it. After confirmation, the event is removed from the calendar and from any visible list (including on the parent space if it had been shared).

**Why this priority**: Necessary for full lifecycle parity with MUI but rarer than create/edit. Can be deferred behind the read/create P1 stories.

**Independent Test**: Edit an event you authored, click delete, confirm, and verify the event no longer appears in the list, on the calendar, or on a parent space's calendar (if it had been visible there).

**Acceptance Scenarios**:

1. **Given** the user is editing an event and has delete permission, **When** they click "Delete", **Then** a confirmation prompt appears identifying the event by title.
2. **Given** the confirmation is shown, **When** the user confirms, **Then** the event is deleted, the dialog returns to the list view, and the event is no longer visible.
3. **Given** the confirmation is shown, **When** the user cancels, **Then** the form remains open with no changes.

---

### User Story 6 — Add an event to an external calendar (Priority: P2)

While viewing an event's details, the user can add the event to Google Calendar, Outlook Calendar, or download an iCalendar (`.ics`) file. From the timeline list, they can also export all upcoming events as a single `.ics` file.

**Why this priority**: Useful but secondary to viewing/creating. The legacy version supports this and removing it would be a feature regression.

**Independent Test**: Open an event detail, open the "Add to calendar" menu, and verify each option opens the right destination (Google in a new tab, Outlook in a new tab, ICS download). From the timeline list, click the export-all icon and verify a single `.ics` file with all upcoming events downloads and parses in a desktop calendar app.

**Acceptance Scenarios**:

1. **Given** the user is viewing an event detail, **When** they open the "Add to calendar" menu, **Then** Google, Outlook, and ICS options are presented.
2. **Given** the menu is open, **When** the user picks Google or Outlook, **Then** a new browser tab opens at the appropriate "add event" URL; **And** when they pick ICS, a file containing the event downloads.
3. **Given** the timeline list view is open and there is at least one upcoming event, **When** the user triggers "Export upcoming events", **Then** a single `.ics` file containing all upcoming events downloads with a date-stamped filename.

---

### User Story 7 — Share a subspace event with the parent space (Priority: P2)

A user editing an event inside a subspace can mark it as visible on the parent space's calendar. The event then appears on the parent calendar in addition to the subspace calendar. Toggling the flag off removes it from the parent calendar without affecting the event itself.

**Why this priority**: Parity with the MUI version's existing capability and an explicit user requirement; only meaningful when subspaces exist, so it ranks below the always-applicable list/detail/create stories.

**Independent Test**: In a subspace with an event, edit the event, enable "Visible on parent calendar", save, and confirm the event now appears in the parent space's calendar. Toggle off, save, and confirm the event disappears from the parent calendar but remains in the subspace.

**Acceptance Scenarios**:

1. **Given** a subspace event has the parent-visibility flag turned on, **When** a member of the parent space opens the parent calendar, **Then** the event appears there.
2. **Given** the parent-visibility flag is later turned off, **When** the parent calendar reloads, **Then** the event no longer appears there but remains in the subspace calendar.

---

### Edge Cases

- **No backend permission to read events**: the sidebar Events panel and the calendar dialog are not shown (or show a permission-aware empty state).
- **No upcoming events but past events exist**: the calendar list view shows an empty "no upcoming events" message above the past events section; the sidebar shows the empty state.
- **Long event titles in the calendar tooltip**: titles wrap or truncate gracefully; the tooltip's max width is bounded.
- **Multi-day event that crosses month boundaries**: the calendar marker spans correctly when navigating between months.
- **Multiple events on the same day**: the day's tooltip lists them all in start-time order; the calendar marker indicates "has events" without trying to render each one individually.
- **End date before start date** (form input): the form auto-corrects the end date to match the start date and validation prevents save until the user resolves it.
- **"Whole day" + non-zero duration**: when "whole day" is on, duration and time fields are disabled and ignored on save.
- **Event with no description / no tags / no references**: those sections of the detail view are hidden or show an unobtrusive empty state.
- **User loses comment-post permission while the dialog is open**: posting fails gracefully with a permission error and the input becomes inert.
- **Network failure during create / update / delete**: the user sees an error, the dialog stays open, and no partial state is left behind.
- **Bookmark / shared link to a deleted event**: opening the URL shows a "not found" state inside the dialog and a way back to the list.
- **Locale change while the dialog is open**: visible labels update and the calendar's month / weekday names switch to the new locale.
- **Large calendars** (hundreds of events): the calendar view scrolls smoothly; the list pane uses a scroll container; the calendar marker computation does not cause noticeable jank.
- **Daylight-saving transitions** spanning an event's start/end: the displayed local time is consistent with the user's timezone and the event boundaries do not shift.
- **Anonymous / unauthenticated user reaching the timeline**: read-only view if backend permits; otherwise redirected to the public-facing about page (matching existing app behaviour).

## Requirements *(mandatory)*

### Functional Requirements

#### Sidebar Events panel

- **FR-001**: The CRD dashboard sidebar Events panel MUST display the next three upcoming events for the current space, in ascending date order, with each row showing the event title and a human-readable, locale-aware date label (e.g., "Today", "Tomorrow", "in 3 days", "Apr 30").
- **FR-002**: When there are no upcoming events, the panel MUST show an empty-state message instead of the list.
- **FR-003**: A "Show calendar" link MUST open the full timeline in list view and reflect that view in the URL.
- **FR-004**: A "+" button MUST be visible only to users with permission to create events; clicking it MUST open the timeline in create mode.

#### Timeline list view (calendar + list)

- **FR-005**: The timeline list view MUST present a month-grid calendar alongside a chronological list of events.
- **FR-006**: Days that contain at least one event MUST be visually marked. For multi-day events, the marker MUST visually distinguish the start day, the end day, and the days in between.
- **FR-007**: Past dates MUST be visually de-emphasised relative to today and future dates.
- **FR-008**: Hovering or focusing a marked day MUST reveal a tooltip listing every event on that day, with each entry showing the event's start time (or "Whole day") followed by the title.
- **FR-009**: Clicking a marked day MUST update the URL with a `?highlight=YYYY-MM-DD` parameter, scroll the right-side list to the first event on that day, and visually highlight that event in the list.
- **FR-010**: The list pane MUST split events into "Upcoming" (ascending) and "Past events" (descending) sections, with the past-events heading visible only when past events exist.
- **FR-011**: Each event in the list MUST be clickable and MUST navigate to the event detail view with a deeplinkable URL of the form `<space>/calendar/<event-name-id>`.
- **FR-012**: Each event card MUST display the event's date badge, title, key meta (date / time / duration / type / subspace name when applicable), and a truncated preview of the description.
- **FR-013**: When the timeline opens directly from a deeplink containing `?highlight=`, `?new=1`, or `/<event-name-id>`, the corresponding view (highlighted day, create form, or detail) MUST be rendered without any additional user action.
- **FR-013a**: While the events query is still in flight after the dialog opens, the timeline MUST render the calendar shell (month grid with current-month navigation) and 3–5 skeleton placeholders in the event-list pane. Calendar markers MUST appear once event data arrives. The detail view, when reached during loading, MUST show a banner placeholder, a title placeholder, and a description skeleton until the event detail query resolves.

#### Event detail view

- **FR-014**: The event detail view MUST show banner image, title, start date, start time (or "Whole day"), end date or end time, duration, type, subspace name (when the event belongs to a subspace), location, tags, references and the markdown-rendered description.
- **FR-014a**: The event detail view MUST display attribution near the title, consisting of the author's avatar, the author's display name, and the event's creation date in the viewer's local time zone (formatted in the user's currently selected language). When the author has no avatar, the avatar fallback MUST follow the same deterministic-colour rule used elsewhere in the design system.
- **FR-015**: When no banner image is available, a deterministic colour gradient derived from the event's identity MUST be shown so the same event always presents the same fallback colour.
- **FR-016**: Comments MUST be displayed in a side column when the user has read access to the comments room, with the message count visible in the section title.
- **FR-017**: When the user has post-message permission, a comment input MUST be shown and the user MUST be able to post comments, post replies to existing comments, react to comments with emoji and remove their own reactions.
- **FR-018**: When the user has delete permission for a given message (their own message or platform-level delete), they MUST be able to delete that message.
- **FR-019**: The detail header MUST surface an "Add to calendar" action (Google, Outlook, ICS), an "Edit" action visible only to users with edit permission, and a "Back" action that returns to the list view.

#### Create / edit form

- **FR-020**: The create / edit form MUST include the following fields, none of which may be omitted: title (required), type (required, one of `Deadline`, `Event`, `Meeting`, `Milestone`, `Other`, `Training`), start date, start time, "whole day" toggle, end date, end time *or* duration (in minutes) — duration when start and end share the same day, end time when they don't, description (markdown), location (city), tags (free-form list), and "Visible on parent calendar" (subspace events only).
- **FR-021**: Validation MUST require: a non-empty title, a selected type, an end that is not before the start (whole-day events excepted), and a positive duration when start and end are the same day and the event is not whole-day.
- **FR-022**: When the start date and end date are the same day, the form MUST present a duration input; when they are different days, the form MUST present an end-time input. Toggling between these states MUST preserve consistent values where possible.
- **FR-023**: When "whole day" is enabled, time fields and duration MUST be disabled and the saved event MUST be marked as whole-day.
- **FR-024**: The "Visible on parent calendar" toggle MUST be shown only for events that belong to a subspace and MUST default to the event's stored value (off for new events).
- **FR-025**: A successful create MUST navigate the dialog to the newly created event's detail view; a successful edit MUST return the dialog to the previous view (detail or list).
- **FR-026**: Cancelling or closing the form MUST discard in-progress changes and clear any URL parameters specific to "create" or "edit" mode.
- **FR-027**: A user without the corresponding permission MUST NOT see the "Edit" or "Create" entry points.

#### Delete

- **FR-028**: A user with delete permission for an event MUST be able to delete it from the edit view via a confirmation prompt that names the event.
- **FR-029**: Confirming deletion MUST permanently remove the event from the space's calendar and from the parent space's calendar when the event was visible there; the dialog MUST then return to the list view.

#### External calendar export

- **FR-030**: The event detail view MUST allow the user to add the event to Google Calendar, Outlook Calendar or download it as an iCalendar (`.ics`) file.
- **FR-031**: The Google and Outlook actions MUST open the external service in a new browser tab; the ICS action MUST download a single-event `.ics` file.
- **FR-032**: The timeline list view MUST allow the user to export all upcoming events as a single `.ics` file with a date-stamped filename, when at least one upcoming event exists.

#### Parent / subspace visibility

- **FR-033**: Events in a subspace marked "Visible on parent calendar" MUST appear on the parent space's calendar in addition to the subspace's calendar.
- **FR-034**: Toggling the flag off MUST remove the event from the parent calendar without affecting the subspace event itself.
- **FR-035**: When viewing the parent space's timeline, events that originate from a subspace MUST appear interleaved chronologically with the parent's own events (in the same Upcoming / Past sections, sorted by date). Each subspace-originating event card MUST display a small chip identifying the subspace name (e.g., "in {Subspace Name}"). The calendar grid markers for subspace events MUST use the same visual treatment (colour, shape) as the parent's own events — the chip on the list card is the sole differentiator.

#### Routing & URL state

- **FR-036**: The feature MUST preserve the existing deeplink schema:
  - `<space>/calendar` opens the timeline in list view.
  - `<space>/calendar?highlight=YYYY-MM-DD` opens the list view with the given day highlighted.
  - `<space>/calendar?new=1` opens the create form.
  - `<space>/calendar/<event-name-id>` opens the event detail view.
- **FR-037**: Closing the timeline dialog MUST strip the calendar-specific URL state (path segment and query parameters) so subsequent shares of the URL do not re-open the dialog.

#### Localisation & accessibility

- **FR-038**: Every user-visible string in the new components MUST be localised. The set of supported languages MUST match the rest of the CRD design system (currently English, Dutch, Spanish, Bulgarian, German, French).
- **FR-039**: Calendar month names, weekday names and date formats MUST follow the user's currently selected language.
- **FR-039a**: Event start and end times MUST be displayed in the viewer's local browser time zone. The underlying timestamps remain stored in UTC (no schema change). The same event displayed to viewers in different time zones MUST therefore show different wall-clock times, each consistent with that viewer's local zone.
- **FR-040**: All interactive elements (calendar cells, event cards, form fields, dialog actions, comment actions) MUST be reachable and operable by keyboard alone.
- **FR-041**: All icon-only buttons MUST expose an accessible name; decorative icons MUST be hidden from assistive technology.
- **FR-042**: The dialog MUST trap focus while open and restore focus to the trigger element when closed.

#### Responsive layout

- **FR-042a**: On tablet and desktop viewports (≥768px), the timeline MUST render as a centred modal dialog with the calendar and event list shown side-by-side in list view, and the event banner/body and comments shown side-by-side in detail view.
- **FR-042b**: On phone-sized viewports (<768px), the timeline MUST render as a full-screen sheet. In list view, the calendar MUST be collapsed behind a date-picker trigger above the event list; opening the trigger reveals the calendar in a popover or expanded panel and selecting a date collapses it again. In detail view, the banner/body and comments MUST stack vertically. The create/edit form MUST stack all rows vertically.

#### Compatibility

- **FR-043**: While the legacy MUI dashboard is still selectable via the existing CRD feature toggle, the legacy timeline (MUI dialog and dashboard calendar section) MUST continue to function unchanged, so users who opt out of CRD see no regression.

### Key Entities *(include if feature involves data)*

- **Calendar event**: A scheduled item within a space's calendar. Carries title, type, start instant, duration, "whole day" flag, description (markdown), location, tags, references, optional banner image, parent-visibility flag, creator, creation date, and an associated comments room. Belongs to exactly one space (or subspace) and may be made visible on the parent space's calendar.
- **Calendar**: The collection of events for a single space. Has its own permission set determining who may read, create, edit and delete events and who may export.
- **Event comment**: A message posted to an event's discussion thread. May be a reply to another comment. Carries author, body, timestamp and a set of reactions. Permission to read, post, react and delete is governed by the comments room's authorization.
- **Permission set (per calendar)**: The current user's privileges relative to the calendar — read events, create events, edit events, delete events, and post / read / delete / react on event comments.
- **External-calendar links**: For a given event, the URLs to add it to Google Calendar, to add it to Outlook Calendar, and to download it as an `.ics` file.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the legacy MUI timeline's user-visible capabilities (calendar preview with multi-day highlighting, deeplinkable list, deeplinkable detail with comments, full create/edit form including share-to-parent toggle, delete with confirmation, external calendar export, batch ICS export) are available in the CRD timeline.
- **SC-002**: A user with create permission can create a new event end-to-end — from clicking the sidebar "+" to seeing the new event on the calendar — in under 60 seconds, with no more than the existing eight form fields.
- **SC-003**: All four deeplink URL patterns (`/calendar`, `?highlight=`, `?new=1`, `/calendar/{event-name-id}`) open in the correct view on first load when pasted into a fresh browser tab.
- **SC-004**: Sidebar Events panel renders within the same time budget as the rest of the dashboard sidebar (no additional perceived load) when the dashboard contains up to 100 events.
- **SC-005**: Switching the application language updates every timeline label (sidebar, calendar headings, list section titles, form fields, validation messages, dialog actions, tooltip text) without a page reload, in the same six languages already supported by the CRD design system.
- **SC-006**: Keyboard-only users can complete every flow in stories 1–6 (browse, deeplink, view detail, comment, create, edit, delete, export) without using a pointer device.
- **SC-007**: Subspace events marked "Visible on parent calendar" appear on the parent calendar within one refresh of the parent space's timeline; toggling off removes them within the same refresh.
- **SC-008**: While the CRD feature toggle is off, the legacy MUI timeline continues to operate identically to its current behaviour (zero regressions on the legacy code path).
- **SC-009**: An exported single-event `.ics` file and an exported batch `.ics` file both import successfully into at least two mainstream desktop calendar applications without manual editing.
- **SC-010**: At least 90% of users with create permission successfully complete a first event creation on their first attempt (validated post-launch via support-ticket and form-abandonment metrics).
