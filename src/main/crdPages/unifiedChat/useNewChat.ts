import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useReportedQueryError } from '@/core/apollo/hooks/useReportedQueryError';
import { useMatrixClient } from '@/core/matrix/activeClient';
import type { ShareUser } from '@/crd/forms/UserSelector';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useChatRecipientDirectory } from './useChatRecipientDirectory';
import { openNativeConversation } from './useStartDirectChat';

/**
 * Drives the "new message" flow: contributor search + create a direct (1 person)
 * or group (2+) conversation. Mirrors the legacy NewMessageDialog wiring.
 */
export const useNewChat = (onCreated: (conversationId: string, roomId: string) => void) => {
  const { userModel: currentUser } = useCurrentUserContext();
  const { t } = useTranslation('crd-profilePages');
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ShareUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [terms, setTerms] = useState('');

  const client = useMatrixClient();
  const searchPending = searchQuery.trim() !== terms;
  const { searchResults, loading, error } = useChatRecipientDirectory(
    open && !searchPending ? terms : '',
    currentUser?.id
  );
  useReportedQueryError(error);

  const setSearchTerms = useRef(debounce((value: string) => setTerms(value.trim()), 300)).current;
  useEffect(() => () => setSearchTerms.cancel(), [setSearchTerms]);

  const clearSearch = () => {
    setSearchTerms.cancel();
    setSearchQuery('');
    setTerms('');
  };

  const reset = () => {
    setSelectedUsers([]);
    clearSearch();
  };

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    setSearchTerms(query);
  };

  const onSelect = (user: ShareUser) => {
    setSelectedUsers(previous =>
      previous.some(candidate => candidate.id === user.id) ? previous : [...previous, user]
    );
    clearSearch();
  };

  const onRemove = (userId: string) => setSelectedUsers(previous => previous.filter(user => user.id !== userId));

  const [createConversation, creating] = useLoadingState(async () => {
    if (selectedUsers.length === 0) {
      return;
    }
    const isGroup = selectedUsers.length > 1;
    const displayName = isGroup ? selectedUsers.map(user => user.displayName).join(', ') : undefined;

    const roomId = await openNativeConversation(
      client,
      selectedUsers.map(user => user.id),
      displayName
    );
    onCreated(roomId, roomId);
    setOpen(false);
    reset();
  });
  const create = () => createConversation().catch(() => toast.error(t('common.messagePopover.openChatError')));

  const openDialog = () => {
    reset();
    setOpen(true);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      reset();
    }
  };

  return {
    open,
    openDialog,
    onOpenChange,
    searchQuery,
    onSearchChange,
    searchResults,
    selectedUsers,
    onSelect,
    onRemove,
    loading: loading || searchPending,
    creating,
    create,
  };
};
