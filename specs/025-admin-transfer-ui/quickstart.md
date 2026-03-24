# Quickstart: Admin UI for Space Conversions & Resource Transfers

**Branch**: `025-admin-transfer-ui` | **Date**: 2026-03-24

## Prerequisites

- Node ≥22.0.0, pnpm ≥10.17.1
- Backend running at `localhost:3000` (Traefik) / `localhost:4000/graphql` (for codegen)
- Platform admin credentials for testing

```bash
pnpm install
pnpm start  # Dev server at localhost:3001
```

## Implementation Order

Work follows feature priority (P1→P4) and the domain-first workflow: **GraphQL document → codegen → hook → component → i18n → page integration**.

### Phase A: Page Reorganization (prerequisite for all sections)

1. **Update `TransferPage.tsx`** — Reorganize from flat layout into two areas:
   - Conversions area (header + placeholder for sections)
   - Transfers area (header + existing `TransferSpaceSection` + `TransferCalloutSection`)
2. **Update i18n** — Add area headers and page title to `translation.en.json`
3. **Update admin tab label** — Change tab from "Transfer" to "Conversions & Transfers" in `constants.ts`

### Phase B: Space Conversions (P1)

1. **Create `SpaceConversion.graphql`** in `src/domain/platformAdmin/management/transfer/spaceConversion/`
   - Adapt from `contracts/SpaceConversion.graphql` — validate field names against live schema
   - Run `pnpm codegen` to generate hooks
2. **Create `useSpaceConversion.ts`** hook:
   - URL input state → URL resolve lazy query → space lookup lazy query
   - Sibling L1 fetch for demotion picker (lazy, triggered only for L1 spaces)
   - Three mutation handlers (L1→L0, L1→L2, L2→L1)
   - Loading, error, and confirmation dialog states
3. **Create `SpaceConversionSection.tsx`** component:
   - URL input with resolve button
   - State card showing space name, level, account
   - Dynamic operation buttons based on resolved level
   - `FormikAutocomplete` for L1→L2 target picker (sibling L1 spaces)
   - `ConfirmationDialog` with operation-specific warnings
4. **Add i18n keys** under `pages.admin.spaceConversion.*`
5. **Integrate into `TransferPage.tsx`** Conversions area

### Phase C: Resource Transfers (P2)

1. **Create shared `AccountSearchPicker`** in `shared/`:
   - `useAccountSearch.ts` — lazy queries for users + orgs by displayName
   - `AccountSearchPicker.tsx` — `FormikAutocomplete` wrapper with combined results
   - `AccountSearch.graphql` — adapt from `contracts/AccountSearch.graphql`
   - Run `pnpm codegen`
2. **Create Transfer Innovation Hub** section (follow Transfer Space pattern):
   - `TransferInnovationHub.graphql` → codegen → `useTransferInnovationHub.ts` → `TransferInnovationHubSection.tsx`
3. **Create Transfer Innovation Pack** section (same pattern):
   - `TransferInnovationPack.graphql` → codegen → `useTransferInnovationPack.ts` → `TransferInnovationPackSection.tsx`
4. **Create Transfer Virtual Contributor** section (same pattern):
   - `TransferVirtualContributor.graphql` → codegen → `useTransferVirtualContributor.ts` → `TransferVirtualContributorSection.tsx`
5. **Add i18n keys** for all three under `pages.admin.transfer{Hub,Pack,Vc}.*`
6. **Integrate all three** into `TransferPage.tsx` Transfers area

### Phase D: VC Type Conversion (P3)

1. **Create `VcConversion.graphql`** — adapt from `contracts/VcConversion.graphql`, run `pnpm codegen`
2. **Create `useVcConversion.ts`** hook:
   - URL resolve → VC lookup → source space callout count fetch
   - Conversion mutation handler
   - Disable conversion for already-KNOWLEDGE_BASE VCs
3. **Create `VcConversionSection.tsx`** component:
   - URL input, state card (VC name, type, source space, callout count)
   - Confirmation dialog warning about callout move
4. **Add i18n keys** under `pages.admin.vcConversion.*`
5. **Integrate into `TransferPage.tsx`** Conversions area (below Space Conversions)

### Phase E: Callout Transfer (P4) — No work needed

Existing `TransferCalloutSection` is preserved as-is per spec (FR-028).

## Key Patterns to Follow

### Hook Pattern (from `useTransferSpace.ts`)

```typescript
// 1. URL state
const [url, setUrl] = useState('');

// 2. URL resolution (lazy query)
const [resolveUrl, { data: resolvedData, loading: resolving }] = useXxxUrlResolveLazyQuery();

// 3. Entity lookup (lazy query, triggered after resolve)
const [lookupEntity, { data: entityData, loading: lookingUp }] = useXxxLookupLazyQuery();

// 4. Mutation
const [executeMutation, { loading: mutationLoading }] = useXxxMutation();

// 5. Resolve handler
const handleResolve = async () => {
  const fullUrl = toFullUrl(url);
  const result = await resolveUrl({ variables: { url: fullUrl } });
  if (result.data?.urlResolver.state === 'Resolved') {
    await lookupEntity({ variables: { id: result.data.urlResolver.xxx.id } });
  }
};

// 6. Mutation handler with notification
const notify = useNotification();
const handleMutation = async () => {
  try {
    await executeMutation({ variables: { ... } });
    notify(t('successMessage'), 'success');
  } catch {
    notify(t('errorMessage'), 'error');
  }
};
```

