# Phase 1 Data Model: CRD Space Timeline

The feature does not change the GraphQL schema. The data model below documents the **CRD-side prop types** (plain TS, the contract between the connector layer and the presentational layer) and how they map from existing GraphQL fragments.

## Source GraphQL fragments (reused unchanged)

Defined in `src/domain/timeline/calendar/calendarQueries.graphql`:

| Fragment | Used by | Key fields |
|---|---|---|
| `CalendarEventInfo` | `useSpaceCalendarEventsQuery` (list + sidebar) | `id`, `type`, `startDate`, `durationDays`, `durationMinutes`, `wholeDay`, `multipleDays`, `visibleOnParentCalendar`, `profile { id, url, displayName, description, location, references, tagset, banner }`, `subspace.about` (when `includeSubspace`) |
| `CalendarEventDetails` | `useCalendarEventDetailsQuery` | `...CalendarEventInfo`, `authorization.myPrivileges`, `createdBy.profile`, `createdDate`, `comments` |
| `CommentsWithMessages` (existing CRD-side mapper) | comments connector | `id`, `messages[]`, `vcInteractions`, `authorization.myPrivileges` |
| `CalendarEventImportUrls` | `useCalendarEventImportUrlsQuery` (lazy) | `googleCalendarUrl`, `outlookCalendarUrl`, `icsDownloadUrl`, `profile.displayName` |

## CRD prop types (the contract)

All types live in the CRD components themselves (no shared types file inside `src/crd/`). The mapper in `src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts` produces these shapes and only these shapes.

### `SidebarEventItem`

Used by the CRD `EventsSection.tsx` sidebar widget.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable React key + payload for `onEventClick` |
| `title` | `string` | `profile.displayName` |
| `startDate` | `Date \| undefined` | Plain JS Date in UTC; component formats locally |
| `url` | `string \| undefined` | `profile.url`; optional because consumer may navigate via `onEventClick` instead |

### `EventListItem`

Used by `EventsCalendarView.tsx` (calendar markers + list cards) and by `ExportEventsToIcsConnector.tsx` (filtered to future).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable React key |
| `title` | `string` | `profile.displayName` |
| `description` | `string \| undefined` | Markdown source; truncated/preview rendered by component |
| `startDate` | `Date \| undefined` | UTC `Date`; rendered in viewer's local zone |
| `durationMinutes` | `number` | From fragment; used to compute end time / duration display |
| `durationDays` | `number \| undefined` | For multi-day cards |
| `wholeDay` | `boolean` | Drives "Whole day" badge and tooltip prefix |
| `type` | `string \| undefined` | Enum string (`DEADLINE`, `EVENT`, `MEETING`, `MILESTONE`, `OTHER`, `TRAINING`); component looks up i18n label |
| `url` | `string` | `profile.url` — the deeplink destination (`<space>/calendar/<event-name-id>`) |
| `subspaceName` | `string \| undefined` | When the event is a subspace event surfaced on the parent calendar (FR-035) — drives the "in {Subspace}" chip |

### `EventDetailData`

Used by `EventDetailView.tsx`.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `title` | `string` | `profile.displayName` |
| `description` | `string` | Markdown source; rendered via `MarkdownContent` |
| `bannerUrl` | `string \| undefined` | `profile.banner.uri`. When undefined, the `EventDetailView` renders a deterministic gradient using `resolveColor(event.id)` (callback prop on `EventDetailViewProps`) — see FR-015. |
| `tags` | `string[]` | `profile.tagset.tags` |
| `references` | `EventReference[]` | `profile.references` mapped to `{ id, name, uri, description? }` |
| `startDate` | `Date \| undefined` | UTC `Date` |
| `durationMinutes` | `number` | |
| `durationDays` | `number \| undefined` | |
| `wholeDay` | `boolean` | |
| `type` | `string \| undefined` | Enum string |
| `subspaceName` | `string \| undefined` | When detail is reached from parent calendar |
| `author` | `EventAuthor` | Derived from `createdBy.profile` (see `EventAuthor` table below). Avatar fallback colour is NOT carried on this shape — the `EventDetailView` derives it via `resolveColor(author.id)` when `author.avatarUrl` is undefined (FR-014a). |
| `createdDate` | `Date \| undefined` | For attribution caption |
| `loading` | `boolean` | True while detail query in flight; component shows skeleton (FR-013a) |
| `notFound` | `boolean` | When the event id resolves to `null` (deleted / wrong id); component shows "not found" state |

