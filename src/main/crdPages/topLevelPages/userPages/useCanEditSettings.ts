import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

/**
 * Centralizes the FR-008a / FR-011 predicate for the User vertical:
 * a viewer "can edit settings" of a profile when they are the profile owner
 * OR a platform admin. Both 096 (public profile gear icon) and sibling
 * spec 097 (settings shell route guard) consume this hook.
 */
export type UseCanEditSettingsResult = {
  canEditSettings: boolean;
  isOwner: boolean;
  isPlatformAdmin: boolean;
  loading: boolean;
};

const useCanEditSettings = (params: { profileUserId: string | undefined }): UseCanEditSettingsResult => {
  const { profileUserId } = params;
  const { userModel: currentUser, platformPrivilegeWrapper, loading } = useCurrentUserContext();

  const isOwner = Boolean(currentUser?.id && profileUserId && currentUser.id === profileUserId);
  const isPlatformAdmin = Boolean(platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin));

  return {
    canEditSettings: isOwner || isPlatformAdmin,
    isOwner,
    isPlatformAdmin,
    loading,
  };
};

export default useCanEditSettings;
