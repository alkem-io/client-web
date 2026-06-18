import { useMediaQuery } from '@/crd/hooks/useMediaQuery';

export { GUTTER_MUI, GUTTER_PX } from './gutter.constants';

// Theme breakpoint values (px), from src/core/ui/themes/default/Theme.ts which
// overrides MUI's `md` to 1100 (xs:0, sm:600, md:1100, lg:1200, xl:1536). MUI's
// `up(k)` is `(min-width: <values[k]>px)`; `down(k)`/`only('xs')` is
// `(max-width: <values[k] - 0.05>px)`. These queries reproduce that exactly.
const BP = { sm: 600, md: 1100, lg: 1200 };
const upMd = `(min-width: ${BP.md}px)`;
const upLg = `(min-width: ${BP.lg}px)`;
const downSm = `(max-width: ${BP.sm - 0.05}px)`;
const downMd = `(max-width: ${BP.md - 0.05}px)`;
const onlyXs = `(max-width: ${BP.sm - 0.05}px)`;

export const MAX_CONTENT_WIDTH_WITH_GUTTER_PX = 1400;
export const MAX_CONTENT_WIDTH_GUTTERS = 70;

export const GRID_COLUMNS_MOBILE = 4;
export const GRID_COLUMNS_TABLET = 8;
export const GRID_COLUMNS_DESKTOP = 12;

export const useGlobalGridColumns = () => {
  const isLarge = useMediaQuery(upMd);
  const isSmall = useMediaQuery(downSm);

  if (isLarge) {
    return GRID_COLUMNS_DESKTOP;
  }
  if (isSmall) {
    return GRID_COLUMNS_MOBILE;
  }
  return GRID_COLUMNS_TABLET;
};

export const cardsGridColumns = (parentColumns: number) => {
  if (parentColumns >= 12) {
    return 15;
  }
  if (parentColumns >= 8) {
    return 9;
  }
  return 3;
};

export const useScreenSize = () => {
  const isLargeScreen = useMediaQuery(upLg); // Inclusive: 'lg', 'xl'
  const isMediumLargeScreen = useMediaQuery(upMd); // Inclusive: 'md', 'lg', 'xl
  const isMediumSmallScreen = useMediaQuery(downMd); // Exclusive: 'sm' and 'xs'
  const isSmallScreen = useMediaQuery(onlyXs);
  return { isLargeScreen, isMediumLargeScreen, isMediumSmallScreen, isSmallScreen };
};
