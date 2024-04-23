import { AppState } from '@alkemio/excalidraw/types/types';
import { useTheme } from '@mui/material';

const useWhiteboardDefaults = (): {
  zoomToFit: boolean;
  appState: Partial<AppState>;
} => {
  const theme = useTheme();
  return {
    zoomToFit: true,
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
      hideLibraryButton: true, // Since v0.17.0-alkemio-4
    },
  };
};

export default useWhiteboardDefaults;
