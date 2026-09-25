import type { ComponentProps } from 'react';
import { ChatThreadView } from '@/crd/components/chat/ChatThreadView';
import { type SendEvent, useConversationAttachments } from './attachments/useConversationAttachments';
import { useConversationStorageConfig } from './attachments/useConversationStorageConfig';

type Props = Omit<ComponentProps<typeof ChatThreadView>, 'onSendMessage'> & {
  conversationId: string;
  attachmentsAllowed: boolean;
  sendEvent: SendEvent;
  onTextSent: () => void;
};

/** The connector keys this component by conversation, giving each draft its own lifetime. */
export function ConversationThread({ conversationId, attachmentsAllowed, sendEvent, onTextSent, ...view }: Props) {
  const { storageConfig } = useConversationStorageConfig(conversationId);
  const files = useConversationAttachments(attachmentsAllowed ? storageConfig : undefined);
  return (
    <ChatThreadView
      {...view}
      isSending={view.isSending || files.isSending}
      onSendMessage={text => files.send(text, sendEvent, onTextSent)}
      attachmentsEnabled={files.enabled}
      attachments={files.attachments}
      onAttachFiles={files.attachFiles}
      onRemoveAttachment={files.removeAttachment}
      attachmentError={files.error}
      acceptMimeTypes={files.accept}
    />
  );
}
