import { createContext, type PropsWithChildren } from 'react';
import { useCurrentUserLightQuery, usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { CrdTopLevelErrorPage } from '@/main/crdPages/error/CrdTopLevelErrorPage';
import type { CurrentUserModel } from '../model/CurrentUserModel';
import { toPlatformPrivilegeWrapper } from './usePlatformPrivilegeWrapper';

const CurrentUserContext = createContext<CurrentUserModel>({
  platformPrivilegeWrapper: undefined,
  userModel: undefined,
  accountId: undefined,
  loading: true,
  loadingMe: true, // Loading Authentication and Profile data. Once it's false that's enough for showing the page header and avatar.
  verified: false,
  isAuthenticated: false,
  platformRoles: [],
  accountPrivileges: [],
  accountEntitlements: [],
});

const CurrentUserProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();

  const {
    data: meData,
    loading: loadingMe,
    error: userProviderError,
  } = useCurrentUserLightQuery({ skip: !isAuthenticated });

  const user = meData?.me?.user;

  const { data: platformLevelAuthorizationData, loading: isLoadingPlatformLevelAuthorization } =
    usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated });

  const loading = loadingAuthentication || loadingMe || isLoadingPlatformLevelAuthorization;

  const platformPrivilegeWrapper = (() => {
    if (!meData?.me) {
      return undefined;
    }
    const myPrivileges = platformLevelAuthorizationData?.platform.authorization?.myPrivileges;

    return toPlatformPrivilegeWrapper(myPrivileges);
  })();

  const platformRoles = platformLevelAuthorizationData?.platform.roleSet.myRoles ?? [];
  const accountId = user?.account?.id;
  const accountPrivileges = user?.account?.authorization?.myPrivileges ?? [];
  const accountEntitlements = user?.account?.license?.availableEntitlements ?? [];

  const providedValue = {
    platformPrivilegeWrapper,
    userModel: user,
    accountId,
    loading,
    loadingMe: loadingAuthentication || loadingMe,
    verified,
    isAuthenticated,
    platformRoles,
    accountPrivileges,
    accountEntitlements,
  };

  return userProviderError ? (
    <CrdTopLevelErrorPage error={userProviderError} />
  ) : (
    <CurrentUserContext value={providedValue}>{children}</CurrentUserContext>
  );
};

export { CurrentUserContext, CurrentUserProvider as UserProvider };
