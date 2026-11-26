import { useV2PendingMembershipsQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

export const usePendingInvitationsCount = () => {
  const { userModel, isAuthenticated } = useCurrentUserContext();
  const { data, loading, error } = useV2PendingMembershipsQuery({
    skip: !isAuthenticated || !userModel,
    fetchPolicy: 'cache-first',
  });
  if (error) throw error;

  return {
    // screens-dispositions.tsv:10984: the count is the length of Viewer.pendingInvitations, which carries the space and
    // the organization invitations this viewer may act on (legacy summed both counts, 062).
    count: data?.viewer.pendingInvitations.length ?? 0,
    loading,
  };
};
