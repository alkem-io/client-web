import { X } from 'lucide-react';
import { ChatThreadView } from '@/crd/components/chat/ChatThreadView';
import type { ChatMessage } from '@/crd/components/chat/types';
import type { CommentAuthor } from '@/crd/components/comment/types';
import { AssistantRailFrame } from '@/crd/components/whiteboard/AssistantRailFrame';
import { Button } from '@/crd/primitives/button';

type WhiteboardChatRailProps = {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  closeLabel: string;
  messages: ChatMessage[];
  currentUser?: CommentAuthor;
  onSendMessage: (content: string) => void;
  className?: string;
};

/** Docked session-chat rail for a whiteboard — a thin wrapper around the existing
 *  `AssistantRailFrame` chrome (push layout, not overlay) and `ChatThreadView` (reused
 *  verbatim: same bubble styling, avatar-gutter run-grouping, composer). A whiteboard
 *  has exactly one chat thread, so — unlike the unified chat panel — there's no back
 *  button, no settings, no conversation list. */
export function WhiteboardChatRail({
  open,
  title,
  subtitle,
  onClose,
  closeLabel,
  messages,
  currentUser,
  onSendMessage,
  className,
}: WhiteboardChatRailProps) {
  return (
    <AssistantRailFrame open={open} className={className}>
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-subsection-title truncate">{title}</span>
          <span className="text-caption text-muted-foreground truncate">{subtitle}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={closeLabel}
          className="shrink-0"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
      </header>

      <ChatThreadView
        conversation={{ id: 'whiteboard-session', displayName: title, isGroup: true, isGuidance: false }}
        messages={messages}
        messagesLoading={false}
        currentUser={currentUser}
        canReact={false}
        onSendMessage={onSendMessage}
      />
    </AssistantRailFrame>
  );
}
