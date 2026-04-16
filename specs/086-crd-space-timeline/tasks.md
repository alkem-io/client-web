# Tasks: CRD Space Timeline / Calendar / Events

**Input**: Design documents from `/specs/086-crd-space-timeline/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not requested in the spec. The CRD migration relies on manual end-to-end verification per `quickstart.md`. Existing Vitest suite (`pnpm vitest run`) catches regressions in unrelated code paths but no new test files are required.

**Organization**: Tasks are grouped by user story (P1: stories 1–4, P2: stories 5–7) so each story can be implemented and verified incrementally. Setup + Foundational phases come first because every story relies on the dialog shell, the URL state hook and the data mapper module being in place.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Include exact file paths in descriptions

## Path Conventions

- **CRD presentational layer**: `src/crd/` (no MUI / Apollo / domain imports)
- **Connector layer**: `src/main/crdPages/space/timeline/` (free to import Apollo, domain hooks, react-router-dom)
- **Domain layer (reused, untouched)**: `src/domain/timeline/calendar/`
- **i18n**: `src/crd/i18n/space/`
- **Routing**: `src/main/crdPages/space/routing/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, port the calendar primitive, lay down i18n keys, and scaffold the data-mapper module.

- [X] T001 Add `react-day-picker@^8` and `date-fns` (latest compatible) to `dependencies` in `/Users/borislavkolev/WebstormProjects/client-web/package.json`; run `pnpm install` to update `pnpm-lock.yaml`. Do NOT remove `react-calendar` (the legacy MUI `FullCalendar.tsx` still depends on it; it is retired with the CRD feature toggle in a later phase).
- [X] T002 [P] Create `/Users/borislavkolev/WebstormProjects/client-web/src/crd/primitives/calendar.tsx` by porting `prototype/src/app/components/ui/calendar.tsx`: import `cn` from `@/crd/lib/utils`, `buttonVariants` from `@/crd/primitives/button`, drop the `"use client"` directive, keep all DayPicker `classNames` mappings verbatim. No domain or MUI imports.
- [X] T003 [P] Add new keys to `/Users/borislavkolev/WebstormProjects/client-web/src/crd/i18n/space/space.en.json` under `calendar.*` (`title`, `addEvent`, `editEvent`, `noUpcomingEvents`, `pastEvents`, `deleteConfirm.{title,body,confirm,cancel}`, `back`, `save`, `cancel`, `fields.{displayName,type,date,startTime,endTime,duration,wholeDay,description,location,tags,visibleOnParentCalendar,endsAt}`, `validation.{displayNameRequired,typeRequired,invalidDuration,endBeforeStart,descriptionTooLong}`, `type.{DEADLINE,EVENT,MEETING,MILESTONE,OTHER,TRAINING}`, `addToCalendar.{trigger,google,outlook,ics,exportAll,loading}`, `calendarA11y.{previousMonth,nextMonth}`, `tooltip.wholeDayPrefix`, `details.{comments,references,tags,loadingEvent,subspaceLabel}`, `entity.{space,subspace}`, `notFound.{title,body,backToList}`) and under `sidebar.eventDateRelative.{today,tomorrow,in_days}`.
- [X] T004 [P] Mirror every key added in T003 to `/Users/borislavkolev/WebstormProjects/client-web/src/crd/i18n/space/space.{nl,es,bg,de,fr}.json`. Seed translations from the existing `src/core/i18n/{nl,es,bg,de,fr}/translation.{lang}.json`'s `calendar.*` keys where the same wording exists; otherwise translate manually (CRD i18n is AI-assisted, not Crowdin-managed).
- [X] T005 [P] Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts` as an empty module with file-level docstring and exported (but empty) function names: `mapCalendarEventInfoToSidebarItem`, `mapCalendarEventInfoToListItem`, `mapCalendarEventDetailsToDetailData`, `mapCalendarEventDetailsToFormValues`, `mapCalendarEventImportUrlsToLinks`, plus shared types from `contracts/crd-presentational.ts` (re-declared inline; no barrel imports). This unblocks subsequent story tasks that fill in the bodies.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stand up the URL state hook, the routing entries, the responsive `TimelineDialog` shell, and the top-level connector skeleton — these are required by US1 (URL navigation), US2 (list view shell), US3 (detail view), US4 (form), US5–US7. After this phase, the dialog opens (with placeholder content) when the URL says it should.

**⚠️ CRITICAL**: No user story implementation begins until Phase 2 is complete.

- [X] T006 Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/useCrdCalendarUrlState.ts` per `contracts/connector-hooks.ts`. Reads `?highlight=YYYY-MM-DD` and `?new=1` via `useSearchParams`; provides `navigateToList`, `navigateToCreate`, `navigateToHighlight`, `navigateToEvent`, `navigateAwayFromCalendar`. Re-declare `HIGHLIGHT_PARAM_NAME = 'highlight'`, `INIT_CREATING_EVENT_PARAM = 'new'`, `CALENDAR_PATH = '/calendar/'` locally with a code comment "must match values in `src/domain/timeline/calendar/CalendarDialog.tsx` until MUI removal". Use `dayjs(date).format('YYYY-MM-DD')` for outgoing serialisation and `dayjs(value).isValid()` for incoming validation.
- [X] T007 Add two protected sub-routes inside `<CrdSpaceProtectedRoutes>` in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/routing/CrdSpaceRoutes.tsx`: one with `path="calendar"` and one with `path={\`calendar/:${nameOfUrl.calendarEventNameId}\`}`. Both render the existing `<CrdSpaceTabbedPages />` so the URL resolver populates `calendarEventId`. Place them next to the existing `Collaboration/:calloutNameId` routes. No legacy redirects added — the existing `?section=N` query param still drives tab selection so the dashboard tab stays active.
- [X] T008 Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/TimelineDialog.tsx` per `contracts/crd-presentational.ts` (`TimelineDialogProps`). Use `useMediaQuery('(min-width: 768px)')` from `@/crd/hooks/useMediaQuery`: at ≥768px render `Dialog`+`DialogContent` from `@/crd/primitives/dialog` (centred modal, `max-w-3xl` default, `max-w-6xl` when `wide`); at <768px render `Sheet`+`SheetContent` from `@/crd/primitives/sheet` with `side="bottom"` and `h-[100dvh]` (full-screen). Sticky header (title + subtitle + headerActions slot + close X), scrollable body (children), sticky footer (footerActions slot when present). `aria-labelledby` wired to the title element. Focus trap and focus restoration handled by Radix.
- [X] T009 Create skeleton `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx` per `contracts/connector-hooks.ts` (`CrdCalendarDialogConnectorProps`). Calls `useUrlResolver` (`spaceId`, `parentSpaceId`, `calendarEventId`), `useCalendarEvents({ spaceId, parentSpaceId })` from `src/domain/timeline/calendar/useCalendarEvents`, `useCrdCalendarUrlState`. Computes `view` ∈ `{'list','detail','create','edit','delete'}` from URL state + local state (`editingEventId`, `deletingEvent`). Renders `<TimelineDialog>` with placeholder body for each view (e.g., `<div>List view (placeholder)</div>`) — real bodies are filled by US1–US7. `temporaryLocation` prop wired through.
- [X] T010 In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx`, mount `<CrdCalendarDialogConnector />` as a sibling to the existing `<CalloutListConnector />`. Drive `open` from the URL state (open when `calendarEventId` exists OR when path includes `/calendar` OR when local "open" state is true after sidebar trigger). On `onOpenChange(false)`, call `navigateAwayFromCalendar()` to strip the calendar tail. The dialog renders before/after the page tree as a sibling — Radix portals it; no `createPortal` needed.

**Checkpoint**: Foundation ready. Visiting `<space>/calendar` directly opens the dialog with a list-view placeholder; closing it strips the URL.

---

## Phase 3: User Story 1 — Sidebar Events panel (Priority: P1) 🎯 MVP

**Goal**: The CRD dashboard sidebar's Events panel shows up to 3 real upcoming events with locale-aware relative dates, the "Show calendar" link opens the timeline list view, and the "+" button (gated on `canCreateEvents`) opens the create form via URL deeplink.

**Independent Test**: Open a CRD-enabled space dashboard with at least one upcoming event. Verify the panel lists the next three future events with relative dates. Click "Show calendar" — URL becomes `<space>/calendar` and the dialog opens (US2 fills in the list contents; US1 only owns the navigation). With a `canCreateEvents` user, click "+" — URL becomes `<space>/calendar?new=1` (US4 fills in the form; US1 only owns the URL push).

### Implementation for User Story 1

- [X] T011 [US1] Implement `mapCalendarEventInfoToSidebarItem` in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts`: returns `{ id, title: profile.displayName, startDate: startDate ? new Date(startDate) : undefined, url: profile.url }`. Raw `Date` only — no formatting in the mapper.
- [X] T012 [US1] Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/hooks/useCrdCalendarSidebar.ts` per `contracts/connector-hooks.ts` (`UseCrdCalendarSidebar`): calls `useUrlResolver` for `spaceId`/`parentSpaceId`, then `useCalendarEvents({ spaceId, parentSpaceId })`. Filter `events` to future (`dayjs(e.startDate).isAfter(dayjs().startOf('day'))`), sort ascending by `startDate`, take first 3, map via `mapCalendarEventInfoToSidebarItem`. Returns `{ events, canCreateEvents: privileges.canCreateEvents, loading }`.
- [X] T013 [US1] Update `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/sidebar/EventsSection.tsx` to match `EventsSectionProps` from `contracts/crd-presentational.ts`. Replace the old `events: { title; date }[]` shape with `events: SidebarEventItem[]` and accept optional `onEventClick`. Inside the component, format the date with `date-fns/format` plus the new `sidebar.eventDateRelative.*` keys: today → `t('sidebar.eventDateRelative.today')`; tomorrow → `t('sidebar.eventDateRelative.tomorrow')`; within 7 days → `t('sidebar.eventDateRelative.in_days', { count: N })`; otherwise → `format(date, 'MMM d')` using the resolved `date-fns/locale` for the user's i18n language. No MUI / Apollo / domain imports.
- [X] T014 [US1] Wire the sidebar in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx`: call `useCrdCalendarSidebar()` and `useCrdCalendarUrlState()`. Pass `events`, `onShowCalendar={() => { setCalendarOpen(true); navigateToList(); }}`, `onAddEvent={canCreateEvents ? () => { setCalendarOpen(true); navigateToCreate(); } : undefined}` to `<SpaceSidebar>` (which forwards to `<EventsSection>`). Permission gating handled at this layer per CRD purity rule.

**Checkpoint**: Sidebar shows real events; "Show calendar" and "+" both push the correct URL params and open the dialog placeholder.

---

## Phase 4: User Story 2 — Browse, filter, deeplink in the timeline (Priority: P1)

**Goal**: The list view inside the dialog renders the calendar with multi-day highlighting, an Upcoming/Past list, a tooltip per marked day, click-to-highlight that updates the URL, and click-to-event-detail. Skeleton loading state per FR-013a.

**Independent Test**: With a space containing several events including a multi-day event and at least one past event, open the timeline. Verify markers, tooltip on hover/focus, click-to-highlight (URL gets `?highlight=`), Upcoming/Past sectioning, and that clicking a card navigates to `<space>/calendar/<event-name-id>` (US3 renders detail; US2 only owns the navigation push).

### Implementation for User Story 2

- [X] T015 [US2] Implement `mapCalendarEventInfoToListItem` in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts` returning the full `EventListItem` shape (id, title, description from `profile.description`, raw `startDate: Date`, durationMinutes, durationDays, wholeDay, type as string, url from `profile.url`, subspaceName from `event.subspace?.about.profile.displayName` when present).
- [X] T016 [P] [US2] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventDateBadge.tsx` per `EventDateBadgeProps`. Pure visual badge: month abbreviation + day number stacked, primary colour for upcoming, muted for past. Uses `date-fns/format(date, 'MMM')` and `format(date, 'd')` with the locale resolved from `useTranslation`. `size` prop drives sm/md spacing.
- [X] T017 [P] [US2] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventCardHeader.tsx` per `EventCardHeaderProps`. Renders `<EventDateBadge>` on the left, title + meta-row on the right. Meta row: start date, time + duration, end date/time when multi-day, type label (translated via `t(\`calendar.type.${event.type}\`)`), subspace name as a `Badge` chip when present (`{t('details.subspaceLabel', { name: subspaceName })}`). Skeleton when `loading`.
- [X] T018 [US2] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventCard.tsx` per `EventCardProps`. Wrap `<button type="button" onClick={onClick}>` around a `Card`-styled container with `<EventCardHeader>`, line-clamped description preview via `<MarkdownContent>` from `@/crd/components/common/MarkdownContent`, "Read more →" footer (`t('buttons.readMore')` from the existing `crd-space` namespace or new key). When `highlighted`, add `ring-2 ring-primary` and `data-highlighted` attribute. Forward a `ref` so the consumer can scroll to it.
- [X] T019 [US2] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventsCalendarView.tsx` per `EventsCalendarViewProps`. Compute three `Date[]` modifier sets from `events` (start, end, between, past). Use `<Calendar>` primitive with `mode="single"`, `selected={highlightedDay ?? undefined}`, `onDayClick={onHighlightDay}`, `modifiers={{ eventStart, eventEnd, eventBetween, past }}`, `modifiersClassNames={{ eventStart: 'rounded-l-md bg-primary/20', eventEnd: 'rounded-r-md bg-primary/20', eventBetween: 'bg-primary/20', past: 'text-muted-foreground/60' }}`, and `components.DayContent` to wrap each marked day cell in `<Tooltip delayDuration={300}>` whose content renders an `<ul>` of `t('tooltip.wholeDayPrefix')` / `format(startDate, 'p')` + ` — ` + title for that day's events. Right pane: `ScrollArea` with two grouped sections (Upcoming asc, Past desc); when `loading` and `events` is empty, render 5 `Skeleton` rows. Effect: when `highlightedDay` changes, find the matching event by id and `scrollIntoView`. Responsive: at <768px use `useMediaQuery('(max-width: 767px)')` and render the calendar inside a collapsible panel toggled by a "Pick a date" `Button` + `ChevronDown` icon above the list (NOT a Popover, to avoid double-modal stacking inside the Sheet).
- [X] T020 [US2] In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx`, replace the list-view placeholder: when `view === 'list'`, sort events ascending, map via `mapCalendarEventInfoToListItem`, and render `<EventsCalendarView events={...} highlightedDay={highlightedDay} onHighlightDay={navigateToHighlight} onEventClick={(e) => navigateToEvent(e.url)} loading={loading} exportSlot={undefined} />`. Use `t('crd-space:calendar.title')` as the dialog title.

**Checkpoint**: Stories 1 and 2 work end-to-end. Sidebar opens dialog → list view shows events + calendar with markers + tooltips; clicking a card navigates to `/calendar/<eventNameId>` (detail still placeholder pending US3).

---

## Phase 5: User Story 3 — Event detail + comments (Priority: P1)

**Goal**: Detail view renders banner (or gradient fallback), title, author attribution caption, markdown description, tags, references, and a comments column with thread + input when permitted. Skeleton state during load, "not found" state for deleted/invalid events. "Edit" and "Back" header actions.

**Independent Test**: Open an event with banner, description, references, tags, and comments. Verify all fields render. Post a comment, then a reply, then a reaction. Delete your own comment. Click "Edit" → form opens (US4 fills the form; US3 only owns the trigger). Click "Back" → returns to list.

### Implementation for User Story 3

- [X] T021 [US3] Implement `mapCalendarEventDetailsToDetailData` in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts`: takes `(event, { loading, notFound })` and returns `EventDetailData`. Author maps to `{ id: createdBy.id, name: createdBy.profile.displayName, avatarUrl: createdBy.profile.visual?.uri, profileUrl: createdBy.profile.url }` (no `color` field — the leaf component derives it via the `resolveColor` callback prop, see T022/T024). `createdDate` parsed as `new Date(...)`. Tags from `profile.tagset.tags`. References mapped to `{ id, name, uri, description }`. Banner: `bannerUrl` from `profile.banner?.uri` (no `bannerColor` field for the same reason). When `notFound`, return a stub with `notFound: true` and minimal placeholder strings; the event id flows through unchanged so the component can still derive a fallback colour.
- [X] T022 [P] [US3] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventDetailView.tsx` per `EventDetailViewProps`. The component MUST NOT import `pickColorFromId`; it receives `resolveColor: (id: string) => string` as a prop and invokes it on demand. Layout at ≥768px: two columns — left has banner block (image from `event.bannerUrl` when present; otherwise `bg-gradient-to-br` from `props.resolveColor(event.id)`), title, author caption ("by {name} • {createdDate formatted}") with the author avatar (`event.author.avatarUrl` when present; otherwise an `Avatar` fallback whose background is `props.resolveColor(event.author.id)`), markdown description via `<MarkdownContent>`, tags as `<Badge>` row, references as link list. Right has comments column when `showComments` (header `t('details.comments')` + `commentCount`, then `commentsSlot`, then sticky `commentInputSlot` if non-null). At <768px: stack vertically, comments below body. When `event.loading`: skeleton banner + skeleton title + 3 skeleton lines for description. When `event.notFound`: centred `t('notFound.title')` + body (`t('notFound.body')`) + a `<Button onClick={onBack}>{t('notFound.backToList')}</Button>`. The `onBack` prop is required — the connector wires the same callback that powers the dialog header's Back action so both surfaces route through one path.
- [X] T023a [US3] Extract shared room-comments boilerplate into `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/hooks/useCrdRoomComments.ts`. Hook signature: `useCrdRoomComments({ roomId, room, skipSubscription }: { roomId: string; room: CommentsWithMessagesModel | undefined; skipSubscription?: boolean }) => { thread: ReactNode; commentInput: ReactNode | null; commentCount: number }`. Move from `src/main/crdPages/space/callout/CalloutCommentsConnector.tsx`: the `useCurrentUserContext` lookup, `useSubscribeOnRoomEvents(roomId, skipSubscription ?? false)`, `usePostMessageMutations`, `useCommentReactionsMutations`, `useRemoveMessageOnRoomMutation` (with cache eviction via `evictFromCache`), the `mapRoomToCommentData` call, the `messagesLookup`-based reaction-id resolution, and the `<CommentThread>` + `<CommentInput>` JSX render. Then refactor `CalloutCommentsConnector.tsx` to keep ONLY: `useInView({ triggerOnce: true, delay: 200 })`, `useCalloutContributionCommentsQuery({ skip: !contributionId || Boolean(roomData) || !inView })`, the `room = roomData ?? data?.lookup.contribution?.post?.comments` resolution, and a call to `useCrdRoomComments({ roomId, room, skipSubscription: !inView })`; wrap children in `<div ref={ref}>`. The render-prop API of `CalloutCommentsConnector` MUST stay unchanged (`{ thread, commentInput, commentCount }`) so existing callers don't break — verify the existing callout detail dialog still works after the refactor (run the callout walkthrough in `quickstart.md`'s sibling spec and confirm post / reply / react / delete still function).
- [X] T023 [US3] Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CalendarCommentsConnector.tsx` per `CalendarCommentsConnectorProps`. Thin wrapper (~15 lines): accept `{ roomId, room }` as props (no lazy `useInView` / Apollo query — `useCalendarEventDetail` already loaded the room). Call `useCrdRoomComments({ roomId, room })` from T023a (defaults `skipSubscription: false` so the dialog actively subscribes for live updates). Forward `{ thread, commentInput, commentCount }` via the render-prop API documented in `contracts/connector-hooks.ts`. The CRD `<CommentThread>`, `<CommentItem>`, `<CommentInput>`, `<CommentReactions>`, `<CommentEmojiPicker>` components and the `mapRoomToCommentData` mapper are reused unchanged via the shared hook — no new comment leaf code is introduced.
- [X] T024 [US3] Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/EventDetailConnector.tsx` per `EventDetailConnectorProps`. Calls `useCalendarEventDetail({ eventId })` from the existing domain hook, computes `{ loading, notFound: !loading && !data?.lookup.calendarEvent }`, maps via `mapCalendarEventDetailsToDetailData`. Imports `pickColorFromId` from `@/crd/lib/pickColorFromId` (connectors are free to import CRD lib helpers; the leaf component is not). Wraps `<CalendarCommentsConnector roomId={event.comments.id} room={event.comments}>` with a render-prop that injects `thread` + `commentInput` slots into `<EventDetailView>`. Renders `<EventDetailView event={mapped} showComments={...} commentsSlot={thread} commentInputSlot={commentInput} onBack={props.onBack} resolveColor={pickColorFromId} />`. `showComments` is `event.comments.authorization.myPrivileges.includes(AuthorizationPrivilege.Read)`.
- [X] T025 [US3] In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx`, replace the detail-view placeholder: when `view === 'detail'` (i.e., `calendarEventId` in URL), render `<EventDetailConnector eventId={calendarEventId} onBack={navigateToList} />`. The `onBack` prop is forwarded by the connector into `<EventDetailView onBack={onBack} />` so the not-found state's back button shares the same handler as the header Back action. Compose `headerActions` for the dialog: leave a slot for `<AddToCalendarMenuConnector />` (placeholder until US6 fills it), an "Edit" `<Button variant="outline">` visible when `privileges.canEditEvents` that sets local `editingEventId={calendarEventId}` and view to `'edit'`, and a "Back" `<Button onClick={navigateToList}>` (same callback as the not-found back). Title becomes `t('calendar.eventDetail', { title: event.title })` once the event resolves; while loading, use `t('details.loadingEvent')`.

**Checkpoint**: Stories 1, 2 and 3 work. Click an event → detail view opens with comments; Back returns to list; Edit opens an empty form (US4 fills it).

---

## Phase 6: User Story 4 — Create / edit form (Priority: P1)

**Goal**: Modernised, accessible form covering every field of the legacy MUI form, with validation, "whole day" toggle, conditional duration vs end-time, subspace-only "Visible on parent calendar" toggle, markdown description, tags. Submit creates or updates; cancel discards and clears URL params.

**Independent Test**: With create permission, open `?new=1`, fill required fields, submit, verify the new event appears in the list and on the calendar at the expected day. Open the same event for editing, change one field, save, verify the change is reflected. In a subspace, toggle `visibleOnParentCalendar` and verify the parent calendar shows / hides the event accordingly (T044 covers display).

### Implementation for User Story 4

- [X] T026 [P] [US4] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/forms/DateField.tsx` per `DateFieldProps`. `<Popover>` whose trigger is a `<Button variant="outline">` styled like an `Input` (full width, left-aligned text, calendar icon from `lucide-react` on the right) showing `value ? format(value, 'PPP') : placeholder`; content is `<Calendar mode="single" selected={value} onSelect={onChange} disabled={disabled} fromDate={minDate} toDate={maxDate} />`. Label rendered via `<Label>` primitive (or new local helper); error rendered as a small `text-destructive` line below; persistent `aria-label` from `label`.
- [X] T027 [P] [US4] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/forms/TimeField.tsx` per `TimeFieldProps`. Native `<input type="time" min={minTime ? format(minTime, 'HH:mm') : undefined} value={value ? format(value, 'HH:mm') : ''} onChange={...} />`, styled with the same Tailwind classes as `Input` primitive. On change parse `HH:mm` and combine with the date portion of `value` (or today if undefined) to produce a new `Date`. Label + error pattern mirrors `DateField`.
- [X] T028 [P] [US4] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/forms/DurationField.tsx` per `DurationFieldProps`. `<Input type="number" min={1} step={step ?? 15} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} />`; below it, a small caption: `t('calendar.fields.endsAt', { time: format(addMinutes(startDate, value), 'p') })` when both `startDate` and `value` are set.
- [X] T029 [US4] Implement `mapCalendarEventDetailsToFormValues` in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts`. Compute `endDate`: if event is multi-day (`durationDays > 0` OR same-day with non-zero `durationMinutes`), add `durationMinutes` minutes to `startDate`; otherwise `endDate = startDate`. Map `tags` from `profile.tagset.tags`, `locationCity` from `profile.location?.city ?? ''`, all other fields directly.
- [X] T030 [US4] Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/useCrdEventForm.ts` per `UseCrdEventForm`. `useState<EventFormValues>` seeded from `initialValues` (defaults: all empty strings/false, `startDate = new Date()`, `endDate = new Date()`, `durationMinutes = 30`). `setField` updates and clears the per-key error. `validate()` runs a `yup.object({...}).validate(values, { abortEarly: false })` schema — port from `src/domain/timeline/calendar/views/CalendarEventForm.tsx:109-136` (displayName required + length, type required, durationMinutes positive when same-day non-wholeDay, end ≥ start when cross-day, the combined `validateDuration` rule); on `ValidationError` collect into `EventFormErrors` with `t('calendar.validation.<key>')` translations. `reset()` returns to defaults; `prefill(values)` merges over current state.
- [X] T031 [US4] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventForm.tsx` per `EventFormProps`. Layout at ≥768px (per FR-020 + FR-042a):
  - Row 1: `<Input>` displayName | `<Select>` type (options injected via `typeOptions`)
  - Row 2 left group: `<DateField>` startDate | `<TimeField>` startDate disabled when wholeDay | `<Switch>` wholeDay
  - Row 2 right group: `<DateField>` endDate (minDate=startDate) | `isSameDay(startDate, endDate) ? <DurationField startDate value=durationMinutes /> : <TimeField endDate minTime={startDate} disabled={wholeDay} />`
  - Row 3: `<MarkdownEditor>` description (from `@/crd/forms/markdown/MarkdownEditor`)
  - Row 4: `<Input>` locationCity | `<TagsInput>` tags (from `@/crd/forms/tags-input`)
  - Row 5 (`isSubspace` only): `<Switch>` visibleOnParentCalendar with translated label
  - Footer: `footerActionsLeft` slot + `<Button onClick={onSubmit} disabled={isSubmitting} aria-busy={isSubmitting}>{t('calendar.save')}</Button>`. At <768px every row stacks vertically. Errors rendered below each field.
