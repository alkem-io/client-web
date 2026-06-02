import type { CommunityUpdate } from '@/crd/components/space/CommunityUpdatesDialog';
import { getInitials } from '@/crd/lib/getInitials';
import useCommunityUpdates from '@/domain/communication/updates/CommunityUpdatesContainer/useCommunityUpdates';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';

/**
 * Fetches a community's update messages and maps them to the CRD `CommunityUpdate`
 * shape (newest first). Powers the sidebar `UpdatesSection` (latest) and the
 * `CommunityUpdatesDialog` (full list) on both Space and subspace pages.
 */
export function useCrdCommunityUpdates(communityId: string | undefined) {
  const { entities, state } = useCommunityUpdates({ communityId });

  const updates: CommunityUpdate[] = [...entities.messages]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(message => {
      const author = message.sender ? buildAuthorFromUser(message.sender) : undefined;
      return {
        id: message.id,
        body: message.message,
        date: message.timestamp ? new Date(message.timestamp) : undefined,
        author: author
          ? {
              name: author.displayName,
              initials: getInitials(author.displayName) || '??',
              avatarUrl: author.avatarUrl,
              href: author.url || undefined,
            }
          : undefined,
      };
    });

  return {
    updates,
    latest: updates[0],
    total: updates.length,
    loading: state.retrievingUpdateMessages,
  };
}
