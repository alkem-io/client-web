# Phase 0 Research: CRD Space Timeline

All spec-level ambiguities were resolved during `/speckit.clarify`. The decisions documented below resolve the remaining implementation-level unknowns.

## R1 — Calendar library

**Decision**: Adopt `react-day-picker@^8` (RDP) and port the prototype primitive at `prototype/src/app/components/ui/calendar.tsx` to `src/crd/primitives/calendar.tsx`. Add `date-fns` as an explicit peer dependency.

**Rationale**:
- It is the shadcn-standard calendar library; the prototype already targets it with the v8 `classNames` shape.
- The CRD design system uses `lucide-react` icons and Tailwind utility classes — RDP integrates with both natively.
- Keyboard navigation, focus management and ARIA grid semantics ship out of the box.
- We can express "event-day", "event-start", "event-end", "event-between", "past" via RDP `modifiers` + `modifiersClassNames` without forking the library.

**Alternatives considered**:
- *Reuse the existing `react-calendar` dep* — rejected. It is already in `package.json` because the legacy MUI `FullCalendar.tsx` uses it, but its API and class naming diverges from shadcn idioms; styling it to match the rest of the CRD system would require shipping CSS overrides that conflict with Tailwind. We will retire `react-calendar` when the CRD feature toggle is removed and the legacy `FullCalendar.tsx` is deleted.
- *RDP v9* — rejected for v1 because v9 changed the `classNames` map and the prototype targets v8. Migrating the prototype to v9 is a separate spec-of-its-own.
- *Building a custom calendar grid with `dayjs`* — rejected. Reinventing month grid + keyboard nav + month navigation + locale formatting + accessibility ships unnecessary risk.

## R2 — Date-library boundary

**Decision**: CRD components and the data mappers use `date-fns`. Connectors and the existing domain hooks use `dayjs`. The boundary is the data mapper, which produces plain JS `Date` objects.

**Rationale**:
- `date-fns` is the implicit ecosystem date library for `react-day-picker` and shadcn-style components.
- `dayjs` is already pervasive in `src/domain/` and uprooting it is out of scope.
- Plain `Date` is the lingua franca that crosses the boundary cleanly without dragging either library across the layer line.

**Alternatives considered**:
- *Use `dayjs` everywhere* — possible but loses RDP's locale-aware formatting story; would require manual locale plumbing.
- *Use `date-fns` everywhere* — too invasive given the size of the existing domain layer.

## R3 — Form-state pattern

**Decision**: `useState` in `useCrdEventForm.ts`, with hand-written validation checks mirroring the MUI yup schema. No Formik in the CRD or connector layer.

**Rationale**:
- CRD purity rule forbids Formik in `src/crd/`.
- The CRD callout migration already established the `useState`-driven pattern in `src/main/crdPages/space/hooks/useCrdCalloutForm.ts`. Following the same pattern keeps the codebase cohesive.
- The rule set (displayName required, type required, description length ≤ `MARKDOWN_TEXT_LENGTH`, duration/end combo per MUI `validateDuration`) is small enough that hand-written checks are clearer than a yup schema. Importing `yup` for ~20 lines of validation would add indirection without benefit; the error keys map directly to `calendar.validation.*` i18n entries.

**Alternatives considered**:
- *Use `yup` for the schema* — considered in the spec draft but the final implementation prefers direct checks for readability. The MUI schema at `CalendarEventForm.tsx:109-136` is the source of truth for *which* rules to enforce; the *how* (yup vs hand-written) is a style choice.
- *Formik in the connector layer* — allowed by CRD rules (connectors may import anything) but inconsistent with the established `useCrdCalloutForm` pattern.
- *react-hook-form* — not in the project; introducing it for one feature is needless dependency drift.

### Form seeding (key-driven remount, post-review refactor)

Initial values for an edit-mode form are seeded via `useCrdEventForm(initialValues)`'s lazy `useState` initializer. The dialog connector mounts the form subtree with `key={editingEventId ?? 'create'}` so React remounts it when the user switches to editing a different event; the hook re-seeds from the new `initialValues` on remount. This replaces an earlier `useRef`-gated `useEffect` that called an imperative `form.prefill()` helper — the remount approach is React 19 / React Compiler-friendly and eliminates the manual reconciliation logic.

## R4 — Comments connector reuse

**Decision**: New `CalendarCommentsConnector.tsx` mirrors `src/main/crdPages/space/callout/CalloutCommentsConnector.tsx` but accepts the room object directly (the room is already loaded by `useCalendarEventDetail`, so no lazy `useInView` Apollo query). Reuse `mapRoomToCommentData`, `usePostMessageMutations`, `useCommentReactionsMutations`, `useRemoveMessageOnRoomMutation`, and the existing CRD `CommentThread` + `CommentInput` composites.

**Rationale**:
- The CRD comment composites are already battle-tested by the callout migration. Re-implementing a parallel comments tree just for events would be DRY-violating.
- Returning `{ thread, commentInput, commentCount }` via render-prop matches the established pattern and lets `EventDetailView` inject the slots into its layout.
- Refactoring to share a `useCrdRoomComments` hook between callout and calendar comments is desirable but **out of scope** for this feature; documented as a follow-up.

