# Implementation Plan: CRD Space Timeline / Calendar / Events

**Branch**: `086-crd-space-timeline` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/086-crd-space-timeline/spec.md`

## Summary

Migrate the Space Timeline (calendar dialog + event list + create/edit form + detail view + comments + ICS/Google/Outlook export) from MUI to the CRD design system. The feature lights up the placeholder `EventsSection` sidebar in the CRD dashboard and ships a CRD-native modal dialog (Sheet on phones) that mirrors the MUI deeplink schema (`/calendar`, `?highlight=`, `?new=1`, `/calendar/{event-name-id}`). All GraphQL queries, mutations and domain hooks under `src/domain/timeline/calendar/` are reused unchanged; we add a CRD presentational layer (`src/crd/components/space/timeline/`, plus three new form-field composites and a calendar primitive) and a connector layer (`src/main/crdPages/space/timeline/`) that bridges Apollo and routing to the CRD components. The legacy MUI dashboard route stays functional behind the existing CRD feature toggle.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `react-day-picker@^8`, `date-fns` (peer of RDP, new), `class-variance-authority`, `lucide-react`, Apollo Client, Vite, `dayjs` (existing in domain hooks), `yup` (existing — used standalone for form validation, no Formik in CRD), React Compiler (`babel-plugin-react-compiler`)
**Storage**: N/A (frontend SPA; data via existing GraphQL queries — no schema changes)
**Testing**: Vitest with jsdom; manual end-to-end verification per `quickstart.md`
**Target Platform**: Web SPA — Vite dev server at `localhost:3001`, backend at `localhost:3000`. Modern evergreen browsers; mobile breakpoint at <768px (full-screen Sheet) and ≥768px (centred modal Dialog)
**Project Type**: Web SPA — established three-layer CRD architecture (CRD → crdPages connector → routing)
**Performance Goals**: Equal or better than MUI `CalendarDialog`. Sidebar adds zero extra network requests (Apollo dedupes the `useSpaceCalendarEventsQuery` between sidebar hook and dialog connector). External-calendar URL query is lazy-loaded on first dropdown open. No additional initial-paint cost vs. legacy.
**Constraints**: Zero `@mui/*` / `@emotion/*` / `@apollo/client` / `@/domain/*` / `@/core/apollo/*` / `react-router-dom` / `formik` imports inside `src/crd/`. WCAG 2.1 AA compliant. React Compiler compatible (no `useMemo` / `useCallback` / `React.memo`). `.crd-root` CSS scoping unchanged. Form state lives in connector layer (`useState` + standalone `yup`, no Formik). Date-lib boundary: CRD components use `date-fns`; connectors and existing domain hooks use `dayjs`; mappers normalise to plain JS `Date` at the boundary.
**Scale/Scope**: ~10 new CRD presentational components + 1 primitive + 3 form-field composites + 7 connectors + 2 hooks + 1 data mapper. ~60 i18n keys across 6 languages. 43 functional requirements across 7 user stories. Tested with up to 100 events per space (per SC-004).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Post-design re-check (2026-04-15): No new violations introduced by Phase 1. Data model keeps GraphQL types in the connector layer only; CRD prop types are plain TS. Contracts confirm presentational components own no domain logic. The two intentional violations (Tailwind+MUI coexistence, dual calendar deps) are bounded and unchanged.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | All domain logic stays in `src/domain/timeline/calendar/` (existing hooks reused unchanged). CRD components are presentational only. Connectors in `src/main/crdPages/space/timeline/` orchestrate domain hooks and pass plain TS data to CRD. |
| II | React 19 Concurrent UX Discipline | PASS | No legacy lifecycle patterns. Skeleton loading via FR-013a uses Suspense-friendly placeholders. No `useMemo` / `useCallback` / `React.memo` (React Compiler handles memoisation). Form submission can leverage `useTransition` for the save action. |
| III | GraphQL Contract Fidelity | PASS | Reuses generated hooks (`useSpaceCalendarEventsQuery`, `useCalendarEventDetailsQuery`, `useCreateCalendarEventMutation`, `useUpdateCalendarEventMutation`, `useDeleteCalendarEventMutation`, `useCalendarEventImportUrlsQuery`). No schema changes. CRD prop types are plain TS — never generated GraphQL types. |
| IV | State & Side-Effect Isolation | PASS | CRD components have visual-only state (open/close, hover, expanded). Form state lives in `useCrdEventForm` (connector). URL state lives in `useCrdCalendarUrlState` (connector). No direct DOM access except focus management which Radix handles. |
| V | Experience Quality & Safeguards | PASS | WCAG 2.1 AA mandated by FR-040 / FR-041 / FR-042. Manual verification plan in `quickstart.md`. Performance budget per SC-004; no additional roundtrips. |
| Arch 1 | Feature directory taxonomy | PASS | `src/crd/components/space/timeline/` for presentation, `src/main/crdPages/space/timeline/` for connectors, `src/domain/timeline/calendar/` for domain (unchanged). |
| Arch 2 | Styling standard | **VIOLATION** (intentional) | Tailwind alongside MUI during the CRD migration. Same intentional violation tracked by 039 / 042. Tracked below. |
| Arch 3 | i18n pipeline | PASS | New keys added to existing `crd-space` namespace (`src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json`). EN edited directly; other languages manually managed (CRD convention, not Crowdin). |
| Arch 4 | Build determinism | PASS | No Vite config changes. New deps (`react-day-picker`, `date-fns`) are pure ESM and tree-shakeable. |
| Arch 5 | Import transparency | PASS | No barrel exports introduced. All imports use explicit file paths. |
| Arch 6 | SOLID / DRY | PASS | Comments connector reuses the existing `mapRoomToCommentData` and `usePostMessageMutations` patterns from `CalloutCommentsConnector`. Form follows `useCrdCalloutForm` shape. Date formatting centralised in CRD components, not duplicated per consumer. |
| Eng 5 | Root cause analysis | PASS | No workarounds. The single known visual deviation from MUI (multi-day-event highlighting via RDP modifiers) is documented and accepted in `research.md`. |

### Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Tailwind + MUI coexistence | The CRD migration is incremental; the legacy MUI dashboard must keep working behind the feature toggle (FR-043 / SC-008) until every page is migrated. Removing MUI today would break the rest of the app. | Removing MUI now is out of scope for this feature; ripping it out wholesale was rejected by the project for the duration of the migration. |
| New `react-day-picker` dependency while `react-calendar` stays | The shadcn-standard primitive uses RDP and the prototype file at `prototype/src/app/components/ui/calendar.tsx` already targets it; reusing `react-calendar` would force CRD code to ship MUI-compatible CSS overrides. `react-calendar` cannot be removed yet because the legacy MUI `FullCalendar.tsx` still uses it. | Reusing `react-calendar` with a Tailwind theme rejected because it diverges from CRD conventions and the prototype. The duplicate dependency is bounded — `react-calendar` is removed when the MUI toggle is retired. |

## Project Structure

### Documentation (this feature)

```text
specs/086-crd-space-timeline/
├── plan.md              # This file
├── spec.md              # Feature specification (with clarifications)
├── research.md          # Phase 0: research & decisions
├── data-model.md        # Phase 1: CRD prop types & data mappings
├── quickstart.md        # Phase 1: developer setup + manual verification
├── contracts/           # Phase 1: presentational component prop interfaces
│   ├── crd-presentational.ts
│   ├── crd-form-fields.ts
│   ├── connector-hooks.ts
│   └── data-mappers.ts
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks — not produced here)
```

### Source code (repository root)

```text
src/crd/                                          # Pure presentational layer
├── primitives/
│   └── calendar.tsx                              # NEW — port of prototype DayPicker primitive
├── forms/
│   ├── DateField.tsx                             # NEW — Popover + Calendar (controlled)
│   ├── TimeField.tsx                             # NEW — native <input type="time"> styled
│   └── DurationField.tsx                         # NEW — number input + "ends at HH:mm" caption
├── components/space/timeline/                    # NEW directory
│   ├── TimelineDialog.tsx                        # Modal/Sheet shell (responsive)
│   ├── EventsCalendarView.tsx                    # Calendar + list (or collapsed-calendar on mobile)
│   ├── EventCard.tsx
│   ├── EventCardHeader.tsx
│   ├── EventDateBadge.tsx
│   ├── EventDetailView.tsx                       # Banner + body + comments slot + author caption
│   ├── EventForm.tsx                             # Controlled form (no Formik)
│   ├── AddToCalendarMenu.tsx                     # Dropdown (Google/Outlook/ICS)
│   ├── DeleteEventConfirmation.tsx               # AlertDialog wrapper
│   └── icons/
│       └── CrdAddToCalendarIcons.tsx             # Wraps raw .svg?react brand icons
├── components/space/sidebar/
│   └── EventsSection.tsx                         # MODIFY — props evolved (raw Date + url)
├── i18n/space/
│   └── space.{en,nl,es,bg,de,fr}.json            # MODIFY — add calendar.* + sidebar relative dates

src/main/crdPages/space/                          # Integration / connector layer
├── timeline/                                     # NEW directory
│   ├── CrdCalendarDialogConnector.tsx            # Top-level state machine
│   ├── EventDetailConnector.tsx
│   ├── CalendarCommentsConnector.tsx
│   ├── AddToCalendarMenuConnector.tsx
│   ├── ExportEventsToIcsConnector.tsx
│   ├── useCrdCalendarUrlState.ts
│   └── useCrdEventForm.ts
├── hooks/
│   └── useCrdCalendarSidebar.ts                  # NEW — shares Apollo cache with dialog connector
├── dataMappers/
│   └── calendarEventDataMapper.ts                # NEW — fragment → CRD prop types
├── tabs/
│   └── CrdSpaceDashboardPage.tsx                 # MODIFY — wires sidebar events + mounts dialog connector
└── routing/
    └── CrdSpaceRoutes.tsx                        # MODIFY — add /calendar and /calendar/:nameId routes

src/domain/timeline/calendar/                     # UNCHANGED — reused in connectors
├── calendarQueries.graphql
├── useCalendarEvents.ts
├── useCalendarEventDetail.ts
├── utils/icsUtils.ts
├── components/icons/{google,outlook,download-calendar}.svg   # raw .svg files reused
└── ... legacy MUI files left intact for the toggle-off code path

package.json                                       # MODIFY — add react-day-picker, date-fns
```

**Structure Decision**: Three-layer CRD architecture (presentational → connector → routing) already established by 039 / 042. This feature adds a new presentational sub-tree (`crd/components/space/timeline/`) and a new connector sub-tree (`crdPages/space/timeline/`), wires them into the existing `CrdSpaceDashboardPage` and `CrdSpaceRoutes`, and modifies one existing CRD component (`EventsSection`). No changes to `src/domain/timeline/calendar/` other than continued reuse of its hooks and ICS utilities. The legacy MUI `CalendarDialog` and `DashboardCalendarSection` remain untouched until the CRD feature toggle is retired (per FR-043 / SC-008).

## Phase 0 — Outline & Research

See `research.md`. The clarification phase resolved the spec-level ambiguities; Phase 0 documents the implementation decisions that remained: calendar library choice, date-library boundary, form-state pattern, comments-connector reuse, mobile responsive pattern, multi-day highlighting strategy, lazy loading of external-calendar URLs, time-zone display rule.

## Phase 1 — Design & Contracts

See:

- `data-model.md` — CRD prop types (plain TS), connector return shapes, GraphQL fragment → prop-type mappings, validation rule table.
- `contracts/` — TypeScript interfaces (no implementations) for every presentational component, form-field composite, connector hook and data mapper. These are the contracts a tasks file (`/speckit.tasks`) and code reviewers use to verify implementation matches intent.
- `quickstart.md` — Steps to install dependencies, enable the CRD feature toggle, and walk through every user story end-to-end, including the deeplink scenarios and the responsive (mobile) sheet layout.

### Agent context update

`update-agent-context.sh claude` is invoked at the end of this phase to refresh `CLAUDE.md` with the new dependency (`react-day-picker`, `date-fns`) so future agent runs know they are available without re-discovery.

## Phase 2 — Tasks

Out of scope for `/speckit.plan`. To be produced by `/speckit.tasks` consuming the artifacts in this folder.
