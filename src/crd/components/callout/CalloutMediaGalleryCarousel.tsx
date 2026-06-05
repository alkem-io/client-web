import { Download, ImagePlus, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/crd/primitives/carousel';

export type CalloutMediaGalleryCarouselItem = {
  id: string;
  uri: string;
  alternativeText?: string;
};

type CalloutMediaGalleryCarouselProps = {
  items: CalloutMediaGalleryCarouselItem[];
  initialIndex?: number;
  canEdit?: boolean;
  onAddImages?: () => void;
  onDownload: (item: CalloutMediaGalleryCarouselItem) => void;
  className?: string;
};

// Controls opacity falloff on neighbouring slides (mirrors Embla's "opacity" example).
// Higher = faster fade. Multiplied by scrollSnap count so it scales with gallery size.
const TWEEN_FACTOR_BASE = 0.52;

export function CalloutMediaGalleryCarousel({
  items,
  initialIndex = 0,
  canEdit = false,
  onAddImages,
  onDownload,
  className,
}: CalloutMediaGalleryCarouselProps) {
  const { t } = useTranslation('crd-space');
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tweenFactor = useRef(0);

  useEffect(() => {
    if (!api) return;
    if (initialIndex > 0) api.scrollTo(initialIndex, true);
    setCurrentIndex(api.selectedScrollSnap());
    const handleSelect = () => setCurrentIndex(api.selectedScrollSnap());
    api.on('select', handleSelect);
    api.on('reInit', handleSelect);
    return () => {
      api.off('select', handleSelect);
      api.off('reInit', handleSelect);
    };
  }, [api, initialIndex]);

  // Embla "opacity" example — neighbouring slides fade based on scroll distance.
  // See https://www.embla-carousel.com/docs/examples/predefined (opacity example).
  useEffect(() => {
    if (!api) return;

    const setTweenFactor = (emblaApi: NonNullable<CarouselApi>) => {
      tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
    };

    const tweenOpacity = (emblaApi: NonNullable<CarouselApi>, eventName?: string) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === 'scroll';

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        const diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach(slideIndex => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;
          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const opacity = Math.max(Math.min(tweenValue, 1), 0).toString();
          const slideNode = emblaApi.slideNodes()[slideIndex];
          if (slideNode) slideNode.style.opacity = opacity;
        });
      });
    };

    // Named handlers so `off()` can detach the exact reference we attached.
    const handleReInit = (emblaApi: NonNullable<CarouselApi>) => {
      setTweenFactor(emblaApi);
      tweenOpacity(emblaApi);
    };
    const handleScroll = (emblaApi: NonNullable<CarouselApi>) => tweenOpacity(emblaApi, 'scroll');

    setTweenFactor(api);
    tweenOpacity(api);
    api.on('reInit', handleReInit).on('scroll', handleScroll).on('slideFocus', tweenOpacity);

    return () => {
      api.off('reInit', handleReInit).off('scroll', handleScroll).off('slideFocus', tweenOpacity);
    };
  }, [api]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Dialog-wide arrow navigation. When the gallery lives inside a dialog, focus easily
  // leaves it — clicking the dialog scrollbar or body drops focus onto the Radix
  // DialogContent — and the focus-scoped handlers below stop receiving arrow keys. So we
  // also listen on the nearest [role="dialog"] ancestor and let ←/→ navigate from anywhere
  // in the dialog. Three guards keep this safe:
  //   • Only when there IS a dialog ancestor. Inline (e.g. the feed) several galleries can
  //     share a page, so we attach nothing and rely on the local focus-scoped handler.
  //   • Skip when focus is inside the gallery itself — those keys are already handled by
  //     handleRootKeyDown / the carousel primitive, so this avoids double-navigation.
  //   • Skip while the user is typing (the comments <textarea>, any input/select/editable).
  useEffect(() => {
    if (!api) return;
    const root = rootRef.current;
    const dialog = root?.closest('[role="dialog"]') as HTMLElement | null;
    if (!root || !dialog) return;

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const target = event.target as HTMLElement | null;
      if (!target || root.contains(target)) return;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }
      event.preventDefault();
      if (event.key === 'ArrowLeft') {
        api.scrollPrev();
      } else {
        api.scrollNext();
      }
    };

    dialog.addEventListener('keydown', handleDialogKeyDown);
    return () => dialog.removeEventListener('keydown', handleDialogKeyDown);
  }, [api]);

  const fullscreenSupported =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled ||
      (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
      false);

  const handleToggleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      const request =
        el.requestFullscreen ??
        (el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen;
      void request?.call(el);
    }
  };

  // Keyboard handling for when focus is anywhere INSIDE the gallery. The Carousel primitive
  // handles Arrow keys via onKeyDownCapture, but only while focus sits on a descendant of
  // its inner region (e.g. a nav button). Focus can also land on a thumbnail button outside
  // the carousel region, where the primitive's handler never fires. This wrapper contains
  // the whole gallery, so re-handling Arrow keys here (bubble phase) makes back/forth work
  // wherever focus sits within it. The defaultPrevented guard skips keys the primitive
  // already consumed. (When focus has left the gallery entirely but is still in a host
  // dialog, the dialog-wide effect above takes over — Home/End/F stay gallery-local.)
  //
  // We deliberately do NOT steal focus onto this wrapper on click: doing so stopped
  // ArrowUp/ArrowDown from scrolling the host dialog. Left/right work without focusing the
  // gallery because the dialog-wide listener catches them from anywhere in the dialog.
  const handleRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !api) return;
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      api.scrollPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      api.scrollNext();
    } else if (event.key === 'Home') {
      event.preventDefault();
      api.scrollTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      api.scrollTo(items.length - 1);
    } else if ((event.key === 'f' || event.key === 'F') && fullscreenSupported) {
      event.preventDefault();
      handleToggleFullscreen();
    }
  };

  if (items.length === 0) {
    if (!canEdit) return null;
    return (
      <button
        type="button"
        className={cn(
          'w-full aspect-video rounded-lg border-2 border-dashed border-border bg-muted/20 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        onClick={onAddImages}
      >
        <ImagePlus className="size-8 text-muted-foreground/60" aria-hidden="true" />
        <span className="text-body-emphasis">{t('mediaGallery.emptyState.title')}</span>
        <span className="text-caption">{t('mediaGallery.emptyState.action')}</span>
      </button>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className={cn('space-y-2', className)}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: WAI-ARIA Carousel pattern requires role="region" on a generic container (already set by the <Carousel> primitive inside). This outer wrapper hosts Home/End/F keyboard shortcuts; making it a button/link would break the landmark semantics. */}
      <div
        ref={rootRef}
        className={cn(
          'relative rounded-lg overflow-hidden border border-border bg-muted/30 select-none focus:outline-none',
          isFullscreen && 'bg-black border-none rounded-none flex flex-col'
        )}
        tabIndex={-1}
        onKeyDown={handleRootKeyDown}
      >
        {/* Top-right action bar — download + fullscreen only. The "Add images"
          control lives below the gallery so it doesn't sit on top of the image. */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-sm opacity-90 hover:opacity-100"
            aria-label={t('mediaGallery.download')}
            onClick={() => {
              if (currentItem) onDownload(currentItem);
            }}
          >
            <Download className="size-4" aria-hidden="true" />
          </Button>
          {fullscreenSupported && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 shadow-sm opacity-90 hover:opacity-100"
              aria-label={isFullscreen ? t('mediaGallery.exitFullscreen') : t('mediaGallery.fullscreen')}
              onClick={handleToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="size-4" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>

        <Carousel
          className={cn('w-full', isFullscreen && 'flex-1 min-h-0')}
          setApi={setApi}
          opts={{
            loop: true,
            startIndex: initialIndex,
            align: 'center',
            containScroll: 'trimSnaps',
          }}
        >
          <CarouselContent className={cn('-ml-4', isFullscreen && 'h-full')}>
            {items.map(item => (
              <CarouselItem key={item.id} className={cn('flex items-center justify-center pl-4 basis-[100%]')}>
                <img
                  src={item.uri}
                  alt={item.alternativeText ?? ''}
                  draggable={false}
                  className={cn(
                    'block mx-auto object-contain rounded-md pointer-events-none',
                    isFullscreen ? 'max-h-[calc(100vh-8rem)] max-w-full' : 'max-h-[60vh] max-w-full'
                  )}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {items.length > 1 && (
            <>
              <CarouselPrevious aria-label={t('mediaGallery.previous')} />
              <CarouselNext aria-label={t('mediaGallery.next')} />
            </>
          )}
        </Carousel>

        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2 overflow-x-auto border-t border-border',
              isFullscreen ? 'bg-black/50' : 'bg-background/60'
            )}
            role="tablist"
            aria-label={t('mediaGallery.thumbnailsLabel')}
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={t('mediaGallery.goToImage', { index: index + 1 })}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'shrink-0 size-14 rounded-md overflow-hidden border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary opacity-100'
                    : 'border-border opacity-60 hover:opacity-100'
                )}
              >
                <img
                  src={item.uri}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Add-images affordance — sits below the gallery (MUI parity) so it doesn't
          obscure the image. Hidden in fullscreen where the gallery owns the viewport. */}
      {canEdit && onAddImages && !isFullscreen && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={onAddImages}>
            <ImagePlus className="size-4" aria-hidden="true" />
            {t('mediaGallery.emptyState.action')}
          </Button>
        </div>
      )}
    </div>
  );
}
