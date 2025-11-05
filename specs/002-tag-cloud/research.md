# Research Findings – Tag Cloud Filter for Knowledge Base

## Decision 1: Extend callout list query with profile tagset data

- **Rationale**: `useCalloutsSet` currently returns `CalloutModelLightExtended` without tag information. The GraphQL fragment `CalloutsOnCalloutsSetUsingClassification` uses the `Callout` fragment, which omits `framing.profile.tagset`. Extending this fragment gives us tag names directly alongside existing callout metadata, keeping Apollo cache as the single source of truth.
- **Alternatives considered**: (a) Trigger a parallel query per callout via `CalloutDetails` (would introduce N+1 fetching and slower load) (b) Introduce a bespoke GraphQL endpoint just for tags (would require backend work). Both were rejected in favor of augmenting the existing fragment.

## Decision 2: Locate UI integration within `FlowStateTabPage`

- **Rationale**: The fourth tab of L0 spaces renders through `FlowStateTabPage`, which already composes `CalloutsGroupView` (detail column) and `CalloutsList` (info column). Adding the tag cloud component above `CalloutsGroupView` ensures the feature applies only to space-level knowledge bases, leaving subspace layouts (`SubspaceHomePage`) untouched.
- **Alternatives considered**: (a) Modify `CalloutsGroupView` directly (would leak feature-specific logic into shared component used by other flows) (b) Inject tag cloud at higher `SpacePageLayout` level (would complicate other tabs). Both options risked broader regression.

## Decision 3: Manage tag selection and filtering in a new domain hook

- **Rationale**: Creating a dedicated hook under `src/domain/collaboration/calloutsSet` (e.g., `useCalloutTagCloud`) lets us compute tag frequencies, maintain selected state, and provide filtered callouts while keeping React components declarative. Hook can expose memoized derived data and a `useTransition`-backed setter to satisfy React 19 concurrency guidance.
- **Alternatives considered**: (a) Store tag state in component-level `useState` inside `FlowStateTabPage` (would duplicate logic if reused elsewhere) (b) Mutate Apollo cache to hide filtered callouts (would conflate data source with view state). Both were rejected for maintainability.

## Decision 4: Render results summary row within knowledge base content column

- **Rationale**: The spec requires "X results – clear filter" between the tag cloud and the first callout. Rendering inside `ContentColumn` keeps layout consistent, allows easy access to filtered callout count, and ensures accessibility by using semantic text plus an inline button. It also avoids disturbing the `CalloutsList` on the left.
- **Alternatives considered**: (a) Place summary in the tag cloud header (less visible once cloud is scrolled) (b) Reuse `ContributeCreationBlock` area (belongs to info column). Both options deviated from UX intent.
