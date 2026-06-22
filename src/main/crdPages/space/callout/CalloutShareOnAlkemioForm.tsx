import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSendDirectMessageToUsersMutation, useUserSelectorQuery } from '@/core/apollo/generated/apollo-hooks';
import { DirectMessageDeliveryStatus } from '@/core/apollo/generated/graphql-schema';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { SendConfirmationDialog } from '@/crd/components/chat/SendConfirmationDialog';
import { type ShareUser, UserSelector } from '@/crd/forms/UserSelector';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import { Textarea } from '@/crd/primitives/textarea';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

const SEARCH_PAGE_SIZE = 20;

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

type SearchedUser = {
  id: string;
  profile?: {
    displayName: string;
    location?: { city?: string; country?: string };
    visual?: { uri?: string };
  };
};

function mapToShareUser(user: SearchedUser): ShareUser | null {
  if (!user.profile) return null;
  return {
    id: user.id,
    displayName: user.profile.displayName,
    avatarUrl: user.profile.visual?.uri || undefined,
    city: user.profile.location?.city || undefined,
    country: user.profile.location?.country || undefined,
  };
}

export function CalloutShareOnAlkemioForm({ url, entityLabel, onClose }: CalloutShareOnAlkemioFormProps) {
  const { t } = useTranslation('crd-common');
  const notify = useNotification();
  const { userModel: currentUser } = useCurrentUserContext();
  const { setIsOpen, setSelectedConversationId } = useUserMessagingContext();

  const initialMessage = t('share.alkemio.defaultMessage', { entity: entityLabel, url });

  const [selectedUsers, setSelectedUsers] = useState<ShareUser[]>([]);
  const [message, setMessage] = useState(initialMessage);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [notReached, setNotReached] = useState<string[]>([]);
  const [sentConversationIds, setSentConversationIds] = useState<string[]>([]);

  const trimmedQuery = searchQuery.trim();
  const { data: searchData, loading: searching } = useUserSelectorQuery({
    variables: {
      filter: { displayName: trimmedQuery, email: trimmedQuery },
      first: SEARCH_PAGE_SIZE,
    },
    skip: trimmedQuery.length === 0,
  });

  const searchResults = (searchData?.usersPaginated.users ?? [])
    .filter(user => user.id !== currentUser?.id)
    .map(mapToShareUser)
    .filter((u): u is ShareUser => u !== null);

  const [sendDirectMessage, { loading: sending }] = useSendDirectMessageToUsersMutation();

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

  const handleSend = async () => {
    setShowErrors(true);
    if (hasErrors) return;

    const finalMessage = message.includes(url) ? message : `${message}\n\n${url}`;
    const recipients = selectedUsers;

    try {
      const { data } = await sendDirectMessage({
        variables: {
          messageData: {
            receiverIDs: recipients.map(u => u.id),
            message: finalMessage,
          },
        },
      });

      const results = data?.sendDirectMessageToUsers ?? [];
      const byReceiver = new Map(results.map(result => [result.receiverID, result]));

      // Recipients the server reports as not SENT (no consent / failed) are
      // surfaced individually rather than as a blanket success (FR-013).
      const failedNames = recipients
        .filter(u => byReceiver.get(u.id)?.status !== DirectMessageDeliveryStatus.Sent)
        .map(u => u.displayName);

      // Collect every successfully created/reused conversation so "open chat"
      // can focus the single one (if there was just one recipient) or fall back
      // to the conversation list when several were messaged (FR-005).
      const sentIds = results
        .filter(result => result.status === DirectMessageDeliveryStatus.Sent && result.conversationID)
        .map(result => result.conversationID as string);

      setNotReached(failedNames);
      setSentConversationIds(sentIds);
      setConfirmationOpen(true);

      setSelectedUsers([]);
      setMessage(initialMessage);
      setSearchQuery('');
      setShowErrors(false);
    } catch {
      notify(t('share.alkemio.errors.sendFailed'), 'error');
    }
  };

  const handleConfirmationOpenChange = (next: boolean) => {
    setConfirmationOpen(next);
    // Dismissing the confirmation also closes the Share dialog underneath it.
    if (!next) onClose?.();
  };

  const handleOpenChat = () => {
    // Several recipients were messaged individually → open the conversation list
    // (null selection); focus the single conversation only when there was one.
    setSelectedConversationId(sentConversationIds.length === 1 ? sentConversationIds[0] : null);
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
