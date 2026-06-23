import type { AppState } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { WHITEBOARD_DEFAULTS } from './whiteboardDefaults';

const useWhiteboardDefaults = (): {
  appState: Partial<AppState>;
} => {
  return {
    appState: {
      currentItemStrokeColor: WHITEBOARD_DEFAULTS.defaultStrokeColor,
      currentItemStrokeStyle: WHITEBOARD_DEFAULTS.defaultStrokeStyle,
      currentItemStrokeWidth: WHITEBOARD_DEFAULTS.defaultStrokeWidth,
      currentItemBackgroundColor: WHITEBOARD_DEFAULTS.defaultBackgroundColor,
      currentItemFillStyle: WHITEBOARD_DEFAULTS.defaultFillStyle,
      currentItemFontFamily: WHITEBOARD_DEFAULTS.defaultFontFamily,
      currentItemFontSize: WHITEBOARD_DEFAULTS.defaultFontSize,
      currentItemTextAlign: WHITEBOARD_DEFAULTS.defaultTextAlign,
      currentItemRoughness: WHITEBOARD_DEFAULTS.defaultRoughness,
      currentItemRoundness: WHITEBOARD_DEFAULTS.defaultRoundness,
      currentItemOpacity: WHITEBOARD_DEFAULTS.defaultOpacity,
      currentItemEndArrowhead: WHITEBOARD_DEFAULTS.defaultEndArrowhead,
      currentChartType: WHITEBOARD_DEFAULTS.defaultChartType,
    },
  };
};

export default useWhiteboardDefaults;
