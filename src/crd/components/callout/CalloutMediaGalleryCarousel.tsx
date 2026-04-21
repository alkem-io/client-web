import { Download, ImagePlus, Maximize2, Minimize2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  name?: string;
};

type CalloutMediaGalleryCarouselProps = {
  items: CalloutMediaGalleryCarouselItem[];
  initialIndex?: number;
  canEdit?: boolean;
  onAddImages?: () => void;
  onDownload?: (item: CalloutMediaGalleryCarouselItem) => void;
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

    setTweenFactor(api);
    tweenOpacity(api);
    api
      .on('reInit', emblaApi => {
        setTweenFactor(emblaApi);
        tweenOpacity(emblaApi);
      })
      .on('scroll', emblaApi => tweenOpacity(emblaApi, 'scroll'))
      .on('slideFocus', tweenOpacity);

    return () => {
      api.off('reInit', tweenOpacity).off('scroll', tweenOpacity).off('slideFocus', tweenOpacity);
    };
  }, [api]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const fullscreenSupported =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled ??
      (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ??
      false);

  const handleToggleFullscreen = useCallback(() => {
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
  }, []);

  // Document-level arrow-key handling: so arrow keys work regardless of focus
  // inside the callout detail dialog. Scoped to presence of multiple images.
  useEffect(() => {
    if (!api || items.length < 2) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore when focus is inside an editable control (e.g. comment input).
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
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [api, items.length, fullscreenSupported, handleToggleFullscreen]);

  const handleDownload = (item: CalloutMediaGalleryCarouselItem) => {
    if (onDownload) {
      onDownload(item);
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = item.uri;
    anchor.download = item.name ?? '';
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
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
    <div
      ref={rootRef}
      className={cn(
        'relative rounded-lg overflow-hidden border border-border bg-muted/30 select-none',
        isFullscreen && 'bg-black border-none rounded-none flex flex-col',
        className
      )}
    >
      {/* Top-right action bar */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-sm opacity-90 hover:opacity-100"
          aria-label={t('mediaGallery.download')}
          onClick={() => currentItem && handleDownload(currentItem)}
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
        opts={{ loop: false, startIndex: initialIndex, align: 'center', containScroll: 'trimSnaps' }}
      >
        <CarouselContent className={cn('-ml-4', isFullscreen && 'h-full')}>
          {items.map(item => (
            <CarouselItem
              key={item.id}
              className={cn('flex items-center justify-center pl-4 basis-[88%] md:basis-[82%]')}
            >
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
          aria-label={t('mediaGallery.goToImage', { index: '' })}
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
              <img src={item.uri} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
