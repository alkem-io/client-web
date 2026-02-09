import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import {
  SlideInfo,
  UseWhiteboardSlidesReturn,
  DEFAULT_SLIDE_WIDTH,
  DEFAULT_SLIDE_HEIGHT,
  SLIDE_VERTICAL_GAP,
} from './types';

/** Thumbnail max dimensions (maintains 16:9 aspect ratio) */
const THUMBNAIL_MAX_WIDTH = 160;
const THUMBNAIL_MAX_HEIGHT = 90;

interface UseWhiteboardSlidesOptions {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  isReadOnly?: boolean;
  isPresentingSlides?: boolean;
}

/**
 * Hook to manage whiteboard slides using Excalidraw frames.
 *
 * Frames are extracted from the scene and sorted by Y position
 * (top-to-bottom = slide order). Provides navigation and slide
 * management functions.
 *
 * @example
 * ```tsx
 * const { slides, currentSlideIndex, goToSlide, addSlide } = useWhiteboardSlides({
 *   excalidrawApi,
 *   isReadOnly: false,
 * });
 * ```
 */
const useWhiteboardSlides = ({
  excalidrawApi,
  isReadOnly = false,
  isPresentingSlides = false,
}: UseWhiteboardSlidesOptions): UseWhiteboardSlidesReturn => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1);
  const [slideRefreshTrigger, setSlideRefreshTrigger] = useState(0);
  const [thumbnailRefreshTrigger, setThumbnailRefreshTrigger] = useState(0);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Extract frames from scene and convert to slides
  const slides = useMemo<SlideInfo[]>(() => {
    if (!excalidrawApi) {
      return [];
    }

    const elements = excalidrawApi.getSceneElements();
    const frames = elements.filter(
      (el): el is typeof el & { type: 'frame'; name: string | null } => el.type === 'frame' && !el.isDeleted
    );

    // Sort by Y position (top to bottom = slide order)
    frames.sort((a, b) => a.y - b.y);

    return frames.map((frame, index) => ({
      id: frame.id,
      name: frame.name ?? null,
      index,
      bounds: {
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
      },
    }));
    // slideRefreshTrigger is used to force re-computation after adding a slide
  }, [excalidrawApi, slideRefreshTrigger]);

  // Generate thumbnails when slides change or content is updated (async to avoid blocking UI)
  useEffect(() => {
    if (!excalidrawApi || slides.length === 0) {
      setThumbnails({});
      return;
    }

    let cancelled = false;

    const generateThumbnails = async () => {
      const { exportToCanvas } = await import('@alkemio/excalidraw');
      const elements = excalidrawApi.getSceneElements();
      const appState = excalidrawApi.getAppState();
      const files = excalidrawApi.getFiles();

      const newThumbnails: Record<string, string> = {};

      for (const slide of slides) {
        if (cancelled) return;

        const frameElement = elements.find(el => el.id === slide.id);
        if (!frameElement) continue;

        try {
          const canvas = await exportToCanvas({
            elements: elements as Parameters<typeof exportToCanvas>[0]['elements'],
            appState: { ...appState, exportBackground: true },
            files,
            exportingFrame: frameElement as Parameters<typeof exportToCanvas>[0]['exportingFrame'],
            getDimensions: (width, height) => {
              const scale = Math.min(THUMBNAIL_MAX_WIDTH / width, THUMBNAIL_MAX_HEIGHT / height, 1);
              return { width: width * scale, height: height * scale, scale };
            },
            exportPadding: 5,
          });
          newThumbnails[slide.id] = canvas.toDataURL('image/png', 0.8);
        } catch {
          // Silently skip failed thumbnails
        }
      }

      if (!cancelled) {
        setThumbnails(newThumbnails);
      }
    };

    generateThumbnails();

    return () => {
      cancelled = true;
    };
  }, [excalidrawApi, slides, thumbnailRefreshTrigger]);

  // Merge thumbnails into slides
  const slidesWithThumbnails = useMemo<SlideInfo[]>(
    () =>
      slides.map(slide => ({
        ...slide,
        thumbnailDataUrl: thumbnails[slide.id],
      })),
    [slides, thumbnails]
  );

  const hasSlides = slidesWithThumbnails.length > 0;
  const canGoNext = currentSlideIndex < slidesWithThumbnails.length - 1;
  const canGoPrevious = currentSlideIndex > 0;

  const goToSlide = useCallback(
    (index: number) => {
      if (!excalidrawApi || index < 0 || index >= slides.length) {
        return;
      }

      const slide = slides[index];
      if (!slide) {
        return;
      }

      // Find the frame element to scroll to
      const elements = excalidrawApi.getSceneElements();
      const frameElement = elements.find(el => el.id === slide.id);

      if (frameElement) {
        // In presentation mode, use fitToViewport to zoom beyond 100% and fill screen
        // In normal mode, use fitToContent which caps zoom at 100%
        const scrollOptions = isPresentingSlides
          ? { fitToViewport: true, viewportZoomFactor: 0.95, animate: true }
          : { fitToContent: true, animate: true };

        excalidrawApi.scrollToContent([frameElement], scrollOptions);
      }

      setCurrentSlideIndex(index);
    },
    [excalidrawApi, slides, isPresentingSlides]
  );

  // Track previous presentation state to detect changes
  const prevIsPresentingRef = useRef(isPresentingSlides);

  // Re-zoom current slide when entering/exiting presentation mode
  // This ensures proper zoom level when presentation state changes
  useEffect(() => {
    // Only re-zoom if presentation mode actually changed
    if (prevIsPresentingRef.current === isPresentingSlides) {
      return;
    }
    prevIsPresentingRef.current = isPresentingSlides;

    if (currentSlideIndex >= 0 && currentSlideIndex < slides.length && excalidrawApi) {
      const slide = slides[currentSlideIndex];
      const elements = excalidrawApi.getSceneElements();
      const frameElement = elements.find(el => el.id === slide.id);

      if (frameElement) {
        const scrollOptions = isPresentingSlides
          ? { fitToViewport: true, viewportZoomFactor: 0.95, animate: true }
          : { fitToContent: true, animate: true };

        excalidrawApi.scrollToContent([frameElement], scrollOptions);
      }
    }
  }, [isPresentingSlides, excalidrawApi, slides, currentSlideIndex]);

  const nextSlide = useCallback(() => {
    if (canGoNext) {
      goToSlide(currentSlideIndex + 1);
    }
  }, [canGoNext, currentSlideIndex, goToSlide]);

  const previousSlide = useCallback(() => {
    if (canGoPrevious) {
      goToSlide(currentSlideIndex - 1);
    }
  }, [canGoPrevious, currentSlideIndex, goToSlide]);

  const addSlide = useCallback(async () => {
    if (!excalidrawApi || isReadOnly) {
      return;
    }

    const { convertToExcalidrawElements } = await import('@alkemio/excalidraw');

    // Calculate position for new frame (below last slide or at origin)
    const lastSlide = slides[slides.length - 1];
    const y = lastSlide ? lastSlide.bounds.y + lastSlide.bounds.height + SLIDE_VERTICAL_GAP : 0;
    const x = lastSlide ? lastSlide.bounds.x : 0;

    const frameSkeleton = {
      type: 'frame' as const,
      x,
      y,
      width: DEFAULT_SLIDE_WIDTH,
      height: DEFAULT_SLIDE_HEIGHT,
      name: `Slide ${slides.length + 1}`,
      children: [],
    };

    const [frame] = convertToExcalidrawElements([frameSkeleton]);

    if (frame) {
      const currentElements = excalidrawApi.getSceneElements();
      excalidrawApi.updateScene({
        elements: [...currentElements, frame],
      });

      // Trigger refresh to pick up the new slide
      setSlideRefreshTrigger(prev => prev + 1);

      // Navigate to the new slide after a brief delay to let the scene update
      setTimeout(() => {
        excalidrawApi.scrollToContent([frame], {
          fitToContent: true,
          animate: true,
        });
        setCurrentSlideIndex(slides.length);
      }, 50);
    }
  }, [excalidrawApi, isReadOnly, slides]);

  return {
    slides: slidesWithThumbnails,
    currentSlideIndex,
    goToSlide,
    nextSlide,
    previousSlide,
    addSlide,
    refreshSlides: () => setSlideRefreshTrigger(prev => prev + 1),
    refreshThumbnails: () => setThumbnailRefreshTrigger(prev => prev + 1),
    hasSlides,
    canGoNext,
    canGoPrevious,
  };
};

export default useWhiteboardSlides;
