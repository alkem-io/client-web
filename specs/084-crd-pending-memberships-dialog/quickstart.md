# Quickstart: CRD Pending Memberships Dialog

**Feature**: 084-crd-pending-memberships-dialog
**Date**: 2026-04-08

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- `pnpm install` completed
- CRD toggle enabled: `localStorage.setItem('alkemio-crd-enabled', 'true'); location.reload();`

## Implementation Order

### Step 0: Port Separator Primitive

Copy `prototype/src/app/components/ui/separator.tsx` → `src/crd/primitives/separator.tsx`:
- Update `cn()` import to `@/crd/lib/utils`
- Remove `"use client"` directive
- Verify `@radix-ui/react-separator` is already in `package.json`

### Step 1: CRD Card Components

Create in `src/crd/components/dashboard/`:

1. **PendingInvitationCard.tsx** — clickable card for one invitation
   - Imports: `Avatar`, `Skeleton` from primitives, `cn()`, `useTranslation('crd-dashboard')`
   - Props: `PendingInvitationCardData` + `onClick` + `className`
   - Element: `<button>` (navigates to detail view)

2. **PendingApplicationCard.tsx** — clickable card for one application
   - Imports: `Avatar`, `Skeleton` from primitives, `cn()`
   - Props: `PendingApplicationCardData` + `onClick` + `className`
   - Element: `<a href={spaceHref}>` with onClick

### Step 2: CRD Dialog Components

Create in `src/crd/components/dashboard/`:

3. **PendingMembershipsSection.tsx** — titled section wrapper
   - Props: `title`, `children`
   - Renders: `<section>` + `<h3>` + `<ul role="list">`

4. **PendingMembershipsListDialog.tsx** — main list dialog
   - Imports: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Button`, `Skeleton`
   - Props: `open`, `onClose`, `loading`, `isEmpty`, `children`
   - Pattern: Follow `TipsAndTricksDialog.tsx` structure

5. **InvitationDetailDialog.tsx** — detail view dialog
   - Imports: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Button`, `Avatar`, `Badge`
   - Props: `InvitationDetailDialogProps` (see contracts)
   - Icons: `ArrowLeft`, `Check`, `X` from lucide-react

### Step 3: i18n Keys

Add `pendingMemberships` block to all 6 files in `src/crd/i18n/dashboard/`:
- `dashboard.en.json` (English source)
- `dashboard.{nl,es,bg,de,fr}.json` (translations)

### Step 4: Data Mappers

Create `src/main/crdPages/dashboard/pendingMembershipsDataMappers.ts`:
- `mapHydratedInvitationToCardData()`
- `mapHydratedApplicationToCardData()`
- `mapHydratedInvitationToDetailData()`

### Step 5: Integration Wrapper

Create `src/main/crdPages/dashboard/CrdPendingMembershipsDialog.tsx`:
- Internal wrappers: `HydratedInvitationCard`, `HydratedApplicationCard`, `InvitationDetailContainer`
- Main component: mirrors MUI `PendingMembershipsDialog` structure

### Step 6: Swap in CrdLayoutWrapper

Modify `src/main/ui/layout/CrdLayoutWrapper.tsx`:
- Change lazy import from MUI dialog to CRD dialog

## Verification

```bash
# Lint + type check
pnpm lint

# Run tests
pnpm vitest run

# Dev server (verify visually)
pnpm start
# Then navigate to localhost:3001/home with CRD enabled

# Standalone CRD app (verify components with mock data)
pnpm crd:dev
# Then check localhost:5200
```

## Key Reference Files

| Purpose | File |
|---------|------|
| Prototype design | `prototype/src/app/components/dialogs/InvitationsDialog.tsx` |
| MUI dialog (replicate behavior) | `src/domain/community/pendingMembership/PendingMembershipsDialog.tsx` |
| MUI detail view | `src/domain/community/invitations/InvitationDialog.tsx` |
| MUI invitation card | `src/domain/community/invitations/InvitationCardHorizontal/InvitationCardHorizontal.tsx` |
| Business logic hooks | `src/domain/community/pendingMembership/PendingMemberships.tsx` |
| Accept/reject mutations | `src/domain/community/invitations/useInvitationActions.ts` |
| Dialog context | `src/domain/community/pendingMembership/PendingMembershipsDialogContext.tsx` |
| Existing CRD dialog pattern | `src/crd/components/dashboard/TipsAndTricksDialog.tsx` |
| Existing CRD dialog pattern | `src/crd/components/dashboard/MembershipsTreeDialog.tsx` |
| Layout wrapper (to modify) | `src/main/ui/layout/CrdLayoutWrapper.tsx` |
| Existing data mappers | `src/main/crdPages/dashboard/dashboardDataMappers.ts` |
| Migration guide | `docs/crd/migration-guide.md` |
