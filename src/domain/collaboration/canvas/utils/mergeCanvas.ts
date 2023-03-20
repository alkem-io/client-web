import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { BinaryFileData, ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import { v4 as uuidv4 } from 'uuid';

interface CanvasLike {
  type: string;
  version: number;
  elements: ExcalidrawElement[];
  files?: Record<BinaryFileData['id'], BinaryFileData>;
}

const verifyCanvas = (canvas: CanvasLike) => {
  if (!canvas) {
    return false;
  }
  if (canvas.type !== 'excalidraw' || canvas.version !== 2) {
    return false;
  }
  if (!canvas.elements) {
    return false;
  }
  // At least we have something that looks like a canvas
  return true;
};

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
const getBoundingBox = (canvasElements?: readonly ExcalidrawElement[]): BoundingBox => {
  if (!canvasElements || canvasElements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  const [firstElement, ...elements] = canvasElements;

  const box = {
    minX: firstElement.x,
    minY: firstElement.y,
    maxX: firstElement.x + firstElement.width,
    maxY: firstElement.y + firstElement.height,
  };

  elements.forEach(element => {
    box.minX = Math.min(element.x, box.minX);
    box.minY = Math.min(element.y, box.minY);
    box.maxX = Math.max(element.x + element.width, box.maxX);
    box.maxY = Math.max(element.y + element.height, box.maxY);
  });
  return box;
};

const calculateInsertionPoint = (canvasA: BoundingBox, canvasB: BoundingBox): { x: number; y: number } => {
  // Center the canvasB vertically in reference to canvasA
  // minY - height / 2
  const aY = canvasA.minY + (canvasA.maxY - canvasA.minY) / 2;
  const bY = canvasB.minY + (canvasB.maxY - canvasB.minY) / 2;
  // Displace middle of canvasB to middle of canvasA
  const y = aY - bY;

  // Displace all elements of canvasB to the right of canvasA + 10% of the width of canvasA
  const x = -canvasB.minX + canvasA.maxX + 0.1 * (canvasA.maxX - canvasA.minX);

  return { x, y };
};

const mergeCanvas = (canvasApi: ExcalidrawImperativeAPI, canvasValue: string) => {
  let parsedCanvas: CanvasLike;
  try {
    parsedCanvas = JSON.parse(canvasValue);
    if (!verifyCanvas(parsedCanvas)) return false;
  } catch (err) {
    // TODO: Log this somewhere else
    console.error('Unable to parse canvas value', canvasValue);
    return false;
  }

  try {
    // Insert missing files into current canvas:
    const currentFiles = canvasApi.getFiles();
    for (const fileId in parsedCanvas.files) {
      if (!currentFiles[fileId]) {
        canvasApi.addFiles([parsedCanvas.files[fileId]]);
      }
    }

    const currentElements = canvasApi.getSceneElements();

    const currentElementsBBox = getBoundingBox(currentElements);
    const insertedCanvasBBox = getBoundingBox(parsedCanvas.elements);
    const displacement = calculateInsertionPoint(currentElementsBBox, insertedCanvasBBox);

    const insertedElements = parsedCanvas.elements?.map(el => ({
      ...el,
      id: uuidv4(),
      x: el.x + displacement.x,
      y: el.y + displacement.y,
    }));

    const newElements = [...currentElements, ...insertedElements];
    canvasApi.updateScene({
      elements: newElements,
      commitToHistory: true, // TODO: WARNING maybe this needs to be false when collaborative editing
    });
    canvasApi.zoomToFit();
    return true;
  } catch (err) {
    // TODO: Log this somewhere else
    console.error('Error merging canvas', canvasValue);
    return false;
  }
};

export default mergeCanvas;
