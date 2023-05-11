export const GUTTER_PX = 20;

export const GUTTER_MUI = 2;

export const MAX_CONTENT_WIDTH_WITH_GUTTER_PX = 1400;
export const MAX_CONTENT_WIDTH_GUTTERS = 70;

export const GRID_COLUMNS_MOBILE = 4;
export const GRID_COLUMNS_DESKTOP = 12;

export const cardsGridColumns = (parentColumns: number) => {
  if (parentColumns >= 12) {
    return 15;
  }
  if (parentColumns >= 8) {
    return 9;
  }
  return 3;
};
