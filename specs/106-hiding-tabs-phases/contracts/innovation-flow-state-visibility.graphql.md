# Contract: InnovationFlow state visibility (GraphQL)

## Server contract (external dependency — server repo)

The platform must extend the innovation-flow state settings with a visibility flag.

```graphql
type InnovationFlowStateSettings {
  allowNewCallouts: Boolean!
  "Whether this state/phase is shown in the member-facing navigation. Default true."
  visible: Boolean!          # NEW
}

input UpdateInnovationFlowStateSettingsInput {
  allowNewCallouts: Boolean!
  visible: Boolean           # NEW (optional on input; omission leaves it unchanged)
}
```

- `visible` defaults to `true` for existing and newly created states.
- `visible` does NOT affect authorization or content access — purely a UI navigation flag.

**Status**: Not yet present in `src/core/apollo/generated/graphql-schema.ts`
(`InnovationFlowStateSettings` currently exposes only `allowNewCallouts`). Tracked as an
external dependency. When delivered, run `pnpm codegen` (needs a live backend) and commit the
regenerated `apollo-hooks.ts` / `graphql-schema.ts`.

## Client query/mutation selection changes (this PR)

These `.graphql` documents are updated so the field is requested/returned once the server
exposes it. They are inert (no effect) until the server field exists.

### Fragment — `InnovationFlowStates.fragment.graphql`

```graphql
fragment InnovationFlowStates on InnovationFlow {
  id
  states {
    id
    displayName
    description
    sortOrder
    settings {
      allowNewCallouts
      visible          # NEW
    }
    defaultCalloutTemplate { id profile { id displayName } type }
  }
}
```

### Mutation — `UpdateInnovationFlowState` (UpdateInnovationFlowStates.graphql)

```graphql
mutation UpdateInnovationFlowState(
  $innovationFlowStateId: UUID!
  $displayName: String!
  $description: Markdown!
  $settings: UpdateInnovationFlowStateSettingsInput
) {
  updateInnovationFlowState(
    stateData: {
      innovationFlowStateID: $innovationFlowStateId
      displayName: $displayName
      description: $description
      settings: $settings
    }
  ) {
    id
    displayName
    description
    settings {
      allowNewCallouts
      visible          # NEW
    }
  }
}
```

## Client guard

Because codegen cannot run here, the generated `settings.visible` may be absent. The client
model declares `settings.visible?: boolean` and all consumers guard on its presence:
the Hide/Show affordance renders only when `typeof settings.visible === 'boolean'`, and the
member filter is a no-op when no state carries a boolean `visible` (FR-016).
