import { Breakpoint } from '@mui/material/styles';

export const GUTTER_PX = 20;

export const GUTTER_MUI = 2;

export const MAX_CONTENT_WIDTH_WITH_GUTTER_PX = 1400;
export const MAX_CONTENT_WIDTH_GUTTERS = 70;

export const GRID_COLUMNS_MOBILE = 4;
export const GRID_COLUMNS_DESKTOP = 12;

export const cardsGridColumns = (breakpoint: Breakpoint) => {
  switch (breakpoint) {
    case 'xs':
      return 3;
    case 'sm':
      return 6;
    default:
      return 9;
  }
};