### Component Pattern (from `TransferSpaceSection.tsx`)

```typescript
const XxxSection = () => {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { entity, loading, handleResolve, handleMutation, mutationLoading } = useXxx();

  return (
    <PageContentBlock>
      <BlockTitle>{t('sectionTitle')}</BlockTitle>
      {/* URL input + resolve button */}
      {/* Entity state display */}
      {/* Operation buttons */}
      <ConfirmationDialog
        entities={{ title: t('confirmTitle'), content: t('confirmWarning') }}
        actions={{ onConfirm: handleMutation, onCancel: () => setConfirmOpen(false) }}
        options={{ show: confirmOpen }}
        state={{ isLoading: mutationLoading }}
      />
    </PageContentBlock>
  );
};
```

## Codegen Workflow

After creating/modifying any `.graphql` file:

```bash
# Requires backend at localhost:4000/graphql
pnpm codegen

# Verify generated hooks exist
grep -c "useConvertSpaceL1ToL0Mutation\|useConvertSpaceL1ToL2Mutation\|useConvertSpaceL2ToL1Mutation" \
  src/core/apollo/generated/apollo-hooks.ts
```

## Testing Checklist

```bash
# Type check + lint
pnpm lint

# Run existing tests (ensure no regressions)
pnpm vitest run

# Manual testing (requires running backend + platform admin account):
# 1. Navigate to /admin → "Conversions & Transfers" tab
# 2. Verify existing Transfer Space and Transfer Callout work unchanged
# 3. Test each new section: resolve URL → view state → confirm operation
# 4. Test error cases: invalid URL, insufficient privileges, empty picker
```

## i18n Key Structure

All keys go in `src/core/i18n/en/translation.en.json`:

```
pages.admin.conversionsAndTransfers.pageTitle
pages.admin.conversionsAndTransfers.conversionsArea
pages.admin.conversionsAndTransfers.transfersArea

pages.admin.spaceConversion.sectionTitle
pages.admin.spaceConversion.urlPlaceholder
pages.admin.spaceConversion.resolve
pages.admin.spaceConversion.noConversions        # L0 informational message
pages.admin.spaceConversion.promoteL1ToL0.button
pages.admin.spaceConversion.promoteL1ToL0.confirmTitle
pages.admin.spaceConversion.promoteL1ToL0.confirmWarning
pages.admin.spaceConversion.demoteL1ToL2.button
pages.admin.spaceConversion.demoteL1ToL2.confirmTitle
pages.admin.spaceConversion.demoteL1ToL2.confirmWarning
pages.admin.spaceConversion.demoteL1ToL2.noTargets  # No sibling L1s
pages.admin.spaceConversion.demoteL1ToL2.targetLabel
pages.admin.spaceConversion.promoteL2ToL1.button
pages.admin.spaceConversion.promoteL2ToL1.confirmTitle
pages.admin.spaceConversion.promoteL2ToL1.confirmWarning
pages.admin.spaceConversion.successMessage
pages.admin.spaceConversion.errorMessage
pages.admin.spaceConversion.urlNotFound
pages.admin.spaceConversion.urlNotSpace

pages.admin.vcConversion.sectionTitle
pages.admin.vcConversion.* (similar pattern)

pages.admin.transferHub.sectionTitle
pages.admin.transferHub.* (similar pattern)

pages.admin.transferPack.sectionTitle
pages.admin.transferPack.* (similar pattern)

pages.admin.transferVc.sectionTitle
pages.admin.transferVc.* (similar pattern)
```

## File Checklist

| File | Phase | Status |
|------|-------|--------|
| `TransferPage.tsx` (reorganize) | A | TODO |
| `constants.ts` (tab label) | A | TODO |
| `translation.en.json` (new keys) | A-D | TODO |
| `spaceConversion/SpaceConversion.graphql` | B | TODO |
| `spaceConversion/useSpaceConversion.ts` | B | TODO |
| `spaceConversion/SpaceConversionSection.tsx` | B | TODO |
| `shared/AccountSearch.graphql` | C | TODO |
| `shared/useAccountSearch.ts` | C | TODO |
| `shared/AccountSearchPicker.tsx` | C | TODO |
| `transferInnovationHub/TransferInnovationHub.graphql` | C | TODO |
| `transferInnovationHub/useTransferInnovationHub.ts` | C | TODO |
| `transferInnovationHub/TransferInnovationHubSection.tsx` | C | TODO |
| `transferInnovationPack/TransferInnovationPack.graphql` | C | TODO |
| `transferInnovationPack/useTransferInnovationPack.ts` | C | TODO |
| `transferInnovationPack/TransferInnovationPackSection.tsx` | C | TODO |
| `transferVirtualContributor/TransferVirtualContributor.graphql` | C | TODO |
| `transferVirtualContributor/useTransferVirtualContributor.ts` | C | TODO |
| `transferVirtualContributor/TransferVirtualContributorSection.tsx` | C | TODO |
| `vcConversion/VcConversion.graphql` | D | TODO |
| `vcConversion/useVcConversion.ts` | D | TODO |
| `vcConversion/VcConversionSection.tsx` | D | TODO |