**Alternatives considered**:
- *Reuse `CalloutCommentsConnector` directly* — rejected. It assumes a callout/contribution context (`useCalloutContributionCommentsQuery`) and forces lazy loading we don't need.
- *Build new comments primitives* — rejected. Existing CRD comment components meet the spec.

**Update (post analyze round 2)**: The shared hook is **in scope** as task T023a in `tasks.md` — `src/main/crdPages/space/hooks/useCrdRoomComments.ts`. Both the existing `CalloutCommentsConnector` and the new `CalendarCommentsConnector` consume it. The callout connector keeps its lazy-load wrapper (`useInView` + `useCalloutContributionCommentsQuery`) and forwards `skipSubscription: !inView` to the hook; the calendar connector consumes the hook with the default (always subscribe). This satisfies constitution Arch 6f (DRY) and closes finding F3 from the second analyze pass.

## R5 — Mobile responsive pattern

**Decision**: Two-layer responsive shell.
- **Tablet+ (≥768px)**: `Dialog` from `src/crd/primitives/dialog.tsx` (centred modal).
- **Phone (<768px)**: `Sheet` from `src/crd/primitives/sheet.tsx` rendered as a full-screen drawer (`side="bottom"` with `h-[100dvh]`).

The `TimelineDialog` shell internally branches on `useMediaQuery('(min-width: 768px)')` (already exists in `src/crd/hooks/useMediaQuery.ts`) and renders the appropriate primitive while keeping the same `children` and slot API.

**List view**:
- **Tablet+**: Calendar left, list right (two-column).
- **Phone**: Calendar collapsed behind a "Pick a date" trigger above the list. Trigger opens an inline expanded panel (NOT a Popover, to avoid double-modal stacking). Selecting a date collapses it.

**Detail view**:
- **Tablet+**: Banner+description left column, comments right column.
- **Phone**: Stacked vertically — banner+description first, comments after.

**Form**:
- **Tablet+**: Two columns where the MUI form has them (start row vs end row, location vs tags).
- **Phone**: All rows stack vertically.

**Rationale**:
- Matches the rest of the CRD design system's mobile pattern (Sheet on mobile, Dialog on desktop).
- Uses primitives already in `src/crd/primitives/` — no new primitive required.
- A collapsed-calendar pattern keeps the events list visible immediately on a phone, which is the more common consume path on small screens.

**Alternatives considered**:
- *Same Dialog at all sizes* — rejected per Q1: cramming two columns into 360px is unworkable and a 100dvh modal that's not a sheet is an anti-pattern on mobile.
- *Phone calendar always inline at top* — rejected: the calendar grid plus day-of-week header consumes ~280px of vertical space, leaving little room for the list above the fold. Collapsing it gives the list more space and keeps it one tap away.

## R6 — Multi-day event highlighting

**Decision**: Use RDP `modifiers` + `modifiersClassNames` to mark cells:
- `eventStart` → rounded-l-md + light primary fill
- `eventEnd` → rounded-r-md + light primary fill
- `eventBetween` → straight edges + light primary fill
- `past` → muted text colour

Multi-day events show as a connected horizontal band across the calendar week, with rounded corners only at the very start and end. A day that is *both* end-of-event-A and start-of-event-B will receive both modifiers; the styles are additive and read cleanly because both apply the same fill colour.

**Rationale**:
- Pure RDP idiom — no DOM manipulation, no overlay layer.
- Visual fidelity is "close to" the MUI `react-calendar` look without being pixel-identical. Acceptable trade-off.
- Computation of which dates fall into which bucket is `O(events × dayspan)` per render but bounded by SC-004's "up to 100 events" budget.

**Alternatives considered**:
- *Absolutely-positioned overlay layer that paints continuous bars across week rows* — better fidelity but doubles the rendering complexity and requires measuring the RDP DOM. Track as a follow-up if stakeholders push back on visual.
- *No multi-day visualization (start-only markers)* — rejected: spec FR-006 explicitly requires marking start, end, and days in between.

## R7 — Tooltip on calendar cells

**Decision**: Wrap each marked day cell in `Tooltip` from `src/crd/primitives/tooltip.tsx` via RDP `components.DayContent`. Tooltip content lists every event on that day (start time or "Whole day", followed by title). `delayDuration` set to ~300ms to avoid hover spam. Focus-driven tooltip activation works automatically (Radix Tooltip handles keyboard focus the same as hover).

**Rationale**:
- Per-cell Tooltip is what Radix is built for; performance is fine for ≤100 events.
- Keyboard accessibility is preserved (FR-040).

**Alternatives considered**:
- *One shared tooltip with date-driven content* — would require manually positioning a single popover relative to the focused cell; reinventing what Radix Tooltip already does.

## R8 — Lazy loading of external-calendar URLs

**Decision**: `AddToCalendarMenuConnector` uses controlled `<DropdownMenu open onOpenChange>` and a state flag to skip `useCalendarEventImportUrlsQuery` until the menu is first opened. Once loaded, the URLs stay cached by Apollo.

