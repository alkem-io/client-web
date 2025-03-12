import { usePendingInvitationsCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserContext } from '@/domain/community/user';

export const usePendingInvitationsCount = () => {
  const { user, isAuthenticated } = useUserContext();
  const { data: invitesData } = usePendingInvitationsCountQuery({
    skip: !isAuthenticated || !user,
  });

  return {
    count: invitesData?.me?.communityInvitationsCount || 0,
  };
};
