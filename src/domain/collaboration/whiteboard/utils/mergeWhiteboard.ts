import type { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { PRECEDING_ELEMENT_KEY } from '@alkemio/excalidraw/types/constants';
import type { BinaryFileData, ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import { v4 as uuidv4 } from 'uuid';

type ExcalidrawElementWithContainerId = ExcalidrawElement & { containerId: string | null };
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

/**
 * Generate new element ids and store them in the idsMap.
 * This is done to avoid id collisions when inserting multiple times the same template into a whiteboard.
 * @param idsMap
 * @returns a function that can be passed to elements.map
 */
const generateNewIds = (idsMap: Record<string, string>) => (element: ExcalidrawElement) => ({
  ...element,
  id: (idsMap[element.id] = uuidv4()), // Replace the id and store it in the map
});

/**
 * Returns a function that can be passed to elements.map to replace the version of the elements
 */
const replaceElementVersion = (version: number) => (element: ExcalidrawElement) => ({
  ...element,
  version,
});

/**
 * Returns a function that can be pased to elements.map to replace __preceedingElement__ on the elements that have it
 * For old versions of whiteboards that sort the elements with the __preceedingElement__ property
 */
const replacePreceedingElementsIds = (idsMap: Record<string, string>, lastElementId: string) => {
  return (element: ExcalidrawElement) => {
    if (!element[PRECEDING_ELEMENT_KEY]) {
      return element;
    }
    if (element[PRECEDING_ELEMENT_KEY] === '^') {
      return {
        ...element,
        [PRECEDING_ELEMENT_KEY]: lastElementId,
      };
    }
    if (idsMap[element[PRECEDING_ELEMENT_KEY]]) {
      return {
        ...element,
        [PRECEDING_ELEMENT_KEY]: idsMap[element[PRECEDING_ELEMENT_KEY]],
      };
    }
    return element;
  };
};

/**
 * Returns a function that can be pased to elements.map to replace the index on the elements that have it
 * For new versions of whiteboards that have the index property
 */
const replaceIndexes = baseIndex => {
  return (element: ExcalidrawElement) => {
    if (baseIndex && typeof element['index'] === 'number') {
      return {
        ...element,
        index: element['index'] + baseIndex,
      };
    }
    return element;
  };
};
/**
 * Returns a function that can be pased to elements.map to replace containerId and boundElements ids
 */
const replaceBoundElementsIds = (idsMap: Record<string, string>) => {
  const replace = (id: string | null) => (id ? idsMap[id] || id : id);
  const replaceMultiple = (boundElements: ExcalidrawElement['boundElements']) =>
    boundElements
      ? boundElements.map(boundElement => ({ ...boundElement, id: idsMap[boundElement.id] || boundElement.id }))
      : boundElements;

  return (element: ExcalidrawElement) => ({
    ...element,
    containerId: replace((element as ExcalidrawElementWithContainerId).containerId),
    boundElements: replaceMultiple(element.boundElements),
  });
};

/**
 * Returns a function that can be pased to elements.map, to displace elements by a given displacement
 */
const displaceElements = (displacement: { x: number; y: number }) => (element: ExcalidrawElement) => ({
  ...element,
  x: element.x + displacement.x,
  y: element.y + displacement.y,
});

const mergeWhiteboard = async (whiteboardApi: ExcalidrawImperativeAPI, whiteboardContent: string) => {
  const excalidrawUtils: {
    getSceneVersion: (elements: readonly ExcalidrawElement[]) => number;
  } = await import('@alkemio/excalidraw');

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
    const sceneVersion = excalidrawUtils.getSceneVersion(whiteboardApi.getSceneElementsIncludingDeleted());

    const currentElementsBBox = getBoundingBox(currentElements);
    const insertedWhiteboardBBox = getBoundingBox(parsedWhiteboard.elements);
    const displacement = calculateInsertionPoint(currentElementsBBox, insertedWhiteboardBBox);

    const replacedIds: Record<string, string> = {};

    const lastElementId = currentElements[currentElements.length - 1].id ?? '^';
    const maxIndex = currentElements.reduce(
      (max, element) => (typeof element['index'] === 'number' ? Math.max(max, element['index']) : max),
      0
    );

    const insertedElements = parsedWhiteboard.elements
      ?.map(generateNewIds(replacedIds))
      .map(replaceElementVersion(sceneVersion + 1))
      .map(replaceIndexes(maxIndex + 1))
      .map(replacePreceedingElementsIds(replacedIds, lastElementId))
      .map(replaceBoundElementsIds(replacedIds))
      .map(displaceElements(displacement));

    const newElements = [...currentElements, ...insertedElements];
    whiteboardApi.updateScene({
      elements: newElements,
      commitToHistory: true,
    });
    whiteboardApi.zoomToFit();
    return true;
  } catch (err) {
    throw new WhiteboardMergeError(`Unable to merge whiteboards: ${err}`);
  }
};

export default mergeWhiteboard;
