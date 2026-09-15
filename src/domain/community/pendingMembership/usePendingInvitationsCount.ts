import { usePendingInvitationsCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

export const usePendingInvitationsCount = () => {
  const { userModel, isAuthenticated } = useCurrentUserContext();
  const { data: invitesData, loading } = usePendingInvitationsCountQuery({
    skip: !isAuthenticated || !userModel,
    fetchPolicy: 'cache-first',
  });

  return {
    // Sums the Space-shaped and organization-shaped counts (062) — the top-bar badge
    // and dialog title show one number covering both pending-invitation kinds.
    count: (invitesData?.me?.communityInvitationsCount || 0) + (invitesData?.me?.organizationInvitationsCount || 0),
    loading,
  };
};
