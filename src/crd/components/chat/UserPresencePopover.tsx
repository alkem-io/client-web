import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/crd/primitives/hover-card';
import { PresenceIndicator } from './PresenceIndicator';
import type { ChatPresence } from './types';

type UserPresencePopoverProps = {
  displayName: string;
  tagline?: string;
  presence?: ChatPresence;
  /** The person's avatar, marked aria-hidden: the trigger names the person itself. */
  children: ReactNode;
};

/**
 * A person's avatar with their availability dot. Hovering or focusing it opens
 * a card with their name, tagline and availability; a tap opens it too, since
 * touch has no hover.
 */
export function UserPresencePopover({ displayName, tagline, presence, children }: UserPresencePopoverProps) {
  const { t } = useTranslation('crd-chat');
  const [open, setOpen] = useState(false);

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild={true}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {children}
          <span className="sr-only">{displayName}</span>
          <PresenceIndicator presence={presence} />
        </button>
      </HoverCardTrigger>
      {/* Portalled to body, outside ChatPanel's marker: without its own, a press here
          dismisses a dialog the chat is floating over. */}
      <HoverCardContent className="w-60 p-3" data-dialog-dismiss-ignore="">
        <p className="truncate text-body-emphasis text-foreground">{displayName}</p>
        {tagline && <p className="text-caption text-muted-foreground">{tagline}</p>}
        {presence && presence !== 'unknown' && (
          <p className="mt-1 text-caption text-muted-foreground">{t(`presence.${presence}` as 'presence.online')}</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
