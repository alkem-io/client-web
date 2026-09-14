# Phase 1 — Component Prop Surface (Data Model)

This is a presentational layout change. **No domain entities, no GraphQL types, no persisted data, no state machines are affected.** What changes is the prop surface of two CRD components. This document specifies the before/after.

## `SpaceHeader` — `src/crd/components/space/SpaceHeader.tsx`

### Removed props

| Prop | Type (today) | Reason removed |
|------|--------------|----------------|
| `memberAvatars` | `MemberAvatar[]` | Member-avatar stack is removed from the header. Members are accessed via the dedicated members panel. |
| `onMemberClick` | `() => void` | Same — no clickable avatar stack in the header. |

### Retained props (unchanged)

| Prop | Type | Notes |
|------|------|-------|
| `title` | `string` | Renders as `<h1 className="text-hero text-foreground truncate">` in the title row. Now sits below the banner, not overlaid. |
| `tagline` | `string \| undefined` | Renders below the title as `<p className="text-body text-muted-foreground truncate">`. Hidden when undefined. |
| `bannerUrl` | `string \| undefined` | Renders as a full-width `<img>` whose `width`/`height` attributes come from `bannerPlaceholderSize(bannerAspectRatio)` *(superseded 2026-08-31 — was a `background-image` on a fixed `aspect-[6/1]` div)*. Falls back to `color` gradient at the same ratio. |
| `bannerAspectRatio` | `number \| undefined` | *(added 2026-08)* Width / height ratio from the BANNER visual's `Visual.aspectRatio` (server-bounded 6–10). Defaults to `DEFAULT_BANNER_ASPECT_RATIO` (10). See spec A8. |
| `color` | `string \| undefined` | Deterministic accent colour (from `pickColorFromId`, applied by the consumer). Gradient fallback when `bannerUrl` is missing. |
| `isHomeSpace` | `boolean \| undefined` | Renders a `<Home>` icon next to the title (theme-tokenised, no longer white-on-banner). |
| `actions` | `SpaceHeaderActions` | Subset of `{ showVideoCall, showShare, showSettings, showActivity, onActivityClick, onVideoCallClick, onShareClick, videoCallUrl, settingsHref, onSettingsClick }`. Rendered as a right-aligned `<Button variant="ghost" size="icon">` group inside the title row. |
| `className` | `string \| undefined` | Optional class composition on the outermost wrapper. |

### Markup contract (post-change)

```tsx
<div className={cn('flex flex-col bg-background', className)}>
  {/* Banner: full-width, fluid at the per-space ratio (was a fixed aspect-[6/1] — superseded 2026-08-31, see spec A8) */}
  <div className="relative w-full overflow-hidden" style={{ aspectRatio: bannerAspectRatio }} role="img" aria-label={t('a11y.spaceBanner', { name: title })}>
    {/* bg image or gradient fallback — UNCHANGED logic */}
  </div>

  {/* Below-banner: title row + optional subtitle row, inside inner content width */}
  <div className="w-full px-6 md:px-8 pt-8 pb-8">
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col gap-1">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-hero text-foreground truncate">{title}</h1>
            {isHomeSpace && <Home className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />}
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {/* Activity / Video / Share / Settings — ghost icon buttons, neutral styling */}
          </div>
        </div>

        {/* Subtitle row (when tagline) */}
        {tagline && <p className="text-body text-muted-foreground truncate">{tagline}</p>}
      </div>
    </div>
  </div>
</div>
```

## `SubspaceHeader` — `src/crd/components/space/SubspaceHeader.tsx`

### Removed props

| Prop | Type (today) | Reason removed |
|------|--------------|----------------|
| `parentInitials` | `string` | Parent identity is now conveyed only by `parentBannerUrl` as the banner background. The parent-avatar tile is gone. |
| `parentColor` | `string` | Same — no parent tile to colour. |
| `badgeKind` | `'subspace' \| 'subSubspace'` | Level badge removed; breadcrumbs convey the same information. |
| `memberAvatars` | `MemberAvatar[]` | Member-avatar stack removed from the header. |
| `onMemberClick` | `() => void` | Same. |

