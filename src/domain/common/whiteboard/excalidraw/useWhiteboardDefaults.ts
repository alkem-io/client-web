import type { AppState } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { useTheme } from '@mui/material';

const useWhiteboardDefaults = (): {
  appState: Partial<AppState>;
} => {
  const theme = useTheme();
  return {
    appState: {
      currentItemStrokeColor: theme.whiteboards.defaultStrokeColor,
      currentItemStrokeStyle: theme.whiteboards.defaultStrokeStyle,
      currentItemStrokeWidth: theme.whiteboards.defaultStrokeWidth,
      currentItemBackgroundColor: theme.whiteboards.defaultBackgroundColor,
      currentItemFillStyle: theme.whiteboards.defaultFillStyle,
      currentItemFontFamily: theme.whiteboards.defaultFontFamily,
      currentItemFontSize: theme.whiteboards.defaultFontSize,
      currentItemTextAlign: theme.whiteboards.defaultTextAlign,
      currentItemRoughness: theme.whiteboards.defaultRoughness,
      currentItemRoundness: theme.whiteboards.defaultRoundness,
      currentItemOpacity: theme.whiteboards.defaultOpacity,
      currentItemEndArrowhead: theme.whiteboards.defaultEndArrowhead,
      currentChartType: theme.whiteboards.defaultChartType,
    },
  };
};

export default useWhiteboardDefaults;
