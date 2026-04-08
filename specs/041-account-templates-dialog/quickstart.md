# Quickstart: Account Templates in Template Picker Dialog

**Branch**: `041-account-templates-dialog`

## Prerequisites

- Node 24.14.0 (Volta-managed)
- pnpm 10.17.1+
- Running Alkemio backend at `localhost:3000` (Traefik) / `localhost:4000/graphql` (for codegen)
- An account with at least one innovation pack containing templates

## Implementation Steps

### Step 1: Add the GraphQL Query

**File**: `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplateDialog.graphql`

Append the `ImportTemplateDialogAccountTemplates` query from `contracts/ImportTemplateDialogAccountTemplates.graphql`. This query traverses `account.innovationPacks[].templatesSet.templates` and returns the same `{ template, innovationPack }` shape as the existing Platform templates query.

Then regenerate:
```bash
pnpm codegen
```

This generates the `useImportTemplateDialogAccountTemplatesQuery` hook in `apollo-hooks.ts`.

### Step 2: Add i18n Key

**File**: `src/core/i18n/en/translation.en.json`

Add under the `templateLibrary` object:
```json
"accountTemplates": "Account templates"
```

### Step 3: Modify ImportTemplatesDialog

**File**: `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`

#### 3a. Add `accountId` to the options interface

```typescript
export interface ImportTemplatesOptions {
  templateType?: TemplateType;
  disableSpaceTemplates?: boolean;
  enablePlatformTemplates?: boolean;
  accountId?: string;  // NEW
}
```

#### 3b. Wire up the query hook

```typescript
const { data: accountTemplatesData, loading: loadingAccountTemplates } =
  useImportTemplateDialogAccountTemplatesQuery({
    variables: {
      accountId: accountId!,
      includeCallout: templateType === TemplateType.Callout,
      includeSpace: templateType === TemplateType.Space,
    },
    skip: !open || !accountId,
  });
```

#### 3c. Flatten the nested response

```typescript
const accountTemplates = accountTemplatesData?.lookup.account?.innovationPacks.flatMap(pack =>
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

#### 3d. Extend the selectedTemplate search

```typescript
const selectedTemplate = selectedTemplateId
  ? [...(templates || []), ...(accountTemplates || []), ...(platformTemplates || [])].find(
      templateItem => templateItem.template.id === selectedTemplateId
    )
  : undefined;
```

#### 3e. Update the auto-load effect for Platform templates

Extend the condition so Platform templates auto-load when BOTH Space and Account templates are empty:

```typescript
useEffect(() => {
  if (!open) return;
  if (disableSpaceTemplates && !accountId) {
    setLoadPlatformTemplates(true);
    return;
  }
  const spaceEmpty = canUseSpaceTemplates && !loadingTemplates && templates?.length === 0;
  const accountEmpty = !accountId || (!loadingAccountTemplates && accountTemplates?.length === 0);
  const noSpaceContext = !canUseSpaceTemplates;

  if ((spaceEmpty || noSpaceContext) && accountEmpty) {
    setLoadPlatformTemplates(true);
  }
}, [open, disableSpaceTemplates, loadingTemplates, templates, loadingAccountTemplates, accountTemplates, accountId]);
```

#### 3f. Render the account templates section

The rendering order depends on context:

**When `canUseSpaceTemplates` is true** (within a Space — Post, Callout, etc.):
1. Space templates section (existing)
2. Account templates section (NEW)
3. Platform templates lazy link / section (existing)

**When `canUseSpaceTemplates` is false** (Space creation):
1. Account templates section (NEW)
2. Platform templates lazy link / section (existing)

```tsx
{/* Account templates section — after Space templates (or first if no Space context) */}
{/* FR-002: hide when 0 templates of the relevant type; show while loading */}
{accountId && (loadingAccountTemplates || (accountTemplates && accountTemplates.length > 0)) && (
  <ImportTemplatesDialogGallery
    templates={accountTemplates}
    onClickTemplate={template => setPreviewTemplate(template)}
    loading={loadingAccountTemplates}
  >
    <BlockTitle marginY={gutters()}>
      {loadingAccountTemplates && <CircularProgress size={15} sx={{ marginRight: gutters() }} />}
      {t('templateLibrary.accountTemplates')}
    </BlockTitle>
  </ImportTemplatesDialogGallery>
)}
```

Place this JSX block:
- **After** the Space templates `{canUseSpaceTemplates && (...)}` block
- **Before** the Platform templates lazy link

When `canUseSpaceTemplates` is false, the Space templates block doesn't render, so Account templates naturally become the first section.

### Step 3.5: Expose Space's Account ID via SpaceContext

**File**: `src/domain/space/about/graphql/SpaceAboutQueries.graphql`

Add `account { id }` to the `SpaceAboutBase` query so the Space's owning account ID is available:

```graphql
query SpaceAboutBase($spaceId: UUID!) {
  lookup {
    space(ID: $spaceId) {
      id
      level
      nameID
      account {
        id
      }
      # ... rest unchanged
    }
  }
}
```

**File**: `src/domain/space/context/SpaceContext.tsx`

Add `accountId` to `SpaceContextProps.space` and populate from `spaceData?.account?.id`:

```typescript
interface SpaceContextProps {
  space: {
    id: string;
    levelZeroSpaceId: string;
    nameID: string;
    about: SpaceAboutLightModel;
    level: SpaceLevel;
    accountId: string;  // NEW
  };
  // ...
}
```

Then regenerate: `pnpm codegen`

### Step 4: Pass `accountId` from Callers

Update each caller to pass `accountId`. The source depends on context:

**Space creation** (no existing Space — use user's account):
```typescript
const { accountId } = useCurrentUserContext();
```

**Within a Space** (Space exists — use Space's owning account):
```typescript
const { space: { accountId } } = useSpace();
```

Then pass to dialog/options:
```tsx
<ImportTemplatesDialog
  accountId={accountId}
  // ... existing props
/>
```

**Space creation callers** (use `useCurrentUserContext()`):
- `SpaceTemplateSelector` (`src/domain/templates/components/TemplateSelectors/SpaceTemplateSelector.tsx`)

**In-Space callers** (use `useSpace()` → `space.accountId`):
- `PostTemplateSelector` (`src/domain/templates/components/TemplateSelectors/PostTemplateSelector.tsx`)
- `WhiteboardTemplateSelector` (`src/domain/templates/components/TemplateSelectors/WhiteboardTemplateSelector.tsx`)
- `CreateCalloutDialog` (`src/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog.tsx`)
- `InnovationFlowSettingsDialog` (`src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog.tsx`)
- `SetDefaultTemplateDialog` (`src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/SetDefaultTemplateDialog.tsx`)
- `WhiteboardDialogTemplatesLibrary` (`src/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary.tsx`)
- `SpaceAdminTemplatesPage` (`src/domain/spaceAdmin/SpaceAdminTemplates/SpaceAdminTemplatesPage.tsx`)
- `SpaceAdminCommunityPage` (`src/domain/spaceAdmin/SpaceAdminCommunity/SpaceAdminCommunityPage.tsx`)

### Step 5: Verify

```bash
pnpm lint          # Type check + lint
pnpm vitest run    # Run tests
```

Manual testing:
1. Create an account with a private innovation pack containing templates
2. Open Space creation -> verify Account templates section appears first
3. Open Post template picker inside a Space -> verify order: Space, Account, Platform
4. Verify empty account templates section is hidden
5. Verify template selection works identically to Space/Platform templates
