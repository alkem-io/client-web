import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import {
  DirectMessageDialog as CrdDirectMessageDialog,
  type DirectMessageReceiver,
} from '@/crd/components/community/DirectMessageDialog';

export interface MessageReceiverChipData {
  id: string;
  displayName?: string;
  city?: string;
  country?: string;
  avatarUri?: string;
}

type MessageUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  messageReceivers?: MessageReceiverChipData[];
  title?: ReactNode;
};

/**
 * Consider using useDirectMessageDialog hook that has Send Message mutations baked in.
 *
 * Thin adapter that maps the legacy `onSendMessage(text)` / `messageReceivers`
 * API onto the headless CRD DirectMessageDialog, owning the message value,
 * loading/sent flags and i18n labels so existing callsites keep their props.
 */
export const DirectMessageDialog = ({
  open,
  onClose,
  onSendMessage,
  messageReceivers,
  title,
}: MessageUserDialogProps) => {
  const { t } = useTranslation();

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMessageSent, setMessageSent] = useState(false);

  const handleClose = () => {
    onClose();
    setMessageSent(false);
  };

  const handleSend = async () => {
    if (message.trim().length === 0) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessageSent(true);
      setMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const receivers: DirectMessageReceiver[] | undefined = messageReceivers?.map(receiver => ({
    id: receiver.id,
    displayName: receiver.displayName,
    city: receiver.city,
    country: receiver.country,
    avatarUrl: receiver.avatarUri,
  }));

  return (
    <CrdDirectMessageDialog
      title={title}
      open={open}
      onOpenChange={isOpen => (isOpen ? undefined : handleClose())}
      receivers={receivers}
      value={message}
      onValueChange={value => {
        setMessage(value);
        setMessageSent(false);
      }}
      maxLength={LONG_TEXT_LENGTH}
      sending={isSending}
      sent={isMessageSent}
      onSend={handleSend}
      labels={{
        messageLabel: t('messaging.message'),
        warning: t('share-dialog.warning'),
        successLabel: t('messaging.successfully-sent'),
        sendLabel: t('buttons.send'),
        closeLabel: t('buttons.close'),
      }}
    />
  );
};
