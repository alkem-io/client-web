/**
 * @fileoverview Type definitions for whiteboard slides/presentation mode
 *
 * Uses Excalidraw's native `frame` elements as slides.
 * Frames are sorted by Y position (top-to-bottom = slide order).
 */

export type WhiteboardMode = 'whiteboard' | 'slides';

export interface SlideBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlideInfo {
  /** Frame element ID */
  id: string;
  /** Frame name (optional, set by user) */
  name: string | null;
  /** Order index (0-based, sorted by Y position) */
  index: number;
  /** Frame bounding box */
  bounds: SlideBounds;
  /** Base64 data URL of frame preview thumbnail */
  thumbnailDataUrl?: string;
}

export interface UseWhiteboardSlidesReturn {
  /** List of slides extracted from frames */
  slides: SlideInfo[];
  /** Currently active slide index (-1 if none) */
  currentSlideIndex: number;
  /** Navigate to a specific slide by index */
  goToSlide: (index: number) => void;
  /** Navigate to the next slide */
  nextSlide: () => void;
  /** Navigate to the previous slide */
  previousSlide: () => void;
  /** Add a new slide (frame) to the canvas */
  addSlide: () => Promise<void>;
  /** Refresh the slides list (call when scene elements change externally) */
  refreshSlides: () => void;
  /** Refresh slide thumbnails (call when frame content changes) */
  refreshThumbnails: () => void;
  /** Whether there are any slides */
  hasSlides: boolean;
  /** Whether navigation to next slide is possible */
  canGoNext: boolean;
  /** Whether navigation to previous slide is possible */
  canGoPrevious: boolean;
}

/** Default frame dimensions for new slides (16:9 aspect ratio) */
export const DEFAULT_SLIDE_WIDTH = 1920;
export const DEFAULT_SLIDE_HEIGHT = 1080;

/** Vertical gap between slides when adding new ones */
export const SLIDE_VERTICAL_GAP = 100;
