import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

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
