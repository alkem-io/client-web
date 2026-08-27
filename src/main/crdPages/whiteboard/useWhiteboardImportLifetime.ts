import { useLayoutEffect, useRef } from 'react';

export type WhiteboardImportToken = {
  signal: AbortSignal;
  isCancelled: () => boolean;
};

/**
 * Bind an in-flight template import to the dialog and whiteboard generation that
 * started it. The layout-effect cleanup runs during unmount / identity changes,
 * before a replacement editor can publish its API.
 */
export const useWhiteboardImportLifetime = (whiteboardId: string | undefined, active: boolean) => {
  const activeControllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);

  useLayoutEffect(() => {
    return () => {
      generationRef.current += 1;
      activeControllerRef.current?.abort();
      activeControllerRef.current = null;
    };
  }, [active, whiteboardId]);

  const beginImport = (): WhiteboardImportToken => {
    activeControllerRef.current?.abort();
    const controller = new AbortController();
    activeControllerRef.current = controller;
    const generation = generationRef.current;

    return {
      signal: controller.signal,
      isCancelled: () => controller.signal.aborted || generationRef.current !== generation,
    };
  };

  const finishImport = (token: WhiteboardImportToken) => {
    if (activeControllerRef.current?.signal === token.signal) {
      activeControllerRef.current = null;
    }
  };

  const cancelActiveImport = () => {
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
  };

  return { beginImport, finishImport, cancelActiveImport };
};
