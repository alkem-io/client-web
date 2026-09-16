import { MessageCircle } from 'lucide-react';
import { Button } from '@/crd/primitives/button';

type WhiteboardChatToggleProps = {
  open: boolean;
  onClick: () => void;
  unreadCount?: number;
  openLabel: string;
  closeLabel: string;
  unreadLabel: string;
};

/** Header icon button that opens/closes the whiteboard session-chat rail, goes in
 *  `WhiteboardEditorShell`'s `headerActions` slot. Same unread-badge treatment as
 *  `FloatingChatLauncher`, but inline in the whiteboard header rather than fixed-position. */
export function WhiteboardChatToggle({
  open,
  onClick,
  unreadCount = 0,
  openLabel,
  closeLabel,
  unreadLabel,
}: WhiteboardChatToggleProps) {
  const showBadge = !open && unreadCount > 0;

  return (
    <Button
      type="button"
      variant={open ? 'default' : 'ghost'}
      size="icon"
      onClick={onClick}
      aria-label={open ? closeLabel : openLabel}
      aria-pressed={open}
      className="relative"
    >
      <MessageCircle aria-hidden="true" className="size-5" />
      {showBadge && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border-2 border-background bg-destructive text-[9px] font-semibold text-white">
          <span aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
          <span className="sr-only">{unreadLabel}</span>
        </span>
      )}
    </Button>
  );
}
