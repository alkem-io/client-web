# Data Model: Default Post Template for Flow Steps

**Feature Branch**: `009-flow-post-template` | **Date**: 2026-01-09
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)

## Overview

This document describes the entity relationships, GraphQL schema, and data structures involved in the default post template feature.

## Entity Relationship Diagram

```
┌─────────────────────┐
│  InnovationFlow     │
│  ─────────────────  │
│  id: UUID           │
│  profile: Profile   │
│  states: [State]    │◄──────────┐
└─────────────────────┘           │
                                  │ belongs_to
                                  │
┌─────────────────────┐           │
│ InnovationFlowState │           │
│  ─────────────────  │───────────┘
│  id: UUID           │
│  displayName: String│
│  description: String│
│  sortOrder: Int     │
│  defaultCallout     │───────┐
│    Template: Template│      │ references (nullable)
└─────────────────────┘       │
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Template           │
                    │  ─────────────────  │
                    │  id: UUID           │
                    │  type: TemplateType │ (must be CALLOUT)
                    │  profile: Profile   │
                    │  callout: Callout   │──────┐
                    └─────────────────────┘      │ has_one
                                                 │
                                                 ▼
                                    ┌────────────────────────┐
                                    │  Callout               │
                                    │  ────────────────────  │
                                    │  id: UUID              │
                                    │  contributionDefaults  │──────┐
                                    └────────────────────────┘      │ contains
                                                                    │
                                                                    ▼
                                                    ┌───────────────────────────────┐
                                                    │  CalloutContributionDefaults  │
                                                    │  ───────────────────────────  │
                                                    │  postDescription: String      │
                                                    └───────────────────────────────┘

┌─────────────────────┐
│  Post (Contribution)│  (NOT linked to template after creation)
│  ─────────────────  │
│  id: UUID           │
│  profile: Profile   │
│  description: String│  ← initialized from template, then independent
└─────────────────────┘
```

## Core Entities

### InnovationFlow

Represents the overall innovation process for a space.

**GraphQL Type**:

```graphql
type InnovationFlow {
  id: UUID!
  profile: Profile!
  states: [InnovationFlowState!]!
  settings: InnovationFlowSettings!
}
```

**Key Relationships**:

- Has many `InnovationFlowState` objects (ordered by `sortOrder`)
- One per Space collaboration

### InnovationFlowState

Represents a phase/step in the innovation flow (e.g., "Ideation", "Development").

**GraphQL Type**:

```graphql
type InnovationFlowState {
  id: UUID!
  displayName: String!
  description: String!
  sortOrder: Int!
  settings: InnovationFlowStateSettings!
  defaultCalloutTemplate: Template # NEW: nullable reference
}
```

**Key Relationships**:

- Belongs to one `InnovationFlow`
- Optionally references one `Template` of type CALLOUT
- `defaultCalloutTemplate` can be null (no template set)

**Important**: `displayName` is used for matching with `Callout.classification.flowState.tags[0]`

### Template

Reusable structure for various content types (callouts, whiteboards, spaces, etc.).

**GraphQL Type**:

```graphql
type Template {
  id: UUID!
  type: TemplateType!
  profile: Profile!
  callout: Callout
  whiteboard: Whiteboard
  collaboration: Collaboration
  # ... other fields
}

enum TemplateType {
  CALLOUT
  POST
  WHITEBOARD
  SPACE
  # ... other types
}
```

**Key Relationships**:

- Can be referenced by many `InnovationFlowState` objects
- Has one `Callout` (if type is CALLOUT)
- Belongs to either a Space or Platform library

**Constraints for Default Templates**:

- Must be type `CALLOUT` (enforced by UI filtering)
- Must have `callout.contributionDefaults.postDescription` populated

### Callout

Framing element that groups contributions (posts, whiteboards, links).

**GraphQL Type**:

```graphql
type Callout {
  id: UUID!
  type: CalloutType!
  classification: CalloutClassification!
  contributionDefaults: CalloutContributionDefaults!
  contributions: [CalloutContribution!]!
}

type CalloutClassification {
  flowState: CalloutFlowState
}

type CalloutFlowState {
  tags: [String!]! # tags[0] = flow state displayName
}
```

**Key Relationships**:

- Belongs to a Collaboration
- Can be classified by a flow state (via `classification.flowState.tags[0]`)
- Has contribution defaults (fallback if no flow-level template)

**Classification Pattern**:

- `callout.classification.flowState.tags[0]` contains the flow state name (e.g., "Ideation")
- This is matched against `InnovationFlowState.displayName` to find the state
- Once state is found, `state.defaultCalloutTemplate.id` provides the template ID

### CalloutContributionDefaults

Default values for contributions within a callout.

**GraphQL Type**:

```graphql
type CalloutContributionDefaults {
  postDescription: String
  whiteboardContent: String
}
```

**Usage**:

- When template: `template.callout.contributionDefaults.postDescription`
- When callout default: `callout.contributionDefaults.postDescription`
- Priority: Template > Callout default > Empty string

### Post (CalloutContribution)