**Rationale**:
- Matches the legacy MUI behaviour exactly (anchor-driven lazy load).
- Saves one network roundtrip per event detail view that the user never opens the menu on.

**Alternatives considered**:
- *Eager fetch with the detail query* — would inflate the detail query payload and add a network call per detail view, even when the user never exports.

## R9 — Time-zone display rule

**Decision** (from spec clarification): Store events in UTC (existing GraphQL behaviour) and render them in the viewer's local browser time zone using `date-fns/format` (which is local-zone by default for `Date` arguments). No per-space or per-event time zone configuration.

**Rationale**:
- Matches MUI behaviour bit-for-bit.
- Standard for collaborative apps where attendees join from anywhere.
- The "show as scheduled in author's timezone" UX is a future enhancement (out of scope).

## R10 — Apollo cache sharing between sidebar and dialog

**Decision**: Both `useCrdCalendarSidebar` (sidebar hook) and `CrdCalendarDialogConnector` (dialog) call `useCalendarEvents({ spaceId, parentSpaceId })`. Apollo's normalised cache deduplicates the underlying `useSpaceCalendarEventsQuery({ spaceId, includeSubspace })` call when variables match, so opening the dialog produces no extra network request.

**Rationale**:
- One source of truth, zero extra requests, no need for a context provider.
- Matches the established pattern in 042 between the sidebar and the dashboard tab.

**Alternatives considered**:
- *Lift state to a CalendarContext provider* — unnecessary given Apollo's cache. Adds boilerplate and an extra component layer with no benefit.

## R11 — `?new=1` URL as single source of truth

**Decision**: The sidebar `+` button and the timeline `+` button both push `?new=1` via the connector's `navigateToCreate()` helper. The `CrdCalendarDialogConnector` reads the param and renders the create form. Closing the form clears the param.

**Rationale**:
- One source of truth — the URL — keeps the deeplink, the bookmarkability and the in-app behaviour consistent.
- Avoids a parallel `initialMode` prop that could drift out of sync with the URL.

## R12 — Routing integration

**Decision**: Add two protected sub-routes under the existing `CrdSpaceRoutes`:
- `path="calendar"` → renders `CrdSpaceTabbedPages` (so the URL resolver populates `calendarEventId` etc.)
- `path={\`calendar/:${nameOfUrl.calendarEventNameId}\`}` → same renderer

The dashboard tab continues to be selected via `?section=N` (verified from `useCrdSpaceTabs.tsx`), so adding these sub-routes does not change tab selection — the dialog opens *over* the dashboard tab. This is identical to the MUI flow where `SpaceDashboardPage` reads the dialog param and renders `<CalendarDialog open={dialog === 'calendar'} />`.

**Rationale**:
- Reuses the existing URL resolver — no new resolver logic.
- Preserves all four deeplink shapes (FR-036) without bespoke routing.

## R13 — Brand SVGs for "Add to calendar"

**Decision**: Reuse the raw `.svg` files from `src/domain/timeline/calendar/components/icons/{google,outlook,download-calendar}.svg` via Vite's `?react` plugin import. Wrap each in a plain `<span>` with Tailwind sizing inside `src/crd/components/space/timeline/icons/CrdAddToCalendarIcons.tsx`. For the ICS calendar trigger icon, use `lucide-react`'s `CalendarDays`.

**Rationale**:
- Raw SVG files are framework-agnostic and reusable; only the existing MUI wrapper component (`AddToCalendarIcons.tsx`) is forbidden in CRD.
- Avoids re-licensing or re-tracing the brand glyphs.

**Alternatives considered**:
- *Inline the SVGs in the CRD file* — works but duplicates the asset and risks drift.

## R14 — ICS export utilities

**Decision**: Reuse `src/domain/timeline/calendar/utils/icsUtils.ts` (RFC 5545 helpers) directly from `ExportEventsToIcsConnector.tsx`. The utils are framework-agnostic.

**Rationale**:
- The connector layer is allowed to import from `@/domain/*`. The utilities are pure functions with no MUI or React dependencies.
- No need to relocate the file.

## R15 — Skeleton loading state

**Decision** (from spec FR-013a): On dialog open, render the calendar shell (month grid + month-nav arrows) immediately. Right pane shows 3–5 `Skeleton` rows from `src/crd/primitives/skeleton.tsx` until events arrive. Calendar markers fade in when `useCalendarEvents` resolves. The detail-view connector renders banner/title/description skeletons until `useCalendarEventDetail` resolves.

**Rationale**:
- Established CRD pattern — `Skeleton` primitive already in place.
- Stable dialog frame avoids layout jank.
- Matches the dashboard sidebar's existing skeleton convention.

## Risks accepted

- **Multi-day visual deviation from MUI** (R6) — accepted; can be revisited via overlay layer if stakeholders object.
- **`react-day-picker` v8 vs v9 drift** — bounded by pinning to `^8` in `package.json`; v9 adoption tracked separately.
- **Dual date libraries (`date-fns` + `dayjs`)** — bounded by the mapper boundary; not a long-term concern.
- **Last-write-wins on concurrent edits** — matches MUI behaviour today; no conflict-resolution UX in v1.
