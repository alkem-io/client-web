import { MessageCircle, PhoneCall, X } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type FloatingChatLauncherProps = {
  unreadCount?: number;
  isOpen: boolean;
  hidden?: boolean;
  onClick: () => void;
  openLabel: string;
  closeLabel: string;
  /** Screen-reader description of the unread badge. */
  unreadLabel: string;
  /** Someone is calling (e.g. "Maria is calling you"): the closed launcher turns into a ringing phone named after it. */
  incomingCallLabel?: string;
};

/**
 * The single floating entry point to the unified chat. A circular button fixed
 * to the bottom-right, with an unread-count badge overlay when the panel is closed.
 * While someone is calling, the closed launcher is a ringing phone instead.
 */
export function FloatingChatLauncher({
  unreadCount = 0,
  isOpen,
  hidden,
  onClick,
  openLabel,
  closeLabel,
  unreadLabel,
  incomingCallLabel,
}: FloatingChatLauncherProps) {
  if (hidden) {
    return null;
  }

  const showBadge = !isOpen && unreadCount > 0;
  const ringing = !isOpen && Boolean(incomingCallLabel);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? closeLabel : ringing ? `${incomingCallLabel}. ${openLabel}` : openLabel}
      data-ringing={ringing || undefined}
      aria-expanded={isOpen}
      className={cn(
        'fixed bottom-20 right-4 z-50 hidden sm:flex size-12 items-center justify-center rounded-full lg:bottom-4',
        'shadow-lg transition-colors',
        ringing
          ? 'bg-success text-success-foreground hover:bg-success/90'
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {ringing && (
        // A soft ring spreading from the button; still for anyone who asked for less motion.
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-success opacity-0 motion-safe:animate-[chatCallPulse_2s_ease-out_infinite]"
        />
      )}
      {isOpen ? (
        <X aria-hidden="true" className="size-5" />
      ) : ringing ? (
        <PhoneCall aria-hidden="true" className="size-5 motion-safe:animate-[chatCallRing_2s_ease-in-out_infinite]" />
      ) : (
        <MessageCircle aria-hidden="true" className="size-5" />
      )}
      {showBadge && (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-badge text-white">
          <span aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
          <span className="sr-only">{unreadLabel}</span>
        </span>
      )}
    </button>
  );
}
