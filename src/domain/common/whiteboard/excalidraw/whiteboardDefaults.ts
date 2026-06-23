/**
 * MUI-free source of the whiteboard default appState values. These previously
 * lived on the MUI theme (`theme.whiteboards.*` in
 * `src/core/ui/themes/default/Theme.ts`); extracted here so consumers can read
 * them without value-importing the MUI theme (which pulls `createTheme` into the
 * bundle). The values are unchanged.
 */
export const WHITEBOARD_DEFAULTS = {
  defaultStrokeColor: '#000000',
  defaultStrokeStyle: 'solid',
  defaultStrokeWidth: 1,
  defaultBackgroundColor: '#FFFFFF',
  defaultFillStyle: 'solid',
  defaultFontFamily: 2,
  defaultFontSize: 20,
  defaultTextAlign: 'left',
  defaultRoughness: 0,
  defaultRoundness: 'sharp',
  defaultOpacity: 100,
  defaultEndArrowhead: 'triangle',
  defaultChartType: 'line',
} as const;
