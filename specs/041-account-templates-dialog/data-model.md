# Data Model: Account Templates in Template Picker Dialog

**Date**: 2026-04-03 | **Branch**: `041-account-templates-dialog`

## Entity Relationships

```text
Account (1) ──── (N) InnovationPack (1) ──── (1) TemplatesSet (1) ──── (N) Template
   │                      │                          │
   │                      ├── profile                ├── spaceTemplates
   │                      ├── provider (Actor)       ├── postTemplates
   │                      └── templatesSet ──────────├── calloutTemplates
   │                                                 ├── whiteboardTemplates
   │                                                 └── communityGuidelinesTemplates
   │
   └── id (in-Space: from SpaceContext via useSpace(); Space creation: from useCurrentUserContext().accountId)
```

## Entities

### Account

The organizational container that owns innovation packs. Each authenticated user has one account.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `UUID` | `SpaceContext` (in-Space) or `useCurrentUserContext().accountId` (Space creation) | Passed as `accountId` prop to dialog. `SpaceAboutBase` query must include `account { id }` for in-Space availability. |
| `innovationPacks` | `InnovationPack[]` | GraphQL `lookup.account(ID:).innovationPacks` | All packs, both public and private |

### InnovationPack

A grouping of templates within an account. Shown as innovation pack metadata on template cards.

| Field | Type | Used in UI | Notes |
|-------|------|------------|-------|
| `id` | `UUID` | Key for dedup | |
| `profile.displayName` | `string` | Template card footer | Innovation pack name |
| `profile.url` | `string` | Not used in picker | Available for future use |
| `provider.profile.displayName` | `string` | Template card footer | Provider/organization name |
| `provider.profile.avatar.uri` | `string` | Template card footer | Provider avatar |
| `provider.profile.url` | `string` | Not used in picker | |
| `templatesSet` | `TemplatesSet` | Contains templates | |

### Template

An individual template of a specific type.

| Field | Type | Used in UI | Notes |
|-------|------|------------|-------|
| `id` | `UUID` | Key, selection | |
| `type` | `TemplateType` | Client-side filtering | Enum: SPACE, POST, CALLOUT, WHITEBOARD, COMMUNITY_GUIDELINES |
| `profile.displayName` | `string` | Card title | |
| `profile.description` | `string` | Card description, search filter | |
| `profile.defaultTagset.tags` | `string[]` | Search filter | |
| `profile.visual.uri` | `string` | Card image | CARD visual type |
| `profile.url` | `string` | Navigation | |
| `callout.id` | `string` | Preview (if CALLOUT type) | Conditional include |
| `contentSpace` | `TemplateContentSpace` | Preview (if SPACE type) | Contains card banner, innovation flow states |

## Data Flow

### Query → Component Data Mapping

```text
GraphQL Response                              Component Props
─────────────────                             ──────────────────
lookup.account                           ┐
  .innovationPacks[]                     │    accountTemplates: AnyTemplateWithInnovationPack[]
    .templatesSet.templates[]            │    ┌─────────────────────────────────────────────┐
      (filtered by templateType)   ──────┼───>│ { template: AnyTemplate,                    │
    .profile + .provider           ──────┘    │   innovationPack: TemplateInnovationPack }   │
                                              └─────────────────────────────────────────────┘
```

### Flattening Logic

Account templates are flattened from the nested `account.innovationPacks[].templatesSet.templates[]` into a flat `AnyTemplateWithInnovationPack[]` array:

```typescript
// Pseudocode for data mapping in ImportTemplatesDialog
const accountTemplates = data?.lookup.account?.innovationPacks
  .flatMap(pack =>
    (pack.templatesSet?.templates ?? [])
      .filter(template => template.type === templateType)
      .map(template => ({
        template,
        innovationPack: {
          id: pack.id,
          profile: pack.profile,
          provider: pack.provider,
        },
      }))
  );
```

### Section Rendering Decision Tree

```text
                    ┌──────────────────┐
                    │ Dialog opens     │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │ accountId provided?          │
              ├──── YES ─────┐              NO ──── skip account section
              │              │
              │   Fetch account templates (eager)
              │              │
              ├──────────────┴──────────────┐
              │ canUseSpaceTemplates?        │
              ├──── YES ──────┐            NO
              │               │             │
              │  1. Space templates    1. Account templates
              │  2. Account templates  2. [lazy link] Platform templates
              │  3. [lazy link] Platform templates
              │               │
              └───────────────┘
```

### State Transitions

| State | Trigger | Result |
|-------|---------|--------|
| Dialog closed | User opens dialog | Fetch account templates + space templates (if applicable) |
| Account templates loading | Query in flight | Show skeleton cards via `ImportTemplatesDialogGallery` loading prop |
| Account templates loaded | Query returns data | Render section with templates (or hide if empty) |
| Account templates empty | 0 templates of type | Hide "Account templates" section entirely |
| Space + Account templates empty | Both return 0 | Auto-load Platform templates (extend existing effect) |
| Platform link clicked | User clicks lazy link | Load Platform templates query |

## Validation Rules

- `accountId` must be a valid UUID (enforced by GraphQL schema)
- `templateType` filter applied client-side after fetching all templates from account
- Empty sections are hidden — no empty state UI for account templates section
- No deduplication between sections — a template appearing in both Account and Platform sections is shown in both
