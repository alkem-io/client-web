import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { BinaryFileData, ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import { v4 as uuidv4 } from 'uuid';

class WhiteboardMergeError extends Error {}

interface WhiteboardLike {
  type: string;
  version: number;
  elements: ExcalidrawElement[];
  files?: Record<BinaryFileData['id'], BinaryFileData>;
}

const isWhiteboardLike = (parsedObject: unknown): parsedObject is WhiteboardLike => {
  if (!parsedObject) {
    return false;
  }

  const whiteboard = parsedObject as Record<string, unknown>;
  if (whiteboard['type'] !== 'excalidraw' || whiteboard['version'] !== 2) {
    return false;
  }
  if (!whiteboard['elements'] || !Array.isArray(whiteboard['elements'])) {
    return false;
  }
  // At least we have something that looks like a whiteboard
  return true;
};

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const getBoundingBox = (whiteboardElements?: readonly ExcalidrawElement[]): BoundingBox => {
  if (!whiteboardElements || whiteboardElements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  const [firstElement, ...elements] = whiteboardElements;

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

const calculateInsertionPoint = (whiteboardA: BoundingBox, whiteboardB: BoundingBox): { x: number; y: number } => {
  // Center the whiteboardB vertically in reference to whiteboardA
  // minY - height / 2
  const aY = whiteboardA.minY + (whiteboardA.maxY - whiteboardA.minY) / 2;
  const bY = whiteboardB.minY + (whiteboardB.maxY - whiteboardB.minY) / 2;
  // Displace middle of whiteboardB to middle of whiteboardA
  const y = aY - bY;

  // Displace all elements of whiteboardB to the right of whiteboardA + 10% of the width of whiteboardA
  const x = -whiteboardB.minX + whiteboardA.maxX + 0.1 * (whiteboardA.maxX - whiteboardA.minX);

  return { x, y };
};

const mergeWhiteboard = (whiteboardApi: ExcalidrawImperativeAPI, whiteboardContent: string) => {
  let parsedWhiteboard: unknown;
  try {
    parsedWhiteboard = JSON.parse(whiteboardContent);
  } catch (err) {
    throw new WhiteboardMergeError(`Unable to parse whiteboard content: ${err}`);
  }

  if (!isWhiteboardLike(parsedWhiteboard)) throw new WhiteboardMergeError('Whiteboard verification failed');

  try {
    // Insert missing files into current whiteboard:
    const currentFiles = whiteboardApi.getFiles();
    for (const fileId in parsedWhiteboard.files) {
      if (!currentFiles[fileId]) {
        whiteboardApi.addFiles([parsedWhiteboard.files[fileId]]);
      }
    }

    const currentElements = whiteboardApi.getSceneElements();

    const currentElementsBBox = getBoundingBox(currentElements);
    const insertedWhiteboardBBox = getBoundingBox(parsedWhiteboard.elements);
    const displacement = calculateInsertionPoint(currentElementsBBox, insertedWhiteboardBBox);

    const insertedElements = parsedWhiteboard.elements?.map(el => ({
      ...el,
      id: uuidv4(),
      x: el.x + displacement.x,
      y: el.y + displacement.y,
    }));

    const newElements = [...currentElements, ...insertedElements];
    whiteboardApi.updateScene({
      elements: newElements,
      commitToHistory: true, // TODO: WARNING maybe this needs to be false when collaborative editing
    });
    whiteboardApi.zoomToFit();
    return true;
  } catch (err) {
    throw new WhiteboardMergeError(`Unable to merge whiteboards: ${err}`);
  }
};

export default mergeWhiteboard;