User-created contribution within a callout.

**GraphQL Type**:

```graphql
type CalloutContribution {
  id: UUID!
  post: Post
  whiteboard: Whiteboard
  link: Link
}

type Post {
  id: UUID!
  profile: Profile!
  description: String! # Markdown content
  comments: Room!
  # ... other fields
}
```

**Relationship to Templates**:

- ❌ **NOT persistently linked** to the template
- ✅ **Initialized** from template content at creation time
- ✅ **Independent** after creation (editing template doesn't affect existing posts)

## GraphQL Operations

### Queries

#### InnovationFlowStates (Fragment)

**File**: `src/domain/collaboration/InnovationFlow/graphql/InnovationFlowStates.fragment.graphql`

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
    }
    defaultCalloutTemplate {
      # NEW
      id
      profile {
        id
        displayName
      }
      type
    }
  }
}
```

**Usage**: Admin UI displays flow states with template information

#### TemplateContent (Query)

**File**: `specs/009-flow-post-template/contracts/TemplateContent.graphql`

```graphql
query TemplateContent($templateId: UUID!) {
  lookup {
    template(ID: $templateId) {
      id
      callout {
        contributionDefaults {
          postDescription
        }
      }
    }
  }
}
```

**Usage**: Member UI loads template content when creating posts

**Return Type**:

```typescript
{
  lookup: {
    template: {
      id: string;
      callout: {
        contributionDefaults: {
          postDescription: string;
        };
      } | null;
    } | null;
  };
}
```

### Mutations

#### SetDefaultCalloutTemplateOnInnovationFlowState

**File**: Existing backend mutation (no new .graphql file needed, uses generated hook)

```graphql
mutation SetDefaultCalloutTemplateOnInnovationFlowState(
  $setData: SetDefaultCalloutTemplateOnInnovationFlowStateInput!
) {
  setDefaultCalloutTemplateOnInnovationFlowState(setData: $setData) {
    id
    defaultCalloutTemplate {
      id
      profile {
        id
        displayName
      }
      type
    }
  }
}

input SetDefaultCalloutTemplateOnInnovationFlowStateInput {
  innovationFlowStateID: UUID!
  defaultTemplateID: UUID!
}
```

**Authorization**:

- Requires `UPDATE` privilege on the InnovationFlow
- Standard admin role

**Behavior**:

- Sets `InnovationFlowState.defaultCalloutTemplate` to reference the specified template
- If template already set, replaces it
- Returns updated flow state

#### RemoveDefaultCalloutTemplateOnInnovationFlowState

**File**: Existing backend mutation (no new .graphql file needed, uses generated hook)

```graphql
mutation RemoveDefaultCalloutTemplateOnInnovationFlowState(
  $removeData: RemoveDefaultCalloutTemplateOnInnovationFlowStateInput!
) {
  removeDefaultCalloutTemplateOnInnovationFlowState(removeData: $removeData) {
    id
    defaultCalloutTemplate {
      id
      profile {
        id
        displayName
      }
      type
    }
  }
}

input RemoveDefaultCalloutTemplateOnInnovationFlowStateInput {
  innovationFlowStateID: UUID!
}
```

**Authorization**: Same as set mutation

**Behavior**:

- Sets `InnovationFlowState.defaultCalloutTemplate` to null
- Returns updated flow state

## TypeScript Interfaces (Generated)

### InnovationFlowStatesFragment

```typescript
// Generated in src/core/apollo/generated/graphql-schema.ts
export interface InnovationFlowStatesFragment {
  id: string;
  states: Array<{
    id: string;
    displayName: string;
    description: string;
    sortOrder: number;
    settings: {
      allowNewCallouts: boolean;
    };
    defaultCalloutTemplate?: {
      id: string;
      profile: {
        id: string;
        displayName: string;
      };
      type: TemplateType;
    } | null;
  }>;
}
```

### TemplateContentQuery

```typescript
// Generated in src/core/apollo/generated/graphql-schema.ts
export interface TemplateContentQuery {
  lookup: {
    template?: {
      id: string;
      callout?: {
        contributionDefaults: {
          postDescription?: string;
        };
      };
    } | null;
  };
}

export interface TemplateContentQueryVariables {
  templateId: string;
}
```

### Mutation Types

```typescript
// Generated in src/core/apollo/generated/graphql-schema.ts
export interface SetDefaultCalloutTemplateOnInnovationFlowStateMutation {
  setDefaultCalloutTemplateOnInnovationFlowState: {
    id: string;
    defaultCalloutTemplate?: {
      id: string;
      profile: {
        id: string;
        displayName: string;
      };
      type: TemplateType;
    } | null;
  };
}

export interface SetDefaultCalloutTemplateOnInnovationFlowStateMutationVariables {
  setData: SetDefaultCalloutTemplateOnInnovationFlowStateInput;
}

export interface RemoveDefaultCalloutTemplateOnInnovationFlowStateMutation {
  removeDefaultCalloutTemplateOnInnovationFlowState: {
    id: string;
    defaultCalloutTemplate?: {
      id: string;
      profile: {
        id: string;
        displayName: string;
      };
      type: TemplateType;
    } | null;
  };
}

