# Feature Specification: CRD Search — Scope Switching (Platform vs. Current Space)

**Feature Branch**: `093-crd-search-scope`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description: "We did the search dialog CRD migration in #9518 (issue #9512) but forgot to include the scope-switching behavior the MUI version has. When the user is on a Space page, the search bar shows a dropdown to choose between searching the entire platform or just the current space. When the user is NOT on a space page, no dropdown is shown and search is always platform-wide. We need to mimic the MUI functionality and wire it into the CRD implementation already in place. Follow the migration docs in `docs/crd/` and the rules in `src/crd/CLAUDE.md`."

## Clarifications

### Session 2026-04-27

- Q: On a Subspace page, which Space does the scope dropdown represent — the level-zero (top-level) Space, or the Subspace itself? → A: Always the level-zero (top-level) Space. Even when viewing a Subspace, the dropdown shows the parent Space's display name, and the scoped search includes the whole Space tree. This matches MUI exactly, since `useSpace()` already returns the level-zero Space.
- Q: For all user-facing wording, dropdown layout, trigger label format, recovery-button styling, and any other UI details not explicitly nailed down in this spec — what is the rule? → A: **Mimic the MUI implementation 1:1.** Concretely: the platform-wide option label is **"Entire platform"** (not "All Spaces" — rename the existing `search.scopeAll` key's value across all six language files). The trigger button shows **"Search In: <option>"** (with the "Search In:" prefix, exactly as in the MUI screenshot). The "Search the entire platform instead" recovery action and any other unspecified visual or copy detail follows the MUI version. Any future ambiguity in this spec defaults to whatever MUI does today.

## Background and Motivation

The CRD search overlay shipped in PR #9518 (issue #9512) is missing the scope-switching behavior that the MUI version has. Two distinct gaps need to be closed:

1. **No scope choice is exposed to the user.** The MUI search bar shows a "Search In:" dropdown when the user is on a Space page, with two options — the current Space and the entire platform. The CRD overlay shows nothing equivalent.
2. **Space detection in the CRD overlay does not actually work.** The integration layer attempts to detect the current Space using a URL pattern (`/space/<id>`) that does not match how Alkemio actually routes Space pages — Spaces live at `/<spaceNameId>` directly. As a result, when the user is browsing a Space and opens the CRD overlay, the search executes platform-wide, returning results from every Space (visible in the screenshot below: searching "wb" while on `/secondspace` returns posts from both Welcome Space and second space). The user is given no choice and cannot even tell that they are NOT searching just the current Space.

The MUI version avoids this by reading the current Space from the application's existing Space context (the same mechanism every other Space-aware component uses), which is populated by the URL resolver regardless of where the Space sits in the URL.

This feature closes both gaps: (a) the integration layer correctly identifies the current Space, including its display name and id, using the same Space-context source the rest of the app already relies on, and (b) the user sees and controls the scope through a dropdown that mirrors the MUI two-option model.

The CRD design system already contains the visual scope dropdown (`SearchTagInput` accepts `scope` and `onScopeChange` props). The integration layer does not currently feed those props or pass them through `SearchOverlay`. This spec defines the user-facing behavior that the integration must produce; the implementation requires correct Space detection, default-scope-on-open, change handler wiring, and a no-results "widen scope" action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose Scope While Browsing a Space (Priority: P1)

A user is browsing inside a Space and opens the search overlay. They see a scope selector in the search bar showing the current Space's name as the active scope. By default, results are restricted to that Space. They open the selector, choose "Entire platform", and the results immediately re-fetch and broaden to platform-wide content. The selector now shows "Entire platform" as the active scope. They can switch back to the Space the same way.

**Why this priority**: This is the entire missing feature. It also fixes the latent bug that today the CRD overlay never actually scopes to the current Space — a user looking at a Space page and searching is silently shown platform-wide results without any way to know or change that. Without this story, scoped search inside a Space is impossible from the overlay, which is a regression vs. the MUI behavior the user is replacing.

**Independent Test**: With the CRD toggle on, navigate to a Space (URL like `/<spaceNameId>`), open the search overlay, and verify (a) the scope selector is visible, (b) the current Space's display name is the default selection, (c) the search results are restricted to that Space (no posts/users/spaces from other Spaces appear), (d) opening the selector reveals exactly two options — the Space name and "Entire platform", (e) selecting "Entire platform" causes results to refresh and now include content from outside the Space, (f) selecting the Space name again narrows results back to the Space.

**Acceptance Scenarios**:

1. **Given** the CRD search overlay is enabled and the user is on a Space page (URL of the form `/<spaceNameId>` or any nested Space-tree route), **When** they open the overlay with no prior search performed, **Then** a scope selector is shown in the search bar displaying the current Space's display name as the active scope
2. **Given** the scope selector is visible with the current Space active and the user has entered a search term, **When** the search executes, **Then** results contain ONLY content belonging to that Space (no posts, members, or sub-results from other Spaces appear in any category) — verifying that today's "always platform-wide" bug is fixed
3. **Given** the scope selector is visible with the current Space active, **When** the user opens the selector, **Then** two options are shown — the current Space's display name and a label for the entire platform — with the currently active option indicated visually
4. **Given** the user has typed a term and pressed Enter while the scope is set to the current Space, **When** they switch the scope to "Entire platform", **Then** the search re-executes with the same term(s) against the full platform and results update without the user pressing Enter again
5. **Given** the scope is set to "Entire platform", **When** the user switches it back to the current Space, **Then** results re-narrow to that Space without losing the active search terms
6. **Given** the user changes the scope, **When** the new query is in flight, **Then** the overlay shows the loading state in the same way as for any other re-query
7. **Given** the active scope is the current Space, **When** the user views the scope selector trigger, **Then** the trigger is visually emphasized (matching the existing "scoped" styling in `SearchTagInput`) so it is clear results are filtered

---

### User Story 2 - No Scope Selector Outside a Space (Priority: P1)

A user is on a non-Space page (Home, Spaces explorer, the user's profile, an admin page, etc.) and opens the search overlay. They see no scope selector — the only available behavior is platform-wide search, exactly as today. The layout of the search bar accommodates the missing selector without leaving an empty slot.

**Why this priority**: Showing a scope selector that only has one option ("Entire platform") would be confusing. This story preserves the current platform-wide behavior on non-Space pages while keeping the overlay layout clean. It is a hard requirement of the MUI parity goal.

**Independent Test**: Open the search overlay from `/home`, `/spaces`, `/admin`, or any non-Space route, and verify (a) no scope selector is rendered in the search bar, (b) the search executes platform-wide, (c) the overlay's input/close button layout is unchanged from the current production CRD overlay on those routes.

**Acceptance Scenarios**:

1. **Given** the user is on a non-Space page, **When** they open the CRD search overlay, **Then** the scope selector is absent from the search bar
2. **Given** no scope selector is visible, **When** the user performs a search, **Then** results include content from all Spaces (platform-wide) without any space-restriction filter applied
3. **Given** the user has the overlay open on a non-Space page, **When** they navigate (via a result click) to a Space and re-open the overlay on that Space page, **Then** the scope selector appears with the new Space's name as the active scope

---

### User Story 3 - Recover From No Results by Widening to Platform (Priority: P2)

A user is searching inside a Space and the query returns nothing in that Space. The empty-results state shows a "Search the entire platform instead" action below the standard "no results" message. Clicking it switches the scope to "Entire platform", re-executes the search with the same terms, and the user sees results without re-typing.

**Why this priority**: The dead-end "no results" state in a scoped search is a frequent point of frustration — the user usually wants to broaden, not give up. The MUI counterpart provides the same affordance. This is not gating the MVP because users can already widen scope via the dropdown (Story 1), but it makes the recovery path one click instead of two.

**Independent Test**: With CRD enabled and the user on a Space page, scope set to that Space, type a term that has no results in the Space but does on the platform. Verify the no-results panel shows the "Search the entire platform instead" action, click it, and verify scope flips to platform-wide and results appear.

**Acceptance Scenarios**:

1. **Given** the active scope is the current Space and the search returned zero results across all categories, **When** the no-results state is shown, **Then** a "Search the entire platform instead" button is presented as a secondary action below the standard no-results message
2. **Given** the user clicks the "Search the entire platform instead" button, **When** the action fires, **Then** the scope is set to "Entire platform" and the query re-executes with the same active search terms
3. **Given** the active scope is already "Entire platform" and the search returned zero results, **When** the no-results state is shown, **Then** the "Search the entire platform instead" button is NOT shown (there is nothing to widen to)
4. **Given** the user is not on a Space page, **When** the no-results state is shown, **Then** the "Search the entire platform instead" button is NOT shown (there is no Space scope to widen from)

---

### User Story 4 - Scope Selector State Resets on Overlay Close (Priority: P3)

When the user closes the overlay and re-opens it, the scope returns to the default for the current page (current Space when inside a Space; not applicable otherwise). The previous scope choice is not remembered across opens. This matches how the rest of the overlay's state (tags, filters, visible counts) is already reset on close.

**Why this priority**: Consistency with the existing reset behavior. A persisting scope across opens would be surprising and inconsistent with how the rest of the overlay forgets its state.

**Independent Test**: Inside a Space, open the overlay, switch scope to "Entire platform", close the overlay, re-open it. Verify the scope is back to the current Space.

**Acceptance Scenarios**:

1. **Given** the user has switched the scope to "Entire platform" inside a Space, **When** they close the overlay and re-open it, **Then** the scope is back to the current Space
2. **Given** the user navigated away from a Space to a non-Space page while the overlay was closed, **When** they re-open the overlay, **Then** no scope selector is shown (Story 2 applies)
3. **Given** the overlay is open and the user navigates from Space A to Space B via a result click, **When** they re-open the overlay on Space B, **Then** the scope selector shows Space B as the default

---

### Edge Cases

- **Scope changed mid-flight**: If the user switches scope while a previous query is still loading, the in-flight query is superseded and the result of the new scope is what is displayed. (Behavior must avoid showing stale results from the previous scope after a switch.)
- **Space resolution not yet complete**: When the overlay opens on a Space page and the Space's display name and id are still being fetched (URL → id resolver in flight), the scope selector either remains hidden or shows a non-interactive placeholder. The selector MUST NOT appear with an empty/placeholder Space label, and the search MUST NOT execute against an unresolved Space id.
- **Pre-filled query via URL parameter**: If the overlay is opened with an initial search term and the user is on a Space page, the initial search executes with the current Space scope (matching the default), not platform-wide. This preserves the user's expectation that searches done from a Space context start scoped to that Space.
- **Subspace pages**: For a Subspace, the scope selector represents the **level-zero (top-level) Space** that contains the Subspace, NOT the Subspace itself. The dropdown shows the top-level Space's display name and the scoped search includes the entire Space tree (the Space and all its Subspaces). This matches MUI: `useSpace()` always returns the level-zero Space regardless of how deep in the tree the user is browsing.
- **Switching scope with no terms entered**: If the user changes the scope before adding any search tag, the scope choice is recorded but no query fires (matching the existing rule that the query is skipped while there are no tags). When the user later enters a term, the recorded scope is used.
- **A "Search the entire platform" widen action while no terms are present**: If somehow the no-results state is reached without active terms (it shouldn't be, by current logic), the widen action MUST NOT be shown, since there is nothing to re-execute.

## Requirements *(mandatory)*

### Functional Requirements

#### Detecting the Current Space

- **FR-001**: The CRD search overlay MUST determine whether the user is currently browsing inside a Space tree (the top-level Space or any of its Subspaces) using the same Space-context source the rest of the application already relies on for Space-aware behavior. URL pattern matching with custom regex MUST NOT be used for this detection. (Today's `extractSpaceNameIdFromPath` regex against `/space/<id>` is unreliable because production URLs are `/<spaceNameId>` and may include nested segments — this is the root cause of the current bug and MUST be removed.)
- **FR-002**: When the application's Space context indicates the user is on a Space tree page, the overlay MUST be able to read both (a) the **level-zero (top-level) Space's** stable identifier used for scoping the search query, and (b) the **level-zero Space's** user-facing display name used as the option label in the scope selector. The Subspace's name and id MUST NOT be used — even on a deeply nested Subspace URL, the scope is always the top-level Space, matching the MUI behavior. Both fields MUST be sourced consistently — the displayName lookup MUST be keyed by the same id used for the search-restriction filter, and the dropdown MUST remain hidden until both have settled (per FR-019), so the user never sees Space A's display name paired with Space B's id (or vice versa) during a transition.

#### Visibility of the Scope Selector

- **FR-003**: The CRD search overlay MUST show a scope selector in the search bar if and only if a current Space is detected (per FR-001/FR-002) at the time the overlay renders
- **FR-004**: When no Space context is detected, the overlay MUST render without a scope selector and the search MUST behave platform-wide
- **FR-005**: The scope selector MUST present exactly two options: the level-zero Space's human-readable display name, and the literal label **"Entire platform"** (not "All Spaces") for the platform-wide option. The existing `search.scopeAll` translation key's value MUST be renamed to "Entire platform" (and the equivalent in nl, es, bg, de, fr) so a single canonical string is used everywhere
- **FR-006**: The scope selector trigger MUST display **"Search In: <active option>"** (e.g. "Search In: Entire platform" or "Search In: <Space name>"), matching the MUI trigger format exactly. The "Search In:" prefix MUST be the localized value of the existing MUI key `components.search.searchScope.full` (or its localized equivalent) so wording is identical across MUI and CRD. The "scoped" visual treatment in `SearchTagInput` MUST be applied when the active option is the current Space
- **FR-006a**: For any user-facing copy, layout, or visual detail not explicitly specified in this spec, the canonical reference is the MUI `PlatformSearch` / `SearchBox` implementation as it exists in production today. Implementations MUST mimic MUI 1:1 unless this spec explicitly says otherwise

#### Default Scope and User Override

- **FR-007**: When the overlay opens on a Space page, the active scope MUST default to the current Space (matching MUI's default behavior on space pages)
- **FR-008**: The user MUST be able to change the active scope at any point while the overlay is open by selecting an option from the scope selector
- **FR-009**: Changing the active scope MUST trigger an automatic re-execution of the search with the existing search tags — the user MUST NOT need to re-press Enter or take any other action
- **FR-010**: When scope changes, the overlay MUST display the loading state during the re-fetch in the same way it does for any tag change

#### Effect of Scope on the Query

- **FR-011**: While the active scope is the current Space, the search MUST be restricted to results within that Space (top-level results from that Space tree, including Subspaces, Posts, Responses, and Members of that Space, exactly as the MUI implementation does today via the existing space filter)
- **FR-012**: While the active scope is the entire platform, the search MUST NOT apply any space restriction and MUST return results from across the whole platform
- **FR-013**: A scope switch MUST NOT carry stale results into the new scope — the result lists, counts, and sidebar/pill navigation MUST reflect only the response for the currently active scope

#### Recovery From No Results

- **FR-014**: When a search returns zero results across all categories AND the active scope is the current Space, the no-results state MUST present a secondary action labelled to the effect of "Search the entire platform instead"
- **FR-015**: Activating the recovery action MUST switch the active scope to "Entire platform" and re-execute the query with the existing search tags, displaying the loading state during the fetch
- **FR-016**: The recovery action MUST NOT be shown when the active scope is already the entire platform OR when no Space context exists

#### State Lifecycle

- **FR-017**: Closing the overlay MUST reset the active scope to the default for the next open (current Space when inside one; no scope state otherwise) — the user's previous scope choice MUST NOT persist across opens
- **FR-018**: When the user navigates between Space pages while the overlay is closed, the next open of the overlay MUST reflect the new Space as the default scope
- **FR-019**: While the Space's identifier is still being resolved (the page is loading data needed to identify the current Space), the search MUST NOT fire and the scope selector MUST NOT show stale or placeholder content; once the Space is resolved, the selector becomes available and any pending search executes

#### Accessibility (WCAG 2.1 AA)

- **FR-020**: The scope selector MUST be operable by keyboard (focusable, Space/Enter to open, arrow-key navigation, Escape to close) and announce its current selection via accessible name (e.g. "Search scope: <current Space name>") so screen-reader users know which scope is active before opening the menu
- **FR-021**: When the active scope changes, the change MUST be announced to assistive technology (e.g. via an aria-live region or by updating the menu trigger's accessible name in a way the screen reader picks up)
- **FR-022**: The "Search the entire platform instead" recovery action MUST be a real `<button>` with a clear accessible label and a visible focus indicator

#### Internationalization

- **FR-023**: All user-visible scope-related text — scope option labels, the recovery action label, and any accessibility-only labels — MUST come from the `crd-search` translation namespace and MUST be provided in all six supported languages (en, nl, es, bg, de, fr) per the CRD i18n rules in `src/crd/CLAUDE.md`
- **FR-024**: The current Space's display name shown in the scope option MUST be the Space's user-facing display name (the same name shown elsewhere in the UI as the Space title), not its URL slug or internal identifier

#### Architectural Constraints (CRD Rules)

- **FR-025**: The presentational scope dropdown MUST live in `src/crd/` and MUST NOT import from `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo/*`, `@/domain/*`, or `react-router-dom`
- **FR-026**: All Space detection, display-name lookup, scope state management, and re-query orchestration MUST live in the integration layer under `src/main/crdPages/search/`. The integration layer MAY import from `@/domain/*` (e.g. the existing `useSpace` context provider) — that boundary applies only to `src/crd/`, not to `src/main/crdPages/`
- **FR-027**: The CRD scope dropdown component MUST receive the current Space's display name, the active scope value, the list of options (already implied by the `SearchScopeData` type), and an `onScopeChange` callback — it MUST NOT itself read pathnames, query parameters, or context

### Key Entities

- **Active Scope**: The user's current selection of where to search — either "the current Space" (when applicable) or "the entire platform". Persists only for the lifetime of an open overlay session.
- **Current Space Context**: The Space the user is browsing at the moment they open (or have open) the overlay. Has a display name (shown in the scope option) and an internal identifier (used to filter the query). Absent on non-Space pages.
- **Scope-Aware Search Query**: The search request that the overlay issues — identical to today's request except that the space-restriction filter is applied or omitted based on the active scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user browsing inside a Space and a user browsing outside a Space see overlay layouts that match the MUI counterpart — scope selector visible vs. absent — verified across the top-level Space, a Subspace, the home page, the spaces explorer, and at least one admin route
- **SC-002**: From the moment a user changes the scope to the moment fresh results render, the perceived delay is no longer than the same user would experience adding or removing a search tag (no extra round-trip beyond what an existing tag change costs)
- **SC-003**: When a user is on a Space page and starts a search, the default scope is the current Space 100% of the time AND the returned results contain only content belonging to that Space — verifying both that (a) the dropdown defaults correctly and (b) the scoping actually filters results, fixing the current bug where on-Space searches always return platform-wide results
- **SC-004**: The "Search the entire platform instead" recovery action successfully widens scope and produces matching platform-wide results across at least 5 representative test terms, verified during manual QA per the matrix in `tasks.md` T016 — confirming the recovery path works end-to-end and is not silently broken
- **SC-005**: Closing and re-opening the overlay returns the scope to the default for the current page in 100% of cases — no leaked state from a prior open
- **SC-006**: Keyboard-only and screen-reader users can identify the active scope, switch the scope, and perceive that results have changed, without any sighted assistance — verified via a manual a11y pass against the WCAG 2.1 AA criteria stated in the requirements
- **SC-007**: Toggling CRD off (the existing localStorage toggle) leaves the MUI search dialog completely untouched — the MUI scope behavior continues to work exactly as before with zero regression
- **SC-008**: All translations for new strings are present in en, nl, es, bg, de, fr at merge time — there are zero missing-key fallbacks shown for any of the six supported languages

## Scope Boundary

### In Scope

- Replacing the broken URL-regex Space detection in `CrdSearchOverlay` with the application's existing Space context, so the integration layer correctly knows the current Space (id and display name) on every Space and Subspace route
- Wiring the existing `SearchTagInput` scope props (`scope`, `onScopeChange`) through `SearchOverlay` to the `CrdSearchOverlay` integration layer
- Active-scope state management inside `CrdSearchOverlay`, including default-on-open, change handler, and reset-on-close
- Conditional inclusion of the space-restriction filter in the existing search query, driven by the active scope
- "Search the entire platform instead" recovery action in the no-results panel of the overlay
- New `crd-search` translation keys for the scope option labels, the recovery action, and any accessibility labels — in all six supported languages
- Keyboard and screen-reader accessibility of the scope selector and the recovery action

### Out of Scope

- Changes to the MUI search dialog (it remains the production default until the CRD toggle is flipped on globally)
- Changes to the GraphQL schema, search query shape, or backend ranking — the same `searchInSpaceFilter` field is reused
- Persisting the active scope across overlay opens, across page navigations, or in the URL — scope is session-local and resets on close
- Adding more than two scope options (e.g. parent Space, all Subspaces, current callout) — explicitly preserving the MUI two-option model
- Surfacing the scope chosen during search inside the result cards themselves (e.g. "in: <space>" badges) — those are part of the broader 043 spec and not regressed by this change
- Header/`SearchBar` changes outside the overlay — the overlay is the only surface in scope

## Assumptions

- The current CRD integration layer's space-detection logic is broken (the `extractSpaceNameIdFromPath` regex in `CrdSearchOverlay.tsx` matches `/space/<id>` but real Space URLs are `/<spaceNameId>` and may include nested segments like `/<spaceNameId>/challenges/<subspaceNameId>`). Replacing it with the application's existing Space context is the correct fix, not patching the regex.
- The application's existing Space context provides both the current Space's stable identifier and its user-facing display name, and returns an empty/falsy state when the user is not on a Space page. No new GraphQL document or new context is required for this feature.
- **Note on context source**: `PlatformSearch.tsx` (the MUI version) reads from `useSpace()`, which is only available inside `SpaceContextProvider`. `CrdSearchOverlay` is mounted at the layout level, **above** `SpaceContextProvider`, so `useSpace()` is unavailable there. The integration must therefore use the lower-level URL-resolver context (`useUrlResolver`) plus the same Apollo profile query (`useSpaceAboutBaseQuery`) that `SpaceContextProvider` itself uses internally — see `plan.md` and `research.md` for the exact hooks. The behavioral guarantee in FR-002 (displayName keyed by the same id used for the search filter) is satisfied either way.
- The existing `SearchTagInput` component in `src/crd/` is sufficient for the visual treatment of the scope dropdown — no new design work is needed in `src/crd/` beyond verifying the active-state styling matches the MUI affordance.
- The existing search query already supports omitting the space-restriction filter to produce a platform-wide search; toggling between scopes is a matter of conditionally setting that variable in the integration layer.
- The CRD toggle (`useCrdEnabled`) and the MUI fallback path are already wired and remain unchanged.
- The scope dropdown always represents the **level-zero (top-level) Space**, even when the user is on a Subspace URL. The Subspace's own name/id is never the scope — `useSpace()` returns the level-zero Space, and the existing `searchInSpaceFilter` accepts that level-zero id and returns results from the entire Space tree (parent + all Subspaces inside it). The two-option model ("this Space" vs. "Entire platform") is preserved, matching MUI.