### `EventReference`

| Field | Type |
|---|---|
| `id` | `string` |
| `name` | `string` |
| `uri` | `string` |
| `description` | `string \| undefined` |

### `EventAuthor`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `name` | `string` | `profile.displayName` |
| `avatarUrl` | `string \| undefined` | `profile.visual(AVATAR).uri` |
| `profileUrl` | `string \| undefined` | `profile.url`, optional link target |

The avatar fallback colour is **not** carried on this shape. The `EventDetailView` derives it on demand by invoking `resolveColor(author.id)`, where `resolveColor` is a callback prop wired by the `EventDetailConnector` (which imports `pickColorFromId` from `@/crd/lib/pickColorFromId`). Same pattern applies to the banner fallback (`resolveColor(event.id)`).

### `EventFormValues`

State shape of `useCrdEventForm.ts`. Mirrors the MUI `CalendarEventFormData` shape but uses plain `Date` and discards `references` (the MUI form does not edit references either; they're set via the detail view's reference editor in a future migration).

| Field | Type | Notes |
|---|---|---|
| `displayName` | `string` | Required (FR-021) |
| `type` | `string \| undefined` | One of the 6 enum values; required (FR-021) |
| `startDate` | `Date \| undefined` | |
| `endDate` | `Date \| undefined` | Always present; same-day vs cross-day determines duration vs end-time UI (FR-022) |
| `wholeDay` | `boolean` | Default `false` |
| `durationMinutes` | `number \| undefined` | Used when start and end share a day; otherwise computed by connector at submit time |
| `description` | `string` | Markdown |
| `locationCity` | `string` | Free-form |
| `tags` | `string[]` | |
| `visibleOnParentCalendar` | `boolean` | Subspace only (FR-024); default `false` |

### `EventFormErrors`

`Partial<Record<keyof EventFormValues, string>>` — translated, user-facing error strings.

### `AddToCalendarLinks`

Used by `AddToCalendarMenu.tsx`.

| Field | Type | Notes |
|---|---|---|
| `googleUrl` | `string` | From `event.googleCalendarUrl` |
| `outlookUrl` | `string` | From `event.outlookCalendarUrl` |
| `icsUrl` | `string` | From `event.icsDownloadUrl` |
| `icsFilename` | `string` | `${event.profile.displayName}.ics` |

### `EventListPermissions`

Used by `CrdCalendarDialogConnector` to drive button visibility.

| Field | Type | Notes |
|---|---|---|
| `canCreateEvents` | `boolean` | From `useCalendarEvents().entities.privileges.canCreateEvents` |
| `canEditEvents` | `boolean` | |
| `canDeleteEvents` | `boolean` | |

## Mappers

All in `src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts`.

| Function | Input | Output |
|---|---|---|
| `mapCalendarEventInfoToSidebarItem(event)` | `CalendarEventInfoFragment` | `SidebarEventItem` |
| `mapCalendarEventInfoToListItem(event)` | `CalendarEventInfoFragment` | `EventListItem` |
| `mapCalendarEventDetailsToDetailData(event, opts)` | `CalendarEventDetailsFragment`, `{ loading, notFound }` | `EventDetailData` |
| `mapCalendarEventDetailsToFormValues(event)` | `CalendarEventDetailsFragment` | `EventFormValues` (for edit prefill) |
| `mapCalendarEventImportUrlsToLinks(event)` | `CalendarEventImportUrlsQuery['lookup']['calendarEvent']` | `AddToCalendarLinks` |

The sidebar mapper deliberately keeps `startDate` as a raw `Date` so the sidebar component formats it locale-aware via `date-fns` (justifies the breaking-change to `EventsSection` props).

## Validation rules

Implemented in `useCrdEventForm.ts` as direct checks against the current `values` snapshot (no `yup` schema — the rule set is small enough that hand-written checks are clearer). Mirrors `src/domain/timeline/calendar/views/CalendarEventForm.tsx:109-136`.

