import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/crd/primitives/hover-card';
import { PresenceIndicator } from './PresenceIndicator';
import type { ChatPresence } from './types';

type UserPresencePopoverProps = {
  displayName: string;
  statusMessage?: string;
  presence?: ChatPresence;
  /** The person's avatar, marked aria-hidden: the trigger names the person itself. */
  children: ReactNode;
};

/**
 * A person's avatar with their availability dot. Hovering, focusing or tapping
 * it shows their status message, or their availability when they set none. The
 * name and the dot are already on screen, so the card repeats neither.
 */
export function UserPresencePopover({ displayName, statusMessage, presence, children }: UserPresencePopoverProps) {
  const { t } = useTranslation('crd-chat');
  const [open, setOpen] = useState(false);

  const known = presence && presence !== 'unknown' ? presence : undefined;
  const text = statusMessage || (known && t(`presence.${known}` as 'presence.online'));

  if (!text) {
    return (
      <span className="relative flex shrink-0">
        {children}
        <PresenceIndicator presence={presence} />
      </span>
    );
  }

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild={true}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {children}
          {/* The card is a hover card, which a keyboard or screen-reader user cannot
              enter, so the button itself carries everything the card says. */}
          <span className="sr-only">{statusMessage ? `${displayName}, ${statusMessage}` : displayName}</span>
          <PresenceIndicator presence={presence} />
        </button>
      </HoverCardTrigger>
      {/* Portalled to body, outside ChatPanel's marker: without its own, a press here
          dismisses a dialog the chat is floating over. */}
      <HoverCardContent
        className="w-auto max-w-60 px-2.5 py-1.5 text-caption text-popover-foreground"
        data-dialog-dismiss-ignore=""
      >
        {text}
      </HoverCardContent>
    </HoverCard>
  );
}