### Retained props (unchanged)

| Prop | Type | Notes |
|------|------|-------|
| `title` | `string` | Same role as `SpaceHeader.title`. |
| `tagline` | `string \| undefined` | Same role as `SpaceHeader.tagline`. |
| ~~`subspaceInitials` / `subspaceColor` / `subspaceAvatarUrl`~~ | — | **Removed 2026-08-21** along with the 56px header avatar tile; the header renders the bare title and identity images moved to the breadcrumb trail. |
| `parentName` | `string` | Used in accessibility text only (e.g., banner `aria-label`). No visible parent tile. (May be safely dropped if no aria-label uses it post-refactor; audit during implementation.) |
| `parentBannerUrl` | `string \| undefined` | Renders as `background-image` on the banner. Falls back to a deterministic accent gradient derived from the L0 root id (the implementation receives this as a separate `color` prop). |
| `actions` | `SubspaceHeaderActions` | See `contracts/headers.ts` for the exact shape. Differs from `SpaceHeaderActions` in that it adds an optional `shareUrl` and omits `onSettingsClick` (settings is href-only on subspaces). Rendered in the title row's right cell. |
| `className` | `string \| undefined` | Outer wrapper class composition. |

### Markup contract (post-change)

```tsx
<div className={cn('flex flex-col bg-background', className)}>
  {/* Banner: full-width, fluid at the L0 banner's ratio (was a fixed aspect-[6/1] — superseded 2026-08-31, see spec A8) */}
  <div className="relative w-full overflow-hidden" style={{ aspectRatio: bannerAspectRatio }} role="img" aria-label={t('a11y.subspaceBanner', { name: title })}>
    {/* bg image (parentBannerUrl) or deterministic accent gradient — UNCHANGED logic */}
  </div>

  {/* Below-banner: title row + optional subtitle row, inside inner content width */}
  <div className="w-full px-6 md:px-8 pt-8 pb-8">
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col gap-1">
        {/* Title row: title (greedy) + actions.
            (Amended 2026-08-21: the 56px avatar tile that used to lead this row
            was removed — the <h1> stands alone.) */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-hero text-foreground truncate">{title}</h1>
          <div className="shrink-0 flex items-center gap-2">
            {/* Activity / Video / Share / Settings — same as SpaceHeader */}
          </div>
        </div>

        {/* Subtitle row */}
        {tagline && <p className="text-body text-muted-foreground truncate">{tagline}</p>}
      </div>
    </div>
  </div>
</div>
```

### Notes

- `parentName` is currently used by the layered-avatar `aria-label`, which is now gone. If the banner `aria-label` doesn't need it, the prop can also be dropped. Decide during implementation by grepping for `parentName` usage in the rewritten component.
- ~~The 56px (`size-14`) avatar matches the prototype's value. CRD `size-14` resolves to `width: 3.5rem; height: 3.5rem` (= 56px at default base).~~ *(Removed 2026-08-21 — no avatar tile remains in the header.)*

## Consumer integration deltas

`src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` — stops passing `memberAvatars` and `onMemberClick` to `<SpaceHeader>`.

`src/main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx` — stops passing `memberAvatars`, `onMemberClick`, `badgeKind`, `parentInitials`, `parentColor` to `<SubspaceHeader>`. The data mappers that previously built these values can also delete their now-orphaned mapping branches.

`src/crd/app/pages/SpacePage.tsx` and `src/crd/app/pages/SubspacePage.tsx` (standalone preview) — same prop trimming.

## i18n key audit

Translations to remove (if orphaned after the JSX change — verify with grep before deleting):

- `crd-subspace`: `badge.subspace`, `badge.subSubspace`, `a11y.parentLink`, `members.viewCommunity`
- `crd-space`: `members.title`

Apply the deletion to all six language files (`en`, `nl`, `es`, `bg`, `de`, `fr`) for the relevant namespace. No new translation keys are introduced.
