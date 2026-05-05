import { useState } from 'react';
import {
  refetchCommunityUpdatesQuery,
  useCommunityUpdatesQuery,
  useRemoveMessageOnRoomMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateMessage } from '@/crd/components/space/settings/SpaceSettingsUpdatesView';

export type UseUpdatesTabDataResult = {
  messages: UpdateMessage[];
  draft: string;
  loading: boolean;
  submitting: boolean;
  removing: boolean;
  onDraftChange: (next: string) => void;
  onSubmit: () => Promise<void>;
  onRequestRemove: (messageId: string) => void;
  onConfirmRemove: () => Promise<void>;
  onCancelRemove: () => void;
  pendingRemoveMessage: UpdateMessage | null;
};

/**
 * Wires the CRD Updates tab view to the existing community-updates data
 * pipeline (the same queries + mutations the MUI admin uses).
 *
 * Messages are ordered newest-first. Remove is a two-step flow: the caller
 * renders a ConfirmationDialog driven by `pendingRemoveMessage` + `onConfirmRemove`.
 */
export function useUpdatesTabData(communityId: string | undefined): UseUpdatesTabDataResult {
  const { data, loading } = useCommunityUpdatesQuery({
    variables: { communityId: communityId ?? '' },
    skip: !communityId,
  });

  const roomId = data?.lookup.community?.communication?.updates.id;

  const [sendMessage, { loading: submitting }] = useSendMessageToRoomMutation({
    refetchQueries: communityId ? [refetchCommunityUpdatesQuery({ communityId })] : [],
  });
  const [removeMessage, { loading: removing }] = useRemoveMessageOnRoomMutation();

  const [draft, setDraft] = useState('');
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const rawMessages = data?.lookup.community?.communication?.updates.messages ?? [];

  const messages: UpdateMessage[] = rawMessages
    .map(m => ({
      id: m.id,
      body: m.message ?? '',
      timestamp: typeof m.timestamp === 'string' ? Date.parse(m.timestamp) : Number(m.timestamp),
      author: m.sender
        ? {
            id: m.sender.id,
            displayName: m.sender.profile?.displayName ?? '',
            avatarUrl: m.sender.profile?.avatar?.uri ?? null,
            profileUrl: m.sender.profile?.url ?? null,
          }
        : null,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const onDraftChange = (next: string) => setDraft(next);

  const onSubmit = async () => {
    if (!roomId) return;
    const body = draft.trim();
    if (!body) return;
    await sendMessage({ variables: { messageData: { message: body, roomID: roomId } } });
    setDraft('');
  };

  const onRequestRemove = (messageId: string) => setPendingRemoveId(messageId);
  const onCancelRemove = () => setPendingRemoveId(null);

  const onConfirmRemove = async () => {
    if (!roomId || !pendingRemoveId) return;
    const messageId = pendingRemoveId;
    setPendingRemoveId(null);
    await removeMessage({
      variables: { messageData: { messageID: messageId, roomID: roomId } },
      refetchQueries: communityId ? [refetchCommunityUpdatesQuery({ communityId })] : [],
    });
  };

  const pendingRemoveMessage = pendingRemoveId ? (messages.find(m => m.id === pendingRemoveId) ?? null) : null;

  return {
    messages,
    draft,
    loading,
    submitting,
    removing,
    onDraftChange,
    onSubmit,
    onRequestRemove,
    onConfirmRemove,
    onCancelRemove,
    pendingRemoveMessage,
  };
}
