import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useMeUserContext } from './MeUserContext';

/**
 * Hook that provides user route context, handling both /user/me and /user/:nameId routes.
 * Centralizes the logic for determining userId and profile URL based on route context.
 */
const useUserRouteContext = () => {
  const meContext = useMeUserContext();
  const { userId: resolvedUserId, loading: urlResolverLoading } = useUrlResolver();

  const userId = meContext?.userId ?? resolvedUserId;
  const loading = !meContext && urlResolverLoading;

  /**
   * Returns the appropriate profile URL for navigation.
   * Uses '/user/me' when on the me route, otherwise uses the provided URL.
   */
  const getProfileUrl = (actualUrl: string | undefined) => (meContext ? '/user/me' : actualUrl);

  return {
    userId,
    loading,
    isOnMeRoute: Boolean(meContext),
    getProfileUrl,
  };
};

export default useUserRouteContext;
