import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { AuthorModel } from '@/domain/community/user/models/AuthorModel';

export const useCommunityUpdatesViewState = (messages: Message[], authors: AuthorModel[]) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [stubMessageId, setStubMessageId] = useState<string | null>(null);
  const [removedMessageId, setRemovedMessageId] = useState<string | null>(null);

  const memberMap = useMemo(() => {
    const map: Record<string, AuthorModel> = {};
    for (const m of authors) {
      map[m.id] = m;
    }
    return map;
  }, [authors]);

  useEffect(() => {
    setStubMessageId(id => (messages.find(m => m.id === id) ? null : id));
  }, [messages]);

  useEffect(() => {
    setRemovedMessageId(id => (messages.find(m => m.id === id) ? id : null));
  }, [messages]);

  const handleCopy = (message: string) => {
    if (!message) {
      notify(t('pages.community.updates.copy.noContent'), 'error');
      return;
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(message)
        .then(() => notify(t('pages.community.updates.copy.success'), 'info'))
        .catch(() => notify(t('pages.community.updates.copy.failed'), 'error'));
    } else {
      notify(t('pages.community.updates.copy.unsupported'), 'error');
    }
  };

  return {
    stubMessageId,
    setStubMessageId,
    removedMessageId,
    setRemovedMessageId,
    memberMap,
    handleCopy,
  };
};
