import { MessageCircle } from 'lucide-react';
import { type PointerEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContributorPreviewData } from '@/crd/components/contributor/ContributorHoverCard';
import { PreviewDetails, PreviewHead } from '@/crd/components/contributor/ContributorPreviewParts';
import { Button } from '@/crd/primitives/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/crd/primitives/sheet';

/** How far the sheet must be dragged down before letting go closes it. */
const DRAG_CLOSE_PX = 80;

type ContributorPreviewSheetProps = {
  contributor: ContributorPreviewData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessage?: (contributor: ContributorPreviewData) => void;
  /** Where focus goes once the sheet has closed. */
  onCloseAutoFocus?: (event: Event) => void;
};

/** The touch-screen counterpart of the hover card: a bottom sheet with the same content plus actions. */
export function ContributorPreviewSheet({
  contributor,
  open,
  onOpenChange,
  onMessage,
  onCloseAutoFocus,
}: ContributorPreviewSheetProps) {
  const { t } = useTranslation('crd-space');
  const [drag, setDrag] = useState<{ startY: number; offset: number }>();
  const showMessage = contributor.canMessage && onMessage;

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ startY: event.clientY, offset: 0 });
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag) setDrag({ ...drag, offset: Math.max(0, event.clientY - drag.startY) });
  };
  const endDrag = () => {
    if (drag && drag.offset > DRAG_CLOSE_PX) onOpenChange(false);
    setDrag(undefined);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        closeLabel={t('contributors.preview.close')}
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-h-[70vh] gap-0 rounded-t-2xl px-5 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))] touch-none data-[state=closed]:duration-200 data-[state=open]:duration-250 motion-reduce:animate-none"
        // The drag offset follows the finger, so it can only be an inline value.
        style={drag?.offset ? { transform: `translateY(${drag.offset}px)` } : undefined}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={() => setDrag(undefined)}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" aria-hidden="true" />
        <PreviewHead
          contributor={contributor}
          avatarClassName="size-14"
          className="pr-6"
          name={<SheetTitle className="line-clamp-2 text-subsection-title">{contributor.name}</SheetTitle>}
        />
        <SheetDescription className="sr-only">{t('contributors.preview.description')}</SheetDescription>
        <PreviewDetails contributor={contributor} taglineClassName="line-clamp-3 text-foreground" tagRows={2} />
        <div className="mt-5 flex gap-2">
          {contributor.href && (
            <Button asChild={true} className="h-12 flex-1">
              <a href={contributor.href} onClick={() => onOpenChange(false)}>
                {t(contributor.self ? 'contributors.preview.viewOwnProfile' : 'contributors.card.viewProfile')}
              </a>
            </Button>
          )}
          {showMessage && (
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => {
                onOpenChange(false);
                onMessage(contributor);
              }}
            >
              <MessageCircle aria-hidden="true" />
              {t('contributors.card.message')}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