export interface RemoveDefaultCalloutTemplateOnInnovationFlowStateMutationVariables {
  removeData: RemoveDefaultCalloutTemplateOnInnovationFlowStateInput;
}
```

## Data Flow Patterns

### Admin Sets Default Template

```
1. User Action: Admin clicks "Set Default Post Template" on flow state
2. UI Action: SetDefaultTemplateDialog opens with ImportTemplatesDialog
3. Data Fetch: Dialog queries TemplateLibrary (existing query)
4. Display: Shows CALLOUT templates with current template highlighted
5. User Action: Admin selects a template
6. Mutation: SetDefaultCalloutTemplateOnInnovationFlowState
   Input: { innovationFlowStateID, defaultTemplateID }
7. Apollo Cache: Updates InnovationFlowStates fragment
8. UI Update: Dialog closes, state card shows template is set
```

### Member Creates Post with Template

```
1. Page Load: CalloutPage loads callout with classification.flowState
2. Data Present: innovationFlow.states[] available in parent
3. Mapping: flowState = states.find(s => s.displayName === callout.classification.flowState.tags[0])
4. Prop Flow: flowStateDefaultTemplateId = flowState?.defaultCalloutTemplate?.id
5. Propagation: CalloutPage → CalloutView → ContributionsCardsExpandable → CreateContributionButtonPost
6. User Action: Member clicks "Add Post"
7. Dialog Opens: PostCreationDialog opens immediately (non-blocking)
8. Data Fetch: useFlowStateDefaultTemplate lazy query fires
   Query: TemplateContent(templateId)
9. Loading State: Dialog shows skeleton while loading
10. Data Arrives: postDescription extracted from result
11. UI Update: Dialog form pre-filled with template content
12. User Action: Member edits and submits post
13. Mutation: CreatePostOnCallout (existing)
    Input: { description: editedContent, ... }
14. Result: Post created with member's content (not linked to template)
```

### Template Deleted (Edge Case)

```
1. Admin Action: Delete template from template library
2. Backend Cascade: InnovationFlowState.defaultCalloutTemplate → null
3. Apollo Cache: Invalidates InnovationFlowStates fragment
4. UI Update (Admin): Flow state shows "No default template set"
5. UI Update (Member): Post creation dialog shows empty form
6. No Errors: Graceful degradation, no broken references
```

## Constraints & Validations

### Business Rules

1. **Template Type**: Only CALLOUT type templates can be set as default
   - Enforced by: UI filtering in ImportTemplatesDialog
   - Backend: No constraint (trusts frontend)

2. **Template Availability**: Template must exist and be accessible
   - Enforced by: GraphQL mutation rejects invalid template IDs
   - Error handling: UI shows error toast on mutation failure

3. **Flow State Uniqueness**: Each flow state has at most one default template
   - Enforced by: Database schema (nullable single reference)
   - Setting new template replaces old one

4. **Authorization**: Only admins can set/remove templates
   - Enforced by: Backend authorization on mutation
   - UI: Menu item only shown to users with UPDATE privilege

### Data Integrity

1. **Null Safety**: `defaultCalloutTemplate` is nullable
   - No template set: Field is null
   - Template deleted: Field becomes null (cascade)
   - Code must handle: `flowState?.defaultCalloutTemplate?.id`

2. **Orphaned References**: Prevented by backend cascade delete
   - When template deleted, all references set to null
   - No dangling pointers

3. **Flow State Matching**: Relies on exact string match
   - `callout.classification.flowState.tags[0]` must equal `InnovationFlowState.displayName`
   - Case-sensitive comparison
   - If no match, no template loaded (graceful degradation)

## Performance Considerations

### Query Optimization

1. **InnovationFlowStates Fragment**:
   - Already queried for admin UI (no extra cost)
   - Includes defaultCalloutTemplate fields (adds ~100 bytes per state)
   - Cached by Apollo (no re-fetch on navigation)

2. **TemplateContent Query**:
   - Lazy query (only fires when dialog opens)
   - Small payload (~1KB per template)
   - Cached by Apollo (instant on subsequent opens)

### Cache Strategy

- **Fragment Caching**: InnovationFlowStates uses Apollo normalized cache
- **Cache Updates**: Mutations automatically update fragment via cache
- **Invalidation**: No manual invalidation needed (backend handles consistency)

## Migration Notes

### Backward Compatibility

- ✅ Existing flow states without templates: `defaultCalloutTemplate` is null
- ✅ Existing callout defaults: Still used when no template set
- ✅ Existing posts: Unaffected (no linkage to templates)

### No Database Migration Required

Backend has already deployed schema changes. Frontend changes are additive only.

## References

- **Spec**: [spec.md](./spec.md) - Functional requirements
- **Plan**: [plan.md](./plan.md) - Implementation steps
- **Research**: [research.md](./research.md) - Architecture decisions
- **GraphQL Schema**: Run `pnpm codegen` to regenerate types after schema changes
