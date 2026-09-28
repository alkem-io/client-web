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
  // spec-clientweb-5 (2026-07-31): re-anchored off the retiring
  // `PLATFORM_ADMIN` catch-all onto `PLATFORM_USERS_ADMIN` — the privilege
  // that actually owns administrative action on another user's record (A4
  // email change, A5 identity/account deletion). `PLATFORM_ADMIN` is kept
  // alongside it so the legacy credentials that reach this today are not
  // narrowed; Slice A is additive. The exported name is unchanged because
  // callers use it to mean "may act on someone else's settings", which is
  // still exactly what it means.
  const isPlatformAdmin = [AuthorizationPrivilege.PlatformUsersAdmin, AuthorizationPrivilege.PlatformAdmin].some(
    privilege => Boolean(platformPrivilegeWrapper?.hasPlatformPrivilege(privilege))
  );

  return {
    canEditSettings: isOwner || isPlatformAdmin,
    isOwner,
    isPlatformAdmin,
    loading,
  };
};

export default useCanEditSettings;
