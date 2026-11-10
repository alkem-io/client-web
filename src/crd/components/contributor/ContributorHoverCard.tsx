import { Slot } from '@radix-ui/react-slot';
import { MessageCircle } from 'lucide-react';
import { type ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContributorCardData } from '@/crd/components/callout/ContributorCollection/ContributorCard';
import { PreviewDetails, PreviewHead } from '@/crd/components/contributor/ContributorPreviewParts';
import { ContributorPreviewSheet } from '@/crd/components/contributor/ContributorPreviewSheet';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/crd/primitives/hover-card';
import { IconButton } from '@/crd/primitives/icon-button';

export type ContributorPreviewData = Pick<
  ContributorCardData,
  'id' | 'type' | 'name' | 'avatarUrl' | 'href' | 'locationLabel' | 'tagline' | 'tags' | 'canMessage'
> & {
  /** The previewed contributor is the viewer. */
  self?: boolean;
};

type ContributorHoverCardProps = {
  contributor: ContributorPreviewData;
  onMessage?: (contributor: ContributorPreviewData) => void;
  /** The existing profile link; it becomes the hover-card trigger. */
  children: ReactElement;
};

/** A primary input that cannot hover (a finger) gets the bottom sheet; a mouse or trackpad gets the hover card. */
const TOUCH_INPUT = '(hover: none) and (pointer: coarse)';

export function ContributorHoverCard({ contributor, onMessage, children }: ContributorHoverCardProps) {
  const { t } = useTranslation('crd-space');
  const touch = useMediaQuery(TOUCH_INPUT);
  const showMessage = contributor.canMessage && onMessage;
  const [open, setOpen] = useState(false);
  const linkRef = useRef<HTMLElement>(null);

  if (touch) {
    return (
      <>
        <Slot
          ref={linkRef}
          aria-haspopup="dialog"
          onClick={event => {
            // A tap previews instead of navigating; the sheet's View profile goes on.
            event.preventDefault();
            setOpen(true);
          }}
        >
          {children}
        </Slot>
        <ContributorPreviewSheet
          contributor={contributor}
          open={open}
          onOpenChange={setOpen}
          onMessage={onMessage}
          onCloseAutoFocus={event => {
            // The link is not a Radix trigger, so Radix has nowhere to return focus on its own.
            event.preventDefault();
            linkRef.current?.focus();
          }}
        />
      </>
    );
  }

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild={true}>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72 p-4">
        <div className="flex items-start gap-3">
          <PreviewHead
            contributor={contributor}
            avatarClassName="size-12"
            className="min-w-0 flex-1"
            name={
              contributor.href ? (
                <a
                  href={contributor.href}
                  className="block truncate text-card-title text-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {contributor.name}
                </a>
              ) : (
                <span className="block truncate text-card-title text-foreground">{contributor.name}</span>
              )
            }
          />
          {showMessage && (
            <IconButton
              variant="ghost"
              tooltipLabel={t('contributors.card.message')}
              className="h-8 w-8 shrink-0 text-muted-foreground"
              onClick={() => {
                // The chat panel opens where the card would otherwise sit on top of it.
                setOpen(false);
                onMessage(contributor);
              }}
            >
              <MessageCircle aria-hidden="true" />
            </IconButton>
          )}
        </div>
        <PreviewDetails contributor={contributor} taglineClassName="line-clamp-2" tagRows={1} />
      </HoverCardContent>
    </HoverCard>
  );
}
