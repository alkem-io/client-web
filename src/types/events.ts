const CANVAS_LOADED_EVENT_NAME = 'canvas_loaded';
export type CanvasLoadedEvent = { canvasId: string };
interface CustomEventMap {
  [CANVAS_LOADED_EVENT_NAME]: CustomEvent<CanvasLoadedEvent>;
}

declare global {
  interface Window {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void;
  }
}

const addEventListener = window.addEventListener;
const removeEventListener = window.removeEventListener;

export { CANVAS_LOADED_EVENT_NAME, addEventListener, removeEventListener };
