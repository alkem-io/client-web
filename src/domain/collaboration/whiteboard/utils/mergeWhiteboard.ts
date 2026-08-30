// The snapshot codec comes from the roughjs/UI-free `/headless` entry so importing this
// module never pulls the full editor bundle (keeps unit tests + non-editor callers light).
// `hashElementsVersion`/`CaptureUpdateAction` are not in `/headless`, so they load lazily
// from the full package below — only when a merge actually runs (the editor is mounted).

import type {
  CaptureUpdateAction as ExcalidrawCaptureUpdateAction,
  hashElementsVersion as ExcalidrawHashElementsVersion,
} from '@excalidraw-yjs/excalidraw/element/index';
import type {
  ExcalidrawElement,
  ExcalidrawImageElement,
  FileId,
  FixedPointBinding,
} from '@excalidraw-yjs/excalidraw/element/types';
import { decodeSnapshot, encodeSnapshot, type WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import type { AssetAdapter, BinaryFileData, ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import { v4 as uuidv4 } from 'uuid';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const ANIMATION_SPEED = 2000;
const ANIMATION_ZOOM_FACTOR = 0.75;

type ExcalidrawElementWithRelationships = ExcalidrawElement & {
  containerId?: string | null;
  frameId?: string | null;
  groupIds?: readonly string[];
  startBinding?: FixedPointBinding | null;
  endBinding?: FixedPointBinding | null;
};
type ExcalidrawUtils = {
  CaptureUpdateAction: typeof ExcalidrawCaptureUpdateAction;
  hashElementsVersion: typeof ExcalidrawHashElementsVersion;
};

class WhiteboardMergeError extends Error {}

const abortable = <T>(signal: AbortSignal | undefined, operation: Promise<T>): Promise<T> => {
  if (!signal) return operation;
  if (signal.aborted) return Promise.reject(new WhiteboardMergeError('Whiteboard template import cancelled'));
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new WhiteboardMergeError('Whiteboard template import cancelled'));
    signal.addEventListener('abort', abort, { once: true });
    operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
};

interface WhiteboardLike {
  elements: ExcalidrawElement[];
  assets: Record<string, string>;
}

const isWhiteboardLike = (parsedObject: unknown): parsedObject is WhiteboardLike => {
  if (!parsedObject) {
    return false;
  }

  const whiteboard = parsedObject as Record<string, unknown>;
  return (
    Array.isArray(whiteboard.elements) &&
    whiteboard.elements.length > 0 &&
    typeof whiteboard.assets === 'object' &&
    whiteboard.assets !== null &&
    !Array.isArray(whiteboard.assets)
  );
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
const generateNewIds = (idsMap: Record<string, string>) => (element: ExcalidrawElement) => {
  const id = uuidv4();
  idsMap[element.id] = id;
  return { ...element, id };
};

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
const replaceRelationshipIds = (idsMap: Record<string, string>, groupIdsMap: Record<string, string>) => {
  const replace = (id: string | null) => (id ? idsMap[id] || id : id);
  const replaceMultiple = (boundElements: ExcalidrawElement['boundElements']) =>
    boundElements
      ? boundElements.map(boundElement => ({ ...boundElement, id: idsMap[boundElement.id] || boundElement.id }))
      : boundElements;

  return (element: ExcalidrawElement) => {
    const related = element as ExcalidrawElementWithRelationships;
    const replaceBinding = (binding: FixedPointBinding | null | undefined) =>
      binding ? { ...binding, elementId: replace(binding.elementId) as string } : binding;
    return {
      ...element,
      containerId: replace(related.containerId ?? null),
      frameId: replace(related.frameId ?? null),
      groupIds: related.groupIds?.map(groupId => {
        const remappedId = groupIdsMap[groupId] ?? uuidv4();
        groupIdsMap[groupId] = remappedId;
        return remappedId;
      }),
      startBinding: replaceBinding(related.startBinding),
      endBinding: replaceBinding(related.endBinding),
      boundElements: replaceMultiple(element.boundElements),
    } as unknown as ExcalidrawElement;
  };
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
  whiteboardSnapshot: WhiteboardSnapshot,
  assetAdapter: AssetAdapter,
  options: { signal?: AbortSignal; targetLeaseValid?: () => boolean } = {}
) => {
  const assertActive = () => {
    if (options.signal?.aborted || options.targetLeaseValid?.() === false) {
      throw new WhiteboardMergeError('Whiteboard editor changed while importing template');
    }
  };

  const { hashElementsVersion, CaptureUpdateAction } = await abortable(
    options.signal,
    lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@excalidraw-yjs/excalidraw'))
  );
  assertActive();

  // Normalize the template through the native snapshot round-trip: encode the
  // loaded template scene into a throwaway Yjs doc and decode it straight back.
  // This routes the template through the single content representation (the doc
  // re-orders by fractional index and strips per-peer reconciliation metadata)
  // and keeps no raw JSON scene as state — only the materialized elements are
  // merged into the live scene below (the editor's own Scene.doc captures the
  // merge via updateScene).
  const templateScene = decodeSnapshot(encodeSnapshot(whiteboardSnapshot));

  if (!isWhiteboardLike(templateScene)) {
    throw new WhiteboardMergeError('Whiteboard verification failed');
  }

  // Snapshot tombstones are synchronization history, not template content. Import
  // only live elements so deleted outliers cannot affect placement or reappear.
  const templateElements = (templateScene.elements as unknown as ExcalidrawElement[]).filter(
    element => !element.isDeleted
  );
  if (templateElements.length === 0) {
    throw new WhiteboardMergeError('Template has no visible elements');
  }
  // Template images are opaque locators pointing at the TEMPLATE's storage bucket,
  // never bytes. Resolve them to unpublished bytes, then let the target editor's
  // ordinary asset path commit target-owned locators before inserting elements.
  const templateAssets = templateScene.assets as Readonly<Record<string, string>>;

  try {
    const liveImageElements = templateElements.filter(
      (element): element is ExcalidrawImageElement => element.type === 'image' && !element.isDeleted
    );
    const imagesWithoutFileId = liveImageElements.filter(element => !element.fileId).map(element => element.id);
    if (imagesWithoutFileId.length > 0) {
      throw new WhiteboardMergeError(`Template image elements have no file id: ${imagesWithoutFileId.join(', ')}`);
    }
    const liveImageFileIds = [
      ...new Set(
        liveImageElements.map(element => element.fileId).filter((fileId): fileId is FileId => Boolean(fileId))
      ),
    ];
    const missingSourceLocators = liveImageFileIds.filter(fileId => !templateAssets[fileId]?.trim());
    if (missingSourceLocators.length > 0) {
      throw new WhiteboardMergeError(`Template images have no source locator: ${missingSourceLocators.join(', ')}`);
    }

    // Resolve every referenced source locator before touching the target. The
    // source locator is deliberately discarded: addFiles receives only bytes,
    // and the target's ordinary save owner publishes target-owned locators.
    let resolvedFiles: BinaryFileData[];
    try {
      resolvedFiles = await abortable(
        options.signal,
        Promise.all(liveImageFileIds.map(fileId => assetAdapter.resolve(fileId, templateAssets[fileId])))
      );
    } catch (err) {
      if (err instanceof WhiteboardMergeError) throw err;
      throw new WhiteboardMergeError(`Unable to resolve template images: ${err}`);
    }

    // Target publication is deliberately completed before inserting image elements.
    // Unlike ordinary paste, template import is already asynchronous, so it need not
    // create a checkpointable scene that temporarily references unpublished bytes.
    assertActive();
    if (resolvedFiles.length > 0) {
      whiteboardApi.addFiles(resolvedFiles);
      const publication = await abortable(options.signal, whiteboardApi.flushAssetPublication());
      if (publication.failed.length > 0) {
        throw new WhiteboardMergeError(
          `Unable to publish template images: ${publication.failed.map(({ fileId }) => fileId).join(', ')}`
        );
      }
      assertActive();
      const targetLocators = whiteboardApi.getSceneAssetLocators();
      const missingTargetLocators = liveImageFileIds.filter(fileId => !targetLocators[fileId]?.trim());
      if (missingTargetLocators.length > 0) {
        throw new WhiteboardMergeError(
          `Template images have no committed target locator: ${missingTargetLocators.join(', ')}`
        );
      }
    }

    // No await from this lease check through updateScene: either the exact target
    // receives the complete import once, or no template element enters any scene.
    assertActive();
    const currentElements = whiteboardApi.getSceneElementsIncludingDeleted();
    const sceneVersion = hashElementsVersion(currentElements);

    const currentElementsBBox = getBoundingBox(currentElements.filter(element => !element.isDeleted));
    const insertedWhiteboardBBox = getBoundingBox(templateElements);
    const displacement = calculateInsertionPoint(currentElementsBBox, insertedWhiteboardBBox);

    const replacedIds: Record<string, string> = {};
    const replacedGroupIds: Record<string, string> = {};
    // fractional indices does not need overwriting
    const insertedElements = templateElements
      ?.map(generateNewIds(replacedIds))
      .map(replaceElementVersion(sceneVersion + 1))
      .map(replaceRelationshipIds(replacedIds, replacedGroupIds))
      .map(displaceElements(displacement));

    const newElements = [...currentElements, ...insertedElements];
    assertActive();
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
