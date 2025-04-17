import { usePendingInvitationsCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useCurrentUserContext } from '@/domain/community/user';

export const usePendingInvitationsCount = () => {
  const { userModel, isAuthenticated } = useCurrentUserContext();
  const { data: invitesData } = usePendingInvitationsCountQuery({
    skip: !isAuthenticated || !userModel,
  });

  return {
    count: invitesData?.me?.communityInvitationsCount || 0,
  };
};
