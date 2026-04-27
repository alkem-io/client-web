import { Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShareLinkWithUserMutation, useUserSelectorQuery } from '@/core/apollo/generated/apollo-hooks';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { type ShareUser, UserSelector } from '@/crd/forms/UserSelector';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import { Textarea } from '@/crd/primitives/textarea';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const SEARCH_PAGE_SIZE = 20;

type CalloutShareOnAlkemioFormProps = {
  url: string;
  entityLabel: string;
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

export function CalloutShareOnAlkemioForm({ url, entityLabel }: CalloutShareOnAlkemioFormProps) {
  const { t } = useTranslation('crd-common');
  const notify = useNotification();
  const { userModel: currentUser } = useCurrentUserContext();

  const initialMessage = useMemo(
    () => t('share.alkemio.defaultMessage', { entity: entityLabel, url }),
    [t, entityLabel, url]
  );

  const [selectedUsers, setSelectedUsers] = useState<ShareUser[]>([]);
  const [message, setMessage] = useState(initialMessage);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

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

  const [shareLinkMutation, { loading: sending }] = useShareLinkWithUserMutation();

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
    setMessageSent(false);
  };

  const handleRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    setMessageSent(false);
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    setMessageSent(false);
  };

  const handleSend = async () => {
    setShowErrors(true);
    if (hasErrors) return;

    const finalMessage = message.includes(url) ? message : `${message}\n\n${url}`;

    try {
      await shareLinkMutation({
        variables: {
          messageData: {
            receiverIds: selectedUsers.map(u => u.id),
            message: finalMessage,
          },
        },
      });
      setMessageSent(true);
      setSelectedUsers([]);
      setMessage(initialMessage);
      setSearchQuery('');
      setShowErrors(false);
    } catch {
      notify(t('share.alkemio.errors.sendFailed'), 'error');
    }
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
          onChange={e => handleMessageChange(e.target.value)}
          rows={5}
          maxLength={LONG_TEXT_LENGTH}
          aria-invalid={showErrors && Boolean(messageError)}
        />
        {showErrors && messageError && (
          <p role="alert" className="text-caption text-destructive">
            {messageError}
          </p>
        )}
        <p className="text-caption text-muted-foreground">{t('share.alkemio.warning')}</p>
      </div>

      {messageSent && (
        <output className="block rounded-md border border-border bg-muted px-3 py-2 text-control text-foreground">
          {t('share.alkemio.sent')}
        </output>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={handleSend} disabled={sending} aria-busy={sending}>
          <Send className="size-4 mr-2" aria-hidden="true" />
          {t('share.alkemio.send')}
        </Button>
      </div>
    </div>
  );
}
