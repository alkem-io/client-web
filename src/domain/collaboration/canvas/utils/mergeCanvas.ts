import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { BinaryFileData, ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import { uniqueId } from 'lodash';

interface CanvasLike {
  type: string;
  version: number;
  source: string;
  appState: unknown;

  elements: ExcalidrawElement[];
  files?: Record<BinaryFileData['id'], BinaryFileData>;
}

const mergeCanvas = (canvasApi: ExcalidrawImperativeAPI, canvasValue: string | undefined) => {
  if (!canvasApi || !canvasValue) {
    return;
  }
  const parsedCanvas = JSON.parse(canvasValue) as CanvasLike;

  //TODO: This may not be needed
  if (parsedCanvas.type !== 'excalidraw' || parsedCanvas.version !== 2) {
    throw new Error('Unable to load canvas');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const fileId in parsedCanvas.files) {
    canvasApi.addFiles([parsedCanvas.files[fileId]]);
  }

  const currentElements = canvasApi.getSceneElements();
  const insertedElements = parsedCanvas.elements?.map(el => ({
    ...el,
    id: uniqueId(Math.random().toString()),
  }));

  const newElements = [...currentElements, ...insertedElements];
  canvasApi.updateScene({
    appState: canvasApi.getAppState(),
    elements: newElements,
    commitToHistory: true, // TODO: WARNING maybe this needs to be false when collaborative editing
  });
};

export default mergeCanvas;
