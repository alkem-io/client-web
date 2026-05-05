import { useUserProvider } from '@/domain/community/user/hooks/useUserProvider';
import useUserRouteContext from '@/domain/community/user/routing/useUserRouteContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

/**
 * Resolves the profile-being-viewed user from the URL and exposes ids + viewer.
 * Reuses the existing MUI `useUserRouteContext` (handles `/user/me` AND
 * `/user/:slug` in one place) plus `useUserProvider` and `useCurrentUserContext`.
 */
const useUserPageRouteContext = () => {
  const { userId, loading: routeLoading, getProfileUrl, isOnMeRoute } = useUserRouteContext();
  const { userModel, loading: userLoading } = useUserProvider(userId);
  const { userModel: currentUser, loading: currentUserLoading } = useCurrentUserContext();

  // The user's slug is the last URL segment of the profile URL (e.g. `/user/<slug>`),
  // since `UserModel` does not surface `nameID` directly.
  const profileUrl = userModel?.profile?.url ?? '';
  const userSlug = profileUrl ? profileUrl.split('/').filter(Boolean).pop() : undefined;

  return {
    userId,
    userModel,
    userSlug,
    profileUrl: getProfileUrl(profileUrl),
    isOnMeRoute,
    currentUserId: currentUser?.id ?? null,
    loading: routeLoading || userLoading || currentUserLoading,
  };
};

export default useUserPageRouteContext;
