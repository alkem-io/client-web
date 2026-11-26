import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReportedQueryError } from '@/core/apollo/hooks/useReportedQueryError';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { SendConfirmationDialog } from '@/crd/components/chat/SendConfirmationDialog';
import { type ShareUser, UserSelector } from '@/crd/forms/UserSelector';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import { Textarea } from '@/crd/primitives/textarea';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useChatRecipientDirectory } from '@/main/crdPages/unifiedChat/useChatRecipientDirectory';
import { openNativeConversation } from '@/main/crdPages/unifiedChat/useStartDirectChat';
import { nativeMatrixId } from '@/main/userMessaging/matrix/matrixRooms';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

type CalloutShareOnAlkemioFormProps = {
  url: string;
  entityLabel: string;
  /**
   * Closes the surrounding Share dialog. Called when the user acts on the
   * confirmation (dismiss or "open chat") so the confirmation — layered above
   * the Share dialog — does not leave that dialog open behind it (FR-005).
   */
  onClose?: () => void;
};

export function CalloutShareOnAlkemioForm({ url, entityLabel, onClose }: CalloutShareOnAlkemioFormProps) {
  const { t } = useTranslation('crd-common');
  const notify = useNotification();
  const { userModel: currentUser } = useCurrentUserContext();
  const client = useMatrixClient();
  const { setIsOpen, setSelectedConversationId, setSelectedRoomId } = useUserMessagingContext();

  const initialMessage = t('share.alkemio.defaultMessage', { entity: entityLabel, url });

  const [selectedUsers, setSelectedUsers] = useState<ShareUser[]>([]);
  const [message, setMessage] = useState(initialMessage);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [notReached, setNotReached] = useState<string[]>([]);
  const [sentConversationIds, setSentConversationIds] = useState<string[]>([]);

  const { searchResults, loading: searching, error } = useChatRecipientDirectory(searchQuery, currentUser?.id);
  useReportedQueryError(error);

  const userError = selectedUsers.length === 0 ? t('share.alkemio.errors.atLeastOneUser') : null;
  const messageError =
    message.trim().length === 0
      ? t('share.alkemio.errors.messageRequired')
      : message.length > LONG_TEXT_LENGTH
        ? t('share.alkemio.errors.messageTooLong', { max: LONG_TEXT_LENGTH })
        : null;
  const hasErrors = Boolean(userError || messageError);

  const handleSelect = (user: ShareUser) => {
    setSelectedUsers(prev => (prev.some(u => u.id === user.id) ? prev : [...prev, user]));
    setSearchQuery('');
  };

  const handleRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const [handleSend, sending] = useLoadingState(async () => {
    setShowErrors(true);
    if (hasErrors) return;
    if (!client) {
      notify(t('share.alkemio.errors.sendFailed'), 'error');
      return;
    }

    const finalMessage = message.includes(url) ? message : `${message}\n\n${url}`;
    const results = await Promise.allSettled(
      selectedUsers.map(async recipient => {
        const roomId = await openNativeConversation(client, [recipient.id]);
        const matrixRoomId = nativeMatrixId(roomId, '!', client);
        if (!matrixRoomId) throw new Error('Conversation could not be opened.');
        await client.sendTextMessage(matrixRoomId, null, finalMessage);
        return roomId;
      })
    );
    const failedNames: string[] = [];
    const sentIds: string[] = [];
    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        sentIds.push(result.value);
      } else {
        failedNames.push(selectedUsers[index].displayName);
      }
    }

    setNotReached(failedNames);
    setSentConversationIds(sentIds);
    setConfirmationOpen(true);

    setSelectedUsers([]);
    setMessage(initialMessage);
    setSearchQuery('');
    setShowErrors(false);
  });

  const handleConfirmationOpenChange = (next: boolean) => {
    setConfirmationOpen(next);
    // Dismissing the confirmation also closes the Share dialog underneath it.
    if (!next) onClose?.();
  };

  const handleOpenChat = () => {
    const roomId = sentConversationIds.length === 1 ? sentConversationIds[0] : null;
    setSelectedConversationId(roomId);
    setSelectedRoomId(roomId);
    setIsOpen(true);
    setConfirmationOpen(false);
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-muted-foreground">{t('share.alkemio.description', { entity: entityLabel })}</p>

      <div className="flex flex-col gap-1">
        <UserSelector
          selectedUsers={selectedUsers}
          searchResults={searchResults}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={handleSelect}
          onRemove={handleRemove}
          loading={searching}
          placeholder={t('share.alkemio.searchPlaceholder')}
          searchAriaLabel={t('share.alkemio.searchAriaLabel')}
          loadingLabel={t('share.alkemio.searching')}
          noResultsLabel={t('share.alkemio.noResults')}
          removeAriaLabel={name => t('share.alkemio.removeUser', { name })}
        />
        {showErrors && userError && (
          <p role="alert" className="text-caption text-destructive">
            {userError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="share-on-alkemio-message">{t('share.alkemio.messageLabel')}</Label>
        <Textarea
          id="share-on-alkemio-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          maxLength={LONG_TEXT_LENGTH}
          aria-invalid={showErrors && Boolean(messageError)}
        />
        {showErrors && messageError && (
          <p role="alert" className="text-caption text-destructive">
            {messageError}
          </p>
        )}
        <p className="text-caption text-muted-foreground">{t('share.alkemio.notice')}</p>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSend} disabled={sending} aria-busy={sending}>
          <Send className="size-4 mr-2" aria-hidden="true" />
          {t('share.alkemio.send')}
        </Button>
      </div>

      <SendConfirmationDialog
        open={confirmationOpen}
        onOpenChange={handleConfirmationOpenChange}
        notReached={notReached}
        onOpenChat={sentConversationIds.length > 0 ? handleOpenChat : undefined}
      />
    </div>
  );
}
