import type { ImportedDataState } from '@alkemio/excalidraw/dist/excalidraw/data/types';

const EmptyWhiteboard: ImportedDataState = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: [],
  appState: {
    gridSize: null,
    viewBackgroundColor: '#ffffff',
  },
  files: {},
};
export const EmptyWhiteboardString = JSON.stringify(EmptyWhiteboard);

export default EmptyWhiteboard;
