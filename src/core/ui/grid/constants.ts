import { Theme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

export const GUTTER_PX = 20;

export const GUTTER_MUI = 2;

export const MAX_CONTENT_WIDTH_WITH_GUTTER_PX = 1400;
export const MAX_CONTENT_WIDTH_GUTTERS = 70;

export const GRID_COLUMNS_MOBILE = 4;
export const GRID_COLUMNS_TABLET = 8;
export const GRID_COLUMNS_DESKTOP = 12;

export const useGlobalGridColumns = () => {
  const isLarge = useMediaQuery<Theme>(theme => theme.breakpoints.up('md'));
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

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
  const isLargeScreen = useMediaQuery<Theme>(theme => theme.breakpoints.up('md')); // Inclusive: 'md', 'lg', 'xl
  const isMediumScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('md')); // Exclusive: 'sm' and 'xs'
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.only('xs'));
  return { isLargeScreen, isMediumScreen, isSmallScreen };
};
