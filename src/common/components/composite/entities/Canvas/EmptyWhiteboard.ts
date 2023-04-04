import { ImportedDataState } from '@alkemio/excalidraw/types/data/types';

const EmptyWhiteboard: ImportedDataState = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: [],
  appState: {
    gridSize: null,
    viewBackgroundColor: '#ffffff',
  },
};
export const EmptyWhiteboardJSON = JSON.stringify(EmptyWhiteboard);

export default EmptyWhiteboard;
