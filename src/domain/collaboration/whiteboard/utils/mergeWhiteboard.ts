// The snapshot codec comes from the roughjs/UI-free `/headless` entry so importing this
// module never pulls the full editor bundle (keeps unit tests + non-editor callers light).
// `hashElementsVersion`/`CaptureUpdateAction` are not in `/headless`, so they load lazily
// from the full package below — only when a merge actually runs (the editor is mounted).

import type {
  CaptureUpdateAction as ExcalidrawCaptureUpdateAction,
  hashElementsVersion as ExcalidrawHashElementsVersion,
} from '@excalidraw-yjs/excalidraw/element/index';
import type { ExcalidrawElement, FileId } from '@excalidraw-yjs/excalidraw/element/types';
import { decodeSnapshot, encodeSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import type { AssetAdapter, BinaryFileData, ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import { v4 as uuidv4 } from 'uuid';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { parseWhiteboardContentToScene } from '@/domain/common/whiteboard/excalidraw/whiteboardContent';

const ANIMATION_SPEED = 2000;
const ANIMATION_ZOOM_FACTOR = 0.75;

type ExcalidrawElementWithContainerId = ExcalidrawElement & { containerId: string | null };
type ExcalidrawUtils = {
  CaptureUpdateAction: typeof ExcalidrawCaptureUpdateAction;
  hashElementsVersion: typeof ExcalidrawHashElementsVersion;
};

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
  if (whiteboard.type !== 'excalidraw' || whiteboard.version !== 2) {
    return false;
  }
  if (!whiteboard.elements || !Array.isArray(whiteboard.elements)) {
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
 * Returns a function that can be passed to elements.map to replace containerId and boundElements ids
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
 * Returns a function that can be passed to elements.map, to displace elements by a given displacement
 */
const displaceElements = (displacement: { x: number; y: number }) => (element: ExcalidrawElement) => ({
  ...element,
  x: element.x + displacement.x,
  y: element.y + displacement.y,
});

const mergeWhiteboard = async (
  whiteboardApi: ExcalidrawImperativeAPI,
  whiteboardContent: string,
  assetAdapter: AssetAdapter
) => {
  const { hashElementsVersion, CaptureUpdateAction } = await lazyImportWithErrorHandler<ExcalidrawUtils>(
    () => import('@excalidraw-yjs/excalidraw')
  );

  // Normalize the template through the native snapshot round-trip: encode the
  // parsed template scene into a throwaway Yjs doc and decode it straight back.
  // This routes the template through the single content representation (the doc
  // re-orders by fractional index and strips per-peer reconciliation metadata)
  // and keeps no raw JSON scene as state — only the materialized elements are
  // merged into the live scene below (the editor's own Scene.doc captures the
  // merge via updateScene).
  const templateScene = decodeSnapshot(encodeSnapshot(parseWhiteboardContentToScene(whiteboardContent)));

  if (!isWhiteboardLike({ type: 'excalidraw', version: 2, ...templateScene })) {
    throw new WhiteboardMergeError('Whiteboard verification failed');
  }

  const templateElements = templateScene.elements as unknown as ExcalidrawElement[];
  // Template images are opaque locators pointing at the TEMPLATE's storage bucket,
  // never bytes. They must be re-homed into THIS whiteboard's bucket before the
  // elements referencing them are inserted (see the asset-copy steps below).
  const templateAssets = templateScene.assets as Readonly<Record<string, string>>;

  try {
    // 1. Partition the template's images. Readiness is defined ONLY by a committed
    //    target locator — local cache bytes without a durable locator are NOT
    //    persisted, so a prior merge that cached bytes but failed to publish must
    //    still be retried. `unresolvedLocatorIds` = every template image lacking a
    //    target locator; of those, only the ones whose bytes we don't already have
    //    cached need a fresh source resolve.
    const currentFiles = whiteboardApi.getFiles();
    const currentLocators = whiteboardApi.getSceneAssetLocators();
    const unresolvedLocatorIds = Object.keys(templateAssets).filter(fileId => !currentLocators[fileId]);
    const toResolveIds = unresolvedLocatorIds.filter(fileId => !currentFiles[fileId]);

    // 2. Resolve EVERY still-uncached source locator to bytes BEFORE mutating the
    //    target scene. A single failure aborts the whole merge — zero elements.
    if (toResolveIds.length > 0) {
      let resolvedFiles: BinaryFileData[];
      try {
        resolvedFiles = await Promise.all(
          toResolveIds.map(fileId => assetAdapter.resolve(fileId as FileId, templateAssets[fileId]))
        );
      } catch (err) {
        throw new WhiteboardMergeError(`Unable to resolve template images: ${err}`);
      }
      // 3. Hand the bytes to the editor; it re-publishes them through the SAME
      //    adapter.store into THIS whiteboard's bucket, minting NEW target locators
      //    keyed by the unchanged file ids. Never reuse the source locator or
      //    upload directly.
      whiteboardApi.addFiles(resolvedFiles);
    }

    // 4. Whenever any image lacks a target locator (freshly resolved OR cached from
    //    a prior failed merge), block on the publish flush and REQUIRE a committed
    //    locator for each before inserting anything. A failed store, or a flush that
    //    reports success yet leaves no locator (replaced/unmounted mid-merge), aborts
    //    with zero elements. A remote-won skip is a success — its locator is present.
    if (unresolvedLocatorIds.length > 0) {
      const report = await whiteboardApi.flushAssetPublication();
      if (report.failed.length > 0) {
        throw new WhiteboardMergeError(`Template image publish failed: ${report.failed.map(f => f.fileId).join(', ')}`);
      }
      const locatorsAfterPublish = whiteboardApi.getSceneAssetLocators();
      const unpublished = unresolvedLocatorIds.filter(fileId => !locatorsAfterPublish[fileId]);
      if (unpublished.length > 0) {
        throw new WhiteboardMergeError(`Template images have no committed target locator: ${unpublished.join(', ')}`);
      }
    }

    // 5. Only now that every referenced image has a committed target locator,
    //    insert the re-id'd + displaced template elements.
    const currentElements = whiteboardApi.getSceneElementsIncludingDeleted();
    const sceneVersion = hashElementsVersion(currentElements);

    const currentElementsBBox = getBoundingBox(currentElements);
    const insertedWhiteboardBBox = getBoundingBox(templateElements);
    const displacement = calculateInsertionPoint(currentElementsBBox, insertedWhiteboardBBox);

    const replacedIds: Record<string, string> = {};
    // fractional indices does not need overwriting
    const insertedElements = templateElements
      ?.map(generateNewIds(replacedIds))
      .map(replaceElementVersion(sceneVersion + 1))
      .map(replaceBoundElementsIds(replacedIds))
      .map(displaceElements(displacement));

    const newElements = [...currentElements, ...insertedElements];
    whiteboardApi.updateScene({
      elements: newElements,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });

    if (insertedElements.length > 0) {
      whiteboardApi.scrollToContent(insertedElements, {
        animate: true,
        fitToViewport: true,
        duration: ANIMATION_SPEED,
        viewportZoomFactor: ANIMATION_ZOOM_FACTOR,
      });
    }

    return true;
  } catch (err) {
    if (err instanceof WhiteboardMergeError) {
      throw err;
    }
    throw new WhiteboardMergeError(`Unable to merge whiteboards: ${err}`);
  }
};

export default mergeWhiteboard;
