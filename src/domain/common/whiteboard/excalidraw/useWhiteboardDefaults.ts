import type { AppState } from '@alkemio/excalidraw/dist/excalidraw/types';
import { useTheme } from '@mui/material';

const useWhiteboardDefaults = (): {
  zoomToFit: boolean;
  appState: Partial<AppState>;
} => {
  const theme = useTheme();
  return {
    // Do not change this zoomToFit value, it is deprecated and will be removed in a future release of the Excalidraw library,
    // setting it to true causes issues (an infinite loading spinner in Excalidraw) (for more details see #7752)
    zoomToFit: false, // requires @alkemio/excalidraw-fork@0.15.2-alkemio-1 or higher

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
      hideLibraryButton: true, // requires @alkemio/excalidraw-fork@0.17.0-alkemio-4 or higher
    },
  };
};

export default useWhiteboardDefaults;
