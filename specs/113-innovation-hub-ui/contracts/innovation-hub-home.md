# Contract: Innovation Hub Home Spaces section (CRD)

## `HubSpacesSection` (new CRD component)

`src/crd/components/innovationHub/HubSpacesSection.tsx`

```typescript
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';

export type HubSpacesSectionProps = {
  /** The hub's full, ordered Space cards (already filtered to the hub's set by the integration layer). */
  spaces: SpaceCardData[];
  /** The hub display name, used in the section title ("{{hubName}} Spaces"). */
  hubName: string;
  /** True while the hub's Spaces query is in flight (hub itself already resolved). */
  spacesLoading?: boolean;
};
```

### Behavior contract

- Renders the section heading `t('home.spacesSection.title', { hubName })`.
- When `spacesLoading && spaces.length === 0`: render `SpaceCardSkeleton` grid inside an `<output role="status" aria-label={t('home.spacesSection.loading')}>`.
- When `!spacesLoading && spaces.length === 0`: render the existing empty-hub state (`home.spacesSection.empty`); **no search box**.
- When `spaces.length > 0`: render the search `TagsInput`, the "Showing N Spaces" counter, the compact `SpaceCard` auto-fill grid (`grid-cols-[repeat(auto-fill,minmax(280px,1fr))]`), and the "Load more" button when `hasMore`.
- Search + batching are computed internally from visual `useState` (`searchTerms`, `visibleCount`); see data-model.md.
- No-results (search active, zero matches): dashed `FolderOpen` empty state with a "Clear search" button.

### Purity contract (enforced)

- No imports from `@mui/*`, `@emotion/*`, `@/core/apollo`, `@apollo/client`, `@/domain/*`, `@/core/auth/*`, `@/core/state/*`, `react-router-dom`, `formik`.
- Props are plain TypeScript (`SpaceCardData` is a plain CRD type, not a GraphQL type).
- Navigation is via `SpaceCard`'s `href` (no programmatic navigation).
- Styling: Tailwind + `cn()` + semantic typography tokens only; icons from `lucide-react`.
- All user-visible strings via `useTranslation(['crd-innovationHub', 'crd-common'])`.

### Accessibility contract (WCAG 2.1 AA)

- `TagsInput` has a persistent accessible name (`searchAria`) regardless of value.
- Results counter is plain readable text.
- Card grid is `<ul role="list">` / `<li>`.
- Loading uses `<output>`/`role="status"` with `aria-label`.
- "Load more" uses `aria-busy` while a (synchronous) batch reveal occurs is not required since it is instant; the button is a normal `<button>` with visible focus ring and the `crd-common:loadMore` label.
- Decorative icons `aria-hidden="true"`.

## `InnovationHubHome` (modified)

`src/crd/components/innovationHub/InnovationHubHome.tsx`

- Props **unchanged** (`InnovationHubHomeProps`): still `{ data, spaces, onSettingsClick?, fullWidth?, onToggleFullWidth?, overlayHeader?, spacesLoading? }`.
- The inline static Spaces `<section>` (skeletons / empty / static `<ul>` of `SpaceCard`) is **replaced** by `<HubSpacesSection spaces={spaces} hubName={data.name} spacesLoading={spacesLoading} />`.
- All other sections (banner, header, description card, all-spaces CTA) are unchanged.

## Integration layer (unchanged)

`CrdInnovationHubHomePage.tsx`, `useInnovationHubHomeData.ts`, `mapInnovationHubToHomeData.ts` are **not modified**. They already pass `spaces` (the hub's ordered set) and `spacesLoading` to `InnovationHubHome`.
