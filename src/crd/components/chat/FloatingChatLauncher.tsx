import { MessageCircle, X } from 'lucide-react';
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
};

/**
 * The single floating entry point to the unified chat. A circular button fixed
 * to the bottom-right, with an unread-count badge overlay when the panel is closed.
 */
export function FloatingChatLauncher({
  unreadCount = 0,
  isOpen,
  hidden,
  onClick,
  openLabel,
  closeLabel,
  unreadLabel,
}: FloatingChatLauncherProps) {
  if (hidden) {
    return null;
  }

  const showBadge = !isOpen && unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? closeLabel : openLabel}
      aria-expanded={isOpen}
      className={cn(
        'fixed bottom-4 right-4 z-50 flex size-12 items-center justify-center rounded-full',
        'bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {isOpen ? <X aria-hidden="true" className="size-5" /> : <MessageCircle aria-hidden="true" className="size-5" />}
      {showBadge && (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-badge text-white">
          <span aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
          <span className="sr-only">{unreadLabel}</span>
        </span>
      )}
    </button>
  );
}
