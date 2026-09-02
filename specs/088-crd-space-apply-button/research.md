# Phase 0 Research — CRD Space Apply/Join Button on Dashboard

**Feature**: 088-crd-space-apply-button
**Date**: 2026-04-17

## Context

The entire CRD apply/join flow was designed, implemented, and translated in spec 087. This feature is a placement-and-wiring change: put the existing button at the top of the CRD Space Dashboard. As a result, most of Phase 0 is re-confirmation of 087's decisions applied to a new host page, rather than new research.

All `NEEDS CLARIFICATION` items were absent at spec time; the `/speckit.clarify` pass explicitly produced "No critical ambiguities detected worth formal clarification." This document records the five concrete decisions that shape the connector's behavior.

## Decision 1 — Placement inside `CrdSpaceDashboardPage`, not `CrdSpacePageLayout`

**Decision**: Render the connector inside `src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx`, above the `<CalloutListConnector>`. Do not render it in `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx`.

**Rationale**:
- Matches the legacy MUI precedent: `src/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage.tsx:77-92` renders `<ApplicationButton>` inside the Dashboard page only, wrapped in its own `<PageContent>` section above the dashboard view. Parity with that placement is an explicit scoping decision (FR-011).
- Rendering inside the Dashboard page means the button unmounts when the user switches to Community or Subspaces tabs — natural React behaviour that aligns with FR-011 without requiring any lifted state or tab-awareness logic.
- If the product later wants the CTA across all tabs, the change is a one-line move (from Dashboard page to `SpaceShell`'s children slot) — cheap to revisit.

**Alternatives considered**:
1. **Render in `CrdSpacePageLayout.tsx` between `SpaceShell`'s `tabs` slot and `children`** — rejected because it surfaces the CTA on every tab (Community, Subspaces), diverging from the MUI behaviour the spec requires (FR-011). Also forces the connector to mount on tabs that don't currently show it, creating an avoidable Apollo query on every tab navigation.
2. **Render inside `SpaceHeader` as an additional action area** — rejected because the header banner is stylistically "identity" content (title, tagline, member avatars); the apply CTA is a prominent interaction element that belongs in the content area, not inside the banner. Also creates overlap risk with the existing header action buttons on mobile.

## Decision 2 — Visibility guard: `!loading && !isMember`, mirroring MUI

**Decision**: The connector returns `null` whenever `applicationButtonProps.isMember === true` OR `loading === true`. No skeleton, no disabled placeholder, no reserved layout box.

**Rationale**:
- Directly mirrors the legacy MUI guard at `SpaceDashboardPage.tsx:79`: `{!loading && !applicationButtonProps.isMember && (...)}`.
- Satisfies FR-009 (members see no section) and FR-010 (no placeholder during loading) with the simplest possible predicate.
- Avoids the visible flicker a skeleton would cause while `useApplicationButtonQuery` resolves for a non-member: the button appears once when the state is known, rather than loading → skeleton → resolved state.

**Alternatives considered**:
1. **Render a skeleton during loading** — rejected because FR-010 explicitly forbids placeholder rendering during loading. A skeleton would also be visually heavier than the actual button in most final states.
2. **Render the button with `loading={true}` (spinner)** — rejected because the CRD button's loading state is a disabled full-width spinner; showing that to members would be a brief "this Space has something loading" signal they never need to see, and showing it before we know if the viewer is a member violates the "members see nothing" outcome.

## Decision 3 — State mapping reuses the 087 wiring verbatim

**Decision**: The connector maps `applicationButtonProps` (returned by `useApplicationButton`) to `SpaceAboutApplyButton` props using the same one-to-one mapping already present in `CrdSpaceAboutPage.tsx:162-183`. No prop is renamed, no state is re-derived, no state is added.

**Rationale**:
- The mapping is known-correct — it has been through a full spec (087), a plan, and implementation. Reusing it verbatim removes any risk of behavioural drift between the About dialog CTA and the Dashboard CTA.
- Keeps the connector genuinely thin: it is a prop-pass-through plus dialog state management, not a second state machine.
- Supports FR-003's enumerated states because the mapping is exhaustive: every state the button can render is wired to the same callback signatures used by About.

**Alternatives considered**:
1. **Introduce a shared helper `mapApplicationButtonPropsToCrdProps()` in `src/domain/` or a utils file** — rejected as over-engineering for two call sites (About + Dashboard). If a third consumer appears, that is the moment to extract; premature extraction costs more than the inline mapping.

## Decision 4 — Login URL uses `applicationButtonProps.applyUrl` (same as About)

**Decision**: When an unauthenticated viewer activates the CTA, `onLoginClick` calls `navigate(buildLoginUrl(applicationButtonProps.applyUrl))` — identical to About dialog behaviour at `CrdSpaceAboutPage.tsx:177`.

**Rationale**:
- `applyUrl` resolves to the Space profile URL (`space?.about.profile.url`) inside the `useApplicationButton` hook. The Space profile URL is the Space's root route; after sign-in, the user lands on the Space root which in the CRD layout defaults to the Dashboard tab. So the user returns to the exact page they started from (Dashboard) after authenticating. This satisfies FR-008 ("preserve the current location").
- Reusing the 087 login flow guarantees no divergence between the two entry points: anyone who signs in from Dashboard ends up in the same state they would if they had signed in from About.

**Alternatives considered**:
1. **Construct an explicit Dashboard URL with `?section=1`** — rejected because the Dashboard is already the default section; the section query parameter is redundant when the viewer returns to the Space root. Adding it would also hard-code a section number into a new place in the code base.
2. **Use the current `window.location.href` as the return URL** — rejected because `window.location.href` may include transient query params (e.g., dialog state) that should not be part of the post-auth destination.

## Decision 5 — `onUpdateInvitation` / refetch is handled by the existing connectors

**Decision**: The connector does not add its own refetch logic. `onJoin` (inside `useApplicationButton`) already runs `clearCacheForType(cache, 'Authorization')` and re-fetches the current-user profile. The apply mutation in `ApplyDialogConnector` already drives Apollo cache updates that cause `useApplicationButtonQuery` and `useUserPendingMembershipsQuery` to re-render the button in its new state. The invitation accept/reject mutations in `InvitationDetailConnector` likewise update the cache via their `update:` handlers.

**Rationale**:
- FR-004's requirement ("update without manual refresh") is already met by the 087 mutation wiring. No new refetch call is needed at the connector level.
- Introducing an extra `refetch()` call at the Dashboard level would either duplicate the work (double network round-trip) or conflict with the existing cache updates.

**Alternatives considered**:
1. **Explicitly call `applicationButtonProps.onUpdateInvitation` after each flow surface closes** — rejected as unnecessary. The existing cache invalidation already covers this path; doing it manually risks double-fetching.

## Technology / Dependency Delta

No new dependencies. The feature reuses:
- `react-i18next` (already in deps) via the existing CRD button's `useTranslation('crd-space')` call.
- `@apollo/client` via existing generated hooks.
- `lucide-react` icons via the existing CRD button.
- shadcn/ui primitives via the existing CRD dialogs.

The React Compiler continues to handle memoization automatically; no `useMemo` / `useCallback` / `React.memo` are introduced.

## Testing Strategy

- **No new unit tests required.** The connector is a thin wrapper over components and hooks already exercised by 087's component tests and the existing domain tests for `useApplicationButton`.
- **Existing suites**: `pnpm vitest run` must continue to pass unchanged. Type checking via `pnpm lint` covers the prop surfaces.
- **Manual verification**: the nine-scenario matrix captured in [`quickstart.md`](./quickstart.md) covers every membership state enumerated in FR-003, plus the toggle on/off swap (FR-019), plus the mutation-failure edge case (FR-013).

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Dialog state leaks across tab switches (user opens Apply dialog, switches to Community tab, returns to Dashboard) | Low | Low | The dialogs live inside the Dashboard page; switching tabs unmounts the entire Dashboard and with it all dialog state. Returning to Dashboard reopens it in a fresh state, which is the expected behaviour. |
| `useApplicationButton` fires for members too (wasted query when user is a member) | Low | Low | The query is the same one the About dialog already issues for this Space. It's cached, so a member visiting Dashboard and then About will not double-fetch. Acceptable for feature-parity. |
| The CRD button's `w-full` class makes the CTA very wide on large Dashboard viewports | Low | Low | Matches MUI `FullWidthButton` behaviour. Product can adjust via the connector's `className` prop (e.g., `max-w-sm`) post-launch without touching the presentational component. |
| Navigation from parent-prompt surface takes the user off the current Space | Expected | None | This is the correct behavior: the parent-prompt surface explicitly links to the parent Space (FR-007). No mitigation needed. |

## Summary

All decisions are either direct re-uses of 087's wiring (Decisions 3, 4, 5) or trivial placement choices derived from the MUI precedent (Decisions 1, 2). No new research surfaces. Ready for Phase 1.