- [X] T032 [US4] In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx`, replace the create/edit placeholders. Call `useCrdEventForm()`. Build `typeOptions` from `Object.values(CalendarEventType).map(v => ({ value: v, label: t(\`calendar.type.${v}\`) }))`. When `view === 'create'`: render `<EventForm values errors onChange onSubmit={handleCreateSubmit} isSubmitting={creatingCalendarEvent} isSubspace={Boolean(parentSpaceId)} typeOptions footerActionsLeft={<Button variant="ghost" onClick={() => navigateToList()}>{t('calendar.cancel')}</Button>} />`. `handleCreateSubmit` calls `validate()` → on success: normalise duration vs durationDays vs multipleDays per `useCalendarEvents.ts:103-115` — if `isSameDay(startDate, endDate)`, pass `durationMinutes` through and zero `durationDays`/`multipleDays`; else compute `durationMinutes = floor((endDate-startDate)/60000)`, `durationDays = floor(durationMinutes/(24*60))`, `multipleDays = durationDays > 0`. Call `createEvent({ ...values, durationMinutes, durationDays, multipleDays })`. On success URL push: `navigateToEvent(eventUrl)`. When `view === 'edit'`: prefill on first render via `prefill(mapCalendarEventDetailsToFormValues(detail))`, run the same submit normalisation, call `updateEvent(editingEventId, values, tagset)` (use the original tagset from the detail fragment). On edit success: clear `editingEventId` and return to `'detail'`. When the user closes the dialog or cancels create/edit, call `reset()` and clear `?new=1` if present.

**Checkpoint**: All four P1 stories work end-to-end. Sidebar → list → detail → edit / create → save → back to list. Dialog deeplinks (`/calendar`, `?highlight=`, `?new=1`, `/calendar/<eventId>`) all resolve correctly.

---

## Phase 7: User Story 5 — Delete an event (Priority: P2)

**Goal**: From the edit form, a user with delete permission can remove the event after confirmation; the event disappears from the calendar (and from the parent calendar if shared).

**Independent Test**: Edit an event you have delete permission for, click "Delete", confirm, verify the event no longer appears in the list / on the calendar / on the parent calendar (when applicable).

### Implementation for User Story 5

- [X] T033 [US5] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/DeleteEventConfirmation.tsx` per `DeleteEventConfirmationProps`. Wraps `AlertDialog` from `@/crd/primitives/alert-dialog`. Title: `t('calendar.deleteConfirm.title')`. Body: `t('calendar.deleteConfirm.body', { title: eventTitle, entity: entityLabel })`. Cancel button `t('calendar.deleteConfirm.cancel')`, Confirm button `t('calendar.deleteConfirm.confirm')` styled as destructive (`variant="destructive"`); both wired via `onOpenChange` and `onConfirm`. `aria-busy={loading}` on the confirm button.
- [X] T034 [US5] In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx`: when `view === 'edit'` and `privileges.canDeleteEvents`, prepend a `<Button variant="outline" onClick={() => setView('delete')}>{t('calendar.deleteConfirm.title')}</Button>` to `footerActionsLeft`. Render `<DeleteEventConfirmation open={view==='delete'} onOpenChange={(o) => !o && setView('edit')} eventTitle={editingEvent.title} entityLabel={t(parentSpaceId ? 'calendar.entity.subspace' : 'calendar.entity.space')} onConfirm={handleDelete} loading={deletingEvent} />`. `handleDelete` calls `deleteEvent(editingEventId)` then `navigateToList()` and clears `editingEventId`. Cancel returns to the edit view.

**Checkpoint**: Delete works end-to-end with confirmation; subspace events also disappear from the parent calendar (verified in US7 testing).

---

## Phase 8: User Story 6 — External calendar export (Priority: P2)

**Goal**: From the detail view, the user can add the event to Google / Outlook or download an `.ics`. From the list view, they can export all upcoming events as one `.ics`. URL fetch is lazy (only when the dropdown opens).

**Independent Test**: Open an event detail, open the "Add to calendar" menu, verify the dropdown is empty until first open (DevTools Network shows the query firing on first click). Each option works (Google / Outlook open new tabs; ICS downloads). From the list view, click the export icon and import the resulting file into two desktop calendar apps (per SC-009).

### Implementation for User Story 6

- [X] T035 [US6] Implement `mapCalendarEventImportUrlsToLinks` in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts`: maps the query result to `{ googleUrl, outlookUrl, icsUrl: icsDownloadUrl, icsFilename: \`${profile.displayName}.ics\` }`.
- [X] T036 [P] [US6] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/icons/CrdAddToCalendarIcons.tsx`. Import the existing raw SVGs via Vite's `?react` plugin: `import GoogleIcon from '@/domain/timeline/calendar/components/icons/google.svg?react'`, same for `outlook.svg` and `download-calendar.svg`. Wrap each in a small `<span className="inline-flex size-4">` for consistent sizing. Export `{ GoogleIcon, OutlookIcon, IcsIcon }`. No MUI imports.
- [X] T037 [P] [US6] Build `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/AddToCalendarMenu.tsx` per `AddToCalendarMenuProps`. Uses `<DropdownMenu open={open} onOpenChange={onOpenChange}>`. Trigger is icon-only `<Button variant="ghost" size="icon" aria-label={triggerLabel}><CalendarDays /></Button>` (lucide). Content: when `loading`, single disabled `<DropdownMenuItem disabled>{t('addToCalendar.loading')}</DropdownMenuItem>`; otherwise three `<DropdownMenuItem asChild>` items wrapping `<a href={links.googleUrl} target="_blank" rel="noopener noreferrer">` (Google), `<a href={links.outlookUrl} target="_blank" rel="noopener noreferrer">` (Outlook), `<a href={links.icsUrl} download={links.icsFilename}>` (ICS), each with the brand icon from T036 and the localized label.
- [X] T038 [US6] Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/AddToCalendarMenuConnector.tsx` per `AddToCalendarMenuConnectorProps`. Internal `useState` for `open`. Calls `useCalendarEventImportUrlsQuery({ variables: { eventId }, skip: !open && !loaded })` — once opened, stay subscribed for cache hits. Maps result via `mapCalendarEventImportUrlsToLinks`. Renders `<AddToCalendarMenu links={links} loading={loading} triggerLabel={triggerLabel ?? t('addToCalendar.trigger')} open={open} onOpenChange={setOpen} />`.
- [X] T039 [US6] In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx` (or in `EventDetailConnector` if detail header actions are owned there), wire `<AddToCalendarMenuConnector eventId={calendarEventId} />` into the detail-view `headerActions` slot prepared in T025.
- [X] T040 [US6] Create `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/ExportEventsToIcsConnector.tsx` per `ExportEventsToIcsConnectorProps`. Uses `formatDateTimeUtc`, `escapeIcsText`, `foldLine` from `src/domain/timeline/calendar/utils/icsUtils.ts`. Builds a single `BEGIN:VCALENDAR ... END:VCALENDAR` string from the `events` prop, filtered to future events (`dayjs(e.startDate).isAfter(dayjs().startOf('day'))`). Renders an icon-only `<Button variant="ghost" size="icon" aria-label={t('addToCalendar.exportAll')}><Download /></Button>` (lucide); on click, create a `Blob`, generate an object URL, click a hidden anchor with `download="alkemio-events-${dayjs().format('YYYY-MM-DD')}.ics"`, and revoke the URL. Plain-text description via `markdownToPlainText` from `@/core/ui/markdown/utils/markdownToPlainText`.
- [X] T041 [US6] In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx`, when rendering the list view (T020), pass `<ExportEventsToIcsConnector events={futureEvents} />` as the `exportSlot` prop of `<EventsCalendarView>`, hidden when `futureEvents.length === 0`.

**Checkpoint**: External calendar export works for individual and batch.

---

## Phase 9: User Story 7 — Subspace event sharing (Priority: P2)

**Goal**: Subspace events with `visibleOnParentCalendar=true` show up on the parent space's CRD timeline alongside the parent's own events, interleaved chronologically, with an "in {Subspace}" chip on the card. The toggle in the form (built in US4) controls this.

**Independent Test**: In a subspace, edit an event, enable "Visible on parent calendar", save. Open the parent space's CRD timeline and verify the event appears interleaved chronologically with parent events, marked with the subspace chip on the card. Toggle off, save, reload parent — event disappears from parent timeline.

### Implementation for User Story 7

- [X] T042 [US7] Verify in `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx` and `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/hooks/useCrdCalendarSidebar.ts` that `useCalendarEvents({ spaceId, parentSpaceId })` is called with the resolved `parentSpaceId` from `useUrlResolver`. The existing domain hook already passes `includeSubspace: !parentSpaceId` (i.e., include subspace events when we're at L0). No code change here unless it isn't — if it isn't, fix the call site. Add a brief code comment noting the contract.
- [X] T043 [US7] In the `mapCalendarEventInfoToListItem` mapper at `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts` (already touched by T015), confirm `subspaceName` is populated from `event.subspace?.about.profile.displayName` when the fragment includes it. Add a unit-style smoke check via `pnpm vitest run` if a relevant test file exists; otherwise document in PR description.
- [X] T044 [US7] In `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventCardHeader.tsx` (built in T017), confirm the meta row renders the "in {subspaceName}" chip via a `<Badge variant="secondary">{t('details.subspaceLabel', { name: subspaceName })}</Badge>` when `subspaceName` is present. Calendar markers remain the same colour for parent vs subspace events (FR-035 — chip is the sole differentiator).
- [X] T045 [US7] Verify in `/Users/borislavkolev/WebstormProjects/client-web/src/crd/components/space/timeline/EventForm.tsx` (built in T031) that the `visibleOnParentCalendar` `Switch` is rendered exclusively when `isSubspace` is true. In `/Users/borislavkolev/WebstormProjects/client-web/src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx` (T032), `isSubspace` is set from `Boolean(parentSpaceId)`. End-to-end: toggle persistence is delivered by the existing `useCalendarEvents.updateEvent` which already sends `visibleOnParentCalendar` in the mutation payload (no domain change required).

**Checkpoint**: All seven user stories are functional.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Quality, accessibility, regression and i18n verification. None of these introduce new files; they validate the work and tighten loose ends.

- [ ] T046 [P] Accessibility audit per quickstart.md "Accessibility walkthrough": keyboard-only complete each P1+P2 story; verify visible focus rings everywhere, dialog focus trap + restoration, calendar grid arrow-key navigation (RDP default), every icon-only button has an `aria-label` (DevTools accessibility tree).
- [ ] T047 [P] Manual responsive QA per quickstart.md "Responsive (mobile) walkthrough": iPhone 14 Pro viewport (393×852); verify full-screen Sheet, collapsed-calendar trigger pattern, vertical stacking in form and detail; verify Add-to-Calendar dropdown still works inside the Sheet without double-modal stacking.
- [ ] T048 [P] i18n review per quickstart.md "i18n walkthrough": switch to NL/ES/BG/DE/FR; verify every label updates without page reload; verify calendar month/weekday names switch via `date-fns/locale`; verify validation messages and the relative-date sidebar labels localise correctly.
- [ ] T049 [P] Performance / cache verification: open the dashboard with DevTools Network filtered to GraphQL; verify `useSpaceCalendarEventsQuery` fires exactly once for the dashboard load (sidebar + dialog connector share via Apollo cache); open AddToCalendar dropdown and verify `CalendarEventImportUrls` fires only on first open per event.
- [ ] T050 [P] Legacy MUI regression check: in browser console run `localStorage.removeItem('alkemio-crd-enabled'); location.reload();`; verify the legacy MUI `CalendarDialog` and `DashboardCalendarSection` still open and operate exactly as before; confirm no files under `src/domain/timeline/calendar/` were modified by this branch.
- [ ] T051 [P] Manual ICS verification (SC-009): export a single event and the batch ICS; import each into macOS Calendar AND Google Calendar (web); both must parse without manual edits.
- [X] T052 [P] Static checks: `pnpm lint` (tsc + biome + eslint) → exit 0 (492 pre-existing biome warnings in unrelated files; **0 new warnings** across the 34 timeline-touched files). `pnpm vitest run` → 592 passed / 3 skipped (no regressions vs. baseline). `pnpm build` deferred — CI runs it; the strict tsc + biome passes already cover the same surface.

---

## Phase 11: Post-review refactor (code-review follow-up)

**Purpose**: Apply the findings from the post-implementation code review (three-agent audit against CRD purity + SOLID + hooks-first). All tasks completed; see the plan file at `~/.claude/plans/hazy-twirling-kernighan.md` for the full review rationale and accepted/rejected findings.

- [X] T053 Eliminate the `useRef`-gated prefill anti-pattern in `src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx` by switching to a key-driven remount: the dialog now mounts `<EventFormDialogBody key={editingEventId ?? 'create'}>`, and `useCrdEventForm(initialValues)` seeds state via a lazy `useState` initializer. `prefill()` removed from the hook's public surface.
- [X] T054 Extract `src/main/crdPages/space/timeline/useCrdEventFormDialog.ts` to own the create/edit/delete slice: form state, delete confirmation state, submit/delete handlers, and payload normalisation. The dialog connector shrank from ~344 lines to ~200 and becomes a thin orchestrator.
- [X] T055 Drop the `externalLoading` parameter from `useCrdRoomComments` (ISP tightening). `CalloutCommentsConnector` no longer forwards the lazy contribution-query loading state; the `useInView` gate already hides the in-flight window from users.
- [X] T056 Remove the unimplemented `children` render-prop override from `EventDetailConnectorProps` in `specs/086-crd-space-timeline/contracts/connector-hooks.ts` (spec/implementation drift cleanup).
- [X] T057 Document the `canReadComments` gate in `src/main/crdPages/space/timeline/EventDetailConnector.tsx` as an optimisation (avoids mounting the comments connector when the user has no read permission); confirm `useCrdRoomComments` does not duplicate the check.
- [X] T058 Refactor `src/main/crdPages/space/timeline/useCrdCalendarUrlState.ts` path resolution with a `splitCalendarPath(pathname)` helper at module scope; navigators now read declaratively.
- [X] T059 Add defensive `console.warn` (with `biome-ignore lint/suspicious/noConsole` + rationale) in `src/main/crdPages/space/timeline/ExportEventsToIcsConnector.tsx` when an event is skipped for missing `startDate`. Caller-filtered list should prevent this firing in practice.
- [X] T060 Rename `useCrdEventForm.reset()` → `clearForm()` (clearer intent) and update all call sites.
- [X] T061 Static checks after refactor: `npx tsc --noEmit` clean; `npx biome ci` clean (0 warnings on 10 touched files); `pnpm vitest run` 592 passed / 3 skipped (unchanged).

**Checkpoint**: All 7 user stories remain functionally complete with cleaner internals. The CRD purity layer, accessibility, i18n, and domain-hook reuse all continue to pass.

---

## Phase 12: Date-library consolidation (post-review polish)

**Purpose**: Tighten the date-library boundary so CRD + crdPages use a single library (`date-fns`), eliminating the previous mixed-mode where connectors imported `dayjs` and CRD components imported `date-fns`. Also DRY up the per-component locale helper that had drifted into 7 copies.

- [X] T062 Create `src/crd/lib/dateFnsLocale.ts` with the `LOCALE_BY_LANG` map and `resolveDateFnsLocale(langCode)` helper. Single source of truth for the supported-language → date-fns Locale mapping.
- [X] T063 Migrate every CRD form/component (`DateField`, `DurationField`, `EventsSection`, `EventDateBadge`, `EventCardHeader`, `EventDetailView`, `EventsCalendarView`) to import `resolveDateFnsLocale` from the shared helper instead of re-declaring its own copy. ~90 lines of duplication removed.
- [X] T064 Replace all `dayjs` calls in the new connector layer with `date-fns` equivalents:
  - `src/main/crdPages/space/hooks/useCrdCalendarSidebar.ts` — `dayjs(...).isAfter()` → `isAfter`, `dayjs().startOf('day')` → `startOfDay(new Date())`, `.valueOf()` → `Date.getTime()`
  - `src/main/crdPages/space/timeline/useCrdCalendarUrlState.ts` — `dayjs(str).isValid()` → `parse('yyyy-MM-dd', ...)` + `isValid()`; format token changed from moment-style `'YYYY-MM-DD'` to date-fns `'yyyy-MM-dd'` (wire format unchanged)
  - `src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx` — same `startOfDay` / `isAfter` swap
  - `src/main/crdPages/space/timeline/ExportEventsToIcsConnector.tsx` — inlined a JS-Date-typed `formatDateTimeUtc(date: Date)` (instead of importing the dayjs-typed one from `src/domain/timeline/calendar/utils/icsUtils.ts`); replaced `dayjs().format('YYYY-MM-DD')` with `format(new Date(), 'yyyy-MM-dd')`. The legacy MUI `ExportEventsToIcsButton` continues to use the dayjs-typed domain helper, untouched.
- [X] T065 Update `src/crd/CLAUDE.md` to add Golden Rule #7 ("Use `date-fns`, not `dayjs`") with rationale + good/bad examples + locale-helper usage + cross-layer boundary guidance.
- [X] T066 Update `specs/086-crd-space-timeline/research.md` R2 (Date-library boundary) with the post-implementation decision (single library across CRD + crdPages) and rationale.
- [X] T067 Static checks: `npx tsc --noEmit` clean; `npx biome ci` clean across all 12 touched files; `pnpm vitest run` 592 passed / 3 skipped (no regressions); `grep -r "from 'dayjs" src/crd src/main/crdPages/space/{timeline,hooks}` returns zero matches.

**Checkpoint**: The CRD + crdPages timeline code uses a single date library. The domain layer's existing dayjs usage is unchanged.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 must precede T002 (the calendar primitive imports `react-day-picker`). T003/T004/T005 are independent of T001/T002 and can start immediately. **Phase 1 has no external blockers.**
- **Foundational (Phase 2)**: All Phase 2 tasks depend on Phase 1 completion. Within Phase 2, T009/T010 depend on T006 and T008. T007 is independent of the others. **Phase 2 BLOCKS all user stories** because every story renders content inside `TimelineDialog` and reads from `useCrdCalendarUrlState`.
- **User Stories (Phase 3+)**:
  - **US1 (Phase 3)** depends only on Phase 2 — sidebar wiring is independent of dialog body content.
  - **US2 (Phase 4)** depends on Phase 2; can run in parallel with US1, US3, US4 if multiple developers.
  - **US3 (Phase 5)** depends on Phase 2; the detail view is independent of US2's list view but they share `mapCalendarEventInfoToListItem` in T015 only for `subspaceName` plumbing — not blocking.
  - **US4 (Phase 6)** depends on Phase 2; the form fields T026–T028 are independent of any other story.
  - **US5 (Phase 7)** depends on US4 (T032 sets up the edit-view scaffolding that US5 hangs Delete on).
  - **US6 (Phase 8)** depends on US3 (the detail view's `headerActions` slot is filled by US6) and on US2 (the list view's `exportSlot` is filled by US6).
  - **US7 (Phase 9)** depends on US2 + US4 (chip rendering is a one-line addition to the existing card; the form toggle is already wired by US4).
- **Polish (Phase 10)** depends on all P1 stories at minimum; the full walkthroughs require P2 stories too.

### User Story Dependencies

- **US1** independent ✓
- **US2** independent ✓
- **US3** independent ✓ (detail view does not need list view)
- **US4** independent ✓
- **US5** depends on US4 (Edit-view footer scaffolding)
- **US6** depends on US3 (detail header) + US2 (list export slot)
- **US7** depends on US2 (chip on card) + US4 (form toggle)

### Within Each User Story

- Mappers before connectors before component wiring
- CRD presentational components ([P]-able) before connectors that consume them
- Story complete before moving to next priority (or before merging the slice)

### Parallel Opportunities

- All [P] tasks within a phase touch different files and can run concurrently.
- Phase 1: T002, T003, T004, T005 in parallel after T001.
- Phase 2: T006, T007, T008 can start in parallel; T009 needs T006/T008; T010 needs T009.
- Phase 4: T016, T017 in parallel; T018 depends on T017; T019 depends on T015/T016/T017/T018; T020 depends on T019.
- Phase 5: T022 (CRD EventDetailView) and T023a (extract `useCrdRoomComments` hook) in parallel; T023 (CalendarCommentsConnector) needs T023a; T024 needs T021+T023; T025 needs T024. T023a touches the existing `CalloutCommentsConnector.tsx` — verify the callout detail flow still works after the refactor before merging T023.
- Phase 6: T026, T027, T028 fully parallel; T030 independent of all of them; T031 depends on T026/T027/T028; T032 depends on T029/T030/T031.
- Phase 8: T036, T037 fully parallel; T035 independent; T038 depends on T035/T037; T039 depends on T038; T040 independent; T041 depends on T040.
- Phase 10: Every task is parallel.

---

## Parallel Example: User Story 4 form-fields kickoff

```bash
# Once Phase 2 + T015 are merged, three developers can take:
Task: "T026 Build src/crd/forms/DateField.tsx"
Task: "T027 Build src/crd/forms/TimeField.tsx"
Task: "T028 Build src/crd/forms/DurationField.tsx"
# All three land independently before T031 wires them into EventForm.tsx
```

## Parallel Example: Phase 1 setup

```bash
# After T001 lands:
Task: "T002 Port src/crd/primitives/calendar.tsx from prototype"
Task: "T003 Add new calendar.* keys to src/crd/i18n/space/space.en.json"
Task: "T004 Mirror new keys to space.{nl,es,bg,de,fr}.json"
Task: "T005 Scaffold src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (T001–T005) — install deps, port primitive, add i18n, scaffold mapper.
2. Phase 2 (T006–T010) — URL state, routing, dialog shell, connector skeleton, dashboard wiring.
3. Phase 3 (T011–T014) — sidebar shows real events; "Show calendar" and "+" push correct URL deeplinks.
4. **STOP and VALIDATE**: with the dialog placeholder visible, sidebar + URL navigation are demoable. This is not user-shippable yet (dialog is empty) but is a legitimate MVP-zero milestone.

### Recommended P1 ship slice

The smallest *user-shippable* slice is **Phase 1 + 2 + US1 + US2 + US3 + US4** (a working timeline with browse, deeplink, detail-with-comments, and create/edit). Without these four stories together, the timeline has no value to the user. Ship as one PR or as four sequential PRs — the choice depends on review burden. P2 stories (delete / export / subspace-share) can ship in a follow-up PR each.

### Incremental Delivery

1. **PR-1**: Setup + Foundational + US1 — sidebar wired, dialog opens with placeholder.
2. **PR-2**: US2 — list + calendar + deeplink.
3. **PR-3**: US3 — detail + comments.
4. **PR-4**: US4 — create / edit form. **At this point the feature is at MUI parity for the read+write surface.**
5. **PR-5**: US5 — delete.
6. **PR-6**: US6 — external calendar export.
7. **PR-7**: US7 — subspace event chip + parent calendar verification.
8. **PR-8**: Polish (T046–T052) — usually folded into the previous PR's QA.

### Parallel Team Strategy

After Phase 2 lands, three developers can take US2, US3, and US4 in parallel. US5 / US6 / US7 are best done after their respective dependencies (US4, US3, US4) close.

---

## Notes

- Tests not requested by the spec; verification is manual per `quickstart.md`. The existing Vitest suite (`pnpm vitest run`) MUST stay green throughout.
- All new dependencies (`react-day-picker`, `date-fns`) are pure ESM and tree-shakeable. Keep `react-calendar` until the CRD feature toggle is retired.
- The `?new=1` and `/calendar/{eventId}` URL state is the SINGLE source of truth for create-mode and detail-view. Do not duplicate into a `mode` prop or local state.
- Every CRD presentational component must pass `pnpm lint`'s biome rule that forbids MUI/Apollo/domain imports inside `src/crd/`. If the rule isn't already configured, the import bans are enforced by code review.
- Manual translations: when adding non-English keys (T004), it is acceptable to seed with the English string and a `// TODO(crd-i18n)` marker if no native translation is available immediately. Track follow-ups separately.
- Commit per task or per logical group (ideally one commit per story slice for clean revert).
