import { type ComponentProps, useState } from 'react';
import { ChatThreadView } from '@/crd/components/chat/ChatThreadView';
import type { ChatMessage } from '@/crd/components/chat/types';
import { type SendEvent, useConversationAttachments } from './attachments/useConversationAttachments';
import { useConversationStorageConfig } from './attachments/useConversationStorageConfig';

type Props = Omit<ComponentProps<typeof ChatThreadView>, 'onSendMessage'> & {
  conversationId: string;
  roomId: string | undefined;
  attachmentsAllowed: boolean;
  sendEvent: (...args: [...Parameters<SendEvent>, replyTo?: string]) => ReturnType<SendEvent>;
  onClearDraft: () => void;
  onRestoreDraft: (text: string) => void;
};

const preview = (message: ChatMessage | undefined): string | undefined =>
  message ? message.content || message.attachments?.[0]?.displayName || '' : undefined;

/** The connector keys this component by conversation, giving each draft its own lifetime. */
export function ConversationThread({
  conversationId,
  roomId,
  attachmentsAllowed,
  sendEvent,
  onClearDraft,
  onRestoreDraft,
  ...view
}: Props) {
  const [replyTo, setReplyTo] = useState<string>();
  const loadedMessages = new Map(view.messages.map(message => [message.id, message]));
  const { storageConfig } = useConversationStorageConfig(attachmentsAllowed ? conversationId : undefined);
  const files = useConversationAttachments(
    attachmentsAllowed ? storageConfig : undefined,
    roomId ? { roomID: roomId } : undefined
  );
  const sendWithDraft: SendEvent = async (text, attachmentUpload) => {
    if (attachmentUpload) return sendEvent(text, attachmentUpload);
    onClearDraft();
    let confirmed: boolean | undefined;
    try {
      confirmed = await (replyTo ? sendEvent(text, undefined, replyTo) : sendEvent(text));
      if (confirmed) setReplyTo(undefined);
      return confirmed;
    } finally {
      if (!confirmed) onRestoreDraft(text);
    }
  };
  return (
    <ChatThreadView
      {...view}
      messages={view.messages.map(message =>
        message.replyTo ? { ...message, replyPreview: preview(loadedMessages.get(message.replyTo)) } : message
      )}
      onReply={view.conversation && !view.conversation.isGuidance ? setReplyTo : undefined}
      replyPreview={replyTo ? (preview(loadedMessages.get(replyTo)) ?? '') : undefined}
      onCancelReply={() => setReplyTo(undefined)}
      isSending={view.isSending || files.isSending}
      onSendMessage={text => files.send(text, sendWithDraft, () => {})}
      attachmentsEnabled={files.enabled}
      attachments={files.attachments}
      onAttachFiles={files.attachFiles}
      onRemoveAttachment={files.removeAttachment}
      attachmentError={files.error}
      acceptMimeTypes={files.accept}
    />
  );
}
