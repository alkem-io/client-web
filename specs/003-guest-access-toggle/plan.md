# Implementation Plan: Whiteboard Guest Access Toggle

**Branch**: `[001-guest-access-toggle]` | **Date**: 2025-11-17 | **Spec**: specs/003-guest-access-toggle/spec.md
**Input**: Feature specification from `/specs/003-guest-access-toggle/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable authorized facilitators to toggle whiteboard guest access within the Share dialog while synchronizing UI warnings and public link visibility with the backend-confirmed `guestContributionsAllowed` flag. The plan extends the whiteboard domain façade, introduces a dedicated GraphQL mutation for the toggle, and updates Share dialog surfaces to react to Apollo cache changes and render accessible warning banners aligned with the provided Figma references.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x (Vite React 19 SPA)
**Primary Dependencies**: React 19, Apollo Client 3, React Router, MUI + Emotion, i18next
**Storage**: N/A (client caches via Apollo normalized cache)
**Testing**: Vitest with React Testing Library stubs
**Target Platform**: Modern Chromium, Firefox, and Safari browsers via Vite dev/build
**Project Type**: Single-page web application
**Performance Goals**: Guest toggle completes with backend confirmation in <10s; Share dialog renders warnings without additional loading skeletons; no regression to initial dialog render time (>1s)
**Constraints**: Maintain React 19 concurrency safety (use transitions for asynchronous toggles), ensure warning banners meet WCAG 2.1 AA, avoid breaking Apollo cache normalization
**Scale/Scope**: Applies across spaces with thousands of whiteboards; touches whiteboard domain façade, Share dialog orchestrator, and associated Vitest suites (<20 files expected)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Domain Alignment**: Update the whiteboard collaboration façade in `src/domain/collaboration/whiteboard` (containers + hooks) to expose `guestContributionsAllowed` and a toggle helper while keeping Share dialog components under `src/domain/shared/components/ShareDialog` orchestration-only.
- **React 19 Concurrency**: Use `startTransition` (or `useTransition`) around the mutation to avoid blocking renders, show a pending state on the toggle, and document any leftover synchronous code paths in Share dialog legacy components.
- **GraphQL Contract**: Extend `WhiteboardDetails` and related fragments to include `guestContributionsAllowed`; add the `updateWhiteboardGuestAccess` mutation document; run `pnpm codegen` and capture schema diff review in PR notes.
- **State & Effects**: Drive state exclusively from Apollo normalized cache; mutation response updates caches via generated helpers without duplicating React state; notifications funnel through existing domain toast service.
- **Experience Safeguards**: Add Vitest coverage for toggle success/denial flows, ensure warning banners have proper ARIA roles and translations, record telemetry for toggle attempts/outcomes, and verify no performance regression in Share dialog load.

_Post-design reassessment_: requirements above remain satisfied; no Constitution violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── core/
│   ├── apollo/
│   ├── ui/
│   └── utils/
├── domain/
│   ├── collaboration/
│   │   └── whiteboard/
│   │       ├── containers/
│   │       ├── WhiteboardDialog/
│   │       └── utils/
│   └── shared/
│       └── components/
│           └── ShareDialog/
└── main/
  └── ui/

tests/
└── domain/
  └── shared/components/ShareDialog/__tests__/
```

**Structure Decision**: Reuse existing SPA layout—enhancements live under `src/domain/collaboration/whiteboard` for domain façades and `src/domain/shared/components/ShareDialog` for UI orchestration, with supporting utilities in `src/core` and component tests colocated in `src/domain/shared/components/ShareDialog/__tests__`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution violations anticipated; table not required.
