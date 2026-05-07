import { useUserProvider } from '@/domain/community/user/hooks/useUserProvider';
import useUserRouteContext from '@/domain/community/user/routing/useUserRouteContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const useUserPageRouteContext = () => {
  const { userId, loading: routeLoading, getProfileUrl } = useUserRouteContext();
  const { userModel, loading: userLoading } = useUserProvider(userId);
  const { userModel: currentUser, loading: currentUserLoading } = useCurrentUserContext();

  const profileUrl = userModel?.profile?.url ?? '';

  return {
    userId,
    userModel,
    profileUrl: getProfileUrl(profileUrl),
    currentUserId: currentUser?.id ?? null,
    loading: routeLoading || userLoading || currentUserLoading,
  };
};

export default useUserPageRouteContext;