| Field | Rule | Error key (in `crd-space.calendar.validation.*`) |
|---|---|---|
| `displayName` | Required, non-empty after `.trim()` | `displayNameRequired` |
| `type` | Required (one of 6 enum values) | `typeRequired` |
| `description` | Markdown length ≤ `MARKDOWN_TEXT_LENGTH` — imported from `@/core/ui/forms/field-length.constants` (single source of truth shared with the legacy MUI form) | `descriptionTooLong` |
| `durationMinutes` | If `wholeDay === false` AND start+end share a day → must be `> 0` | `invalidDuration` |
| `endDate` | If `wholeDay === false` AND end is on a later day → must be after start | `endBeforeStart` |
| `wholeDay`-aware combo | The MUI `validateDuration` rule: `wholeDay || (sameDay && durationMinutes > 0) || endDate > startDate` | `invalidDuration` |

## State transitions

The `CrdCalendarDialogConnector` is a state machine over `view ∈ {'list', 'detail', 'create', 'edit'}` driven by URL state plus local `editingEventId` state. The delete confirmation is **not** a separate view — it's a Radix `AlertDialog` overlay on top of `'edit'`, owned by `useCrdEventFormDialog` (isDeleteOpen flag). This keeps the edit form mounted behind the confirmation, which is better UX and avoids a view-level remount.

| Trigger | From | To |
|---|---|---|
| URL contains `/calendar` (no event id, no `?new`) | any | `'list'` |
| URL contains `/calendar/{eventId}` | any | `'detail'` |
| URL contains `?new=1` | `'list'` | `'create'` |
| User clicks "Edit" on detail | `'detail'` | `'edit'` (sets `editingEventId`) |
| User clicks "Delete" on edit form | `'edit'` | `'edit'` + AlertDialog open (`isDeleteOpen=true`) |
| Delete confirmed | `'edit'` + AlertDialog | `'list'` (await delete → `onExitEdit()` + `navigateToList()`) |
| Delete cancelled | `'edit'` + AlertDialog | `'edit'` (closes the AlertDialog only) |
| Create submit success | `'create'` | `'detail'` (navigates to new event URL) |
| Edit submit success | `'edit'` | `'detail'` (navigates back via the existing event URL) |
| Form cancel / close | `'create' \| 'edit'` | previous view |
| Dialog `onOpenChange(false)` | any | dialog closes; URL stripped to dashboard |

### Form state seeding (key-driven remount)

`CrdCalendarDialogConnector` wraps the form body in an `<EventFormDialogBody key={editingEventId ?? 'create'}>` sub-component. React remounts this sub-component whenever `editingEventId` changes (switching between editing different events, or from edit back to create). The remount causes `useCrdEventFormDialog` — and the nested `useCrdEventForm(initialValues)` — to re-run, seeding fresh `initialValues` from the newly selected event without any imperative prefill or ref-based gating. This is the React 19 / React Compiler-friendly alternative to a `useEffect`-driven `form.prefill()` pattern.

## Permission-driven visibility

| UI element | Required permission |
|---|---|
| Sidebar `+` button (FR-004) | `canCreateEvents` |
| Timeline `+` (toolbar, list view) | `canCreateEvents` |
| Detail "Edit" button (FR-019) | `canEditEvents` |
| Edit-view "Delete" button (FR-028) | `canDeleteEvents` |
| Comments thread (FR-016) | `canReadComments` (from comments room privileges) |
| Comment input (FR-017) | `canPostComments` |
| Per-message "Delete" (FR-018) | platform-level delete OR author of the message |
| Per-message reactions (FR-017) | `canAddReaction` |
| Sidebar Events panel itself | `canRead` on the calendar (per spec edge case) |

## Time-zone handling

Per FR-039a:
- `startDate` from GraphQL is an ISO instant (UTC).
- Mappers parse it into a JS `Date` (the underlying value is still UTC; `Date` carries an absolute instant).
- All display formatting (`format(date, 'PPP', { locale })`, `format(date, 'p')`) renders in the viewer's local zone — `date-fns` defaults to local for `Date` arguments.
- The sidebar relative-date logic (`'Today' / 'Tomorrow' / 'in N days' / Apr 15`) compares dates by the viewer's local "start of day" using `date-fns/startOfDay`.
- Daylight-saving boundaries are handled by `Date` arithmetic; durations are stored as `number` minutes and added to the start `Date` at display time.

## Open data points (deferred)

- **References editor in the form** — the MUI form does not currently edit references. Out of scope; form omits this section. `references` continue to be edited via existing flows (or a follow-up).
- **Banner upload in the form** — the MUI form does not currently upload a banner; banner is set elsewhere. Out of scope.
- **Author profile link** — `EventAuthor.profileUrl` is included for forward compatibility; the v1 detail view may render the name as plain text and add the link in a follow-up if not desired now.
