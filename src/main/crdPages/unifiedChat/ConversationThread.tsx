import type { ComponentProps } from 'react';
import { ChatThreadView } from '@/crd/components/chat/ChatThreadView';
import { useDownloadMessageMedia } from '@/main/crdPages/utils/useDownloadMessageMedia';
import { type SendEvent, useConversationAttachments } from './attachments/useConversationAttachments';
import { useConversationStorageConfig } from './attachments/useConversationStorageConfig';

type Props = Omit<ComponentProps<typeof ChatThreadView>, 'onSendMessage'> & {
  conversationId: string;
  roomId: string | undefined;
  attachmentsAllowed: boolean;
  sendEvent: SendEvent;
  onClearDraft: () => void;
  onRestoreDraft: (text: string) => void;
};

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
  const { storageConfig } = useConversationStorageConfig(conversationId);
  const downloadMedia = useDownloadMessageMedia();
  const files = useConversationAttachments(
    attachmentsAllowed ? storageConfig : undefined,
    roomId ? { roomID: roomId } : undefined
  );
  const sendWithDraft: SendEvent = async (text, attachmentUpload) => {
    if (attachmentUpload) return sendEvent(text, attachmentUpload);
    onClearDraft();
    let confirmed: boolean | undefined;
    try {
      confirmed = await sendEvent(text);
      return confirmed;
    } finally {
      if (!confirmed) onRestoreDraft(text);
    }
  };
  return (
    <ChatThreadView
      {...view}
      isSending={view.isSending || files.isSending}
      onSendMessage={text => files.send(text, sendWithDraft, () => {})}
      attachmentsEnabled={files.enabled}
      attachments={files.attachments}
      onAttachFiles={files.attachFiles}
      onRemoveAttachment={files.removeAttachment}
      attachmentError={files.error}
      acceptMimeTypes={files.accept}
      onDownloadMedia={downloadMedia}
    />
  );
}
