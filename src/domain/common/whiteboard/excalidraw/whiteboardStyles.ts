import { AppState } from '@alkemio/excalidraw/types/types';

// Excalidraw's whiteboard defaults for AppState:
const whiteboardStyles: {
  zoomToFit: boolean;
  appState: Partial<AppState>;
} = {
  zoomToFit: true,
  appState: {
    currentItemStrokeColor: '#000000',
    currentItemStrokeStyle: 'solid', // "solid" | "dashed" | "dotted"
    currentItemStrokeWidth: 1,
    currentItemBackgroundColor: '#FFFFFF',
    currentItemFillStyle: 'solid', // "hachure" | "cross-hatch" | "solid" | "zigzag"
    currentItemFontFamily: 2, // Font: 1 = Hand-drawn (Virgil), 2 = Normal (Helvetica), 2 = Code (Cascadia), 4 = (not in the toolbar) Assistant
    currentItemFontSize: 20,
    currentItemTextAlign: 'left',
    currentItemRoughness: 0, // Sloppiness (0 = Architect, 1 = Artist, 2 = Cartoonist)
    currentItemRoundness: 'sharp', // Edges: "round" | "sharp"
    currentItemOpacity: 100,
    currentItemEndArrowhead: 'triangle', // "arrow" | "bar" | "dot" | "triangle"
    currentChartType: 'line', // "bar" | "line"
    hideLibraryButton: true, // Since v0.17.0-alkemio-4
  },
};

export default whiteboardStyles;
