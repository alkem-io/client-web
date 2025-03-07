import {
  refetchUserProviderQuery,
  useCreateUserNewRegistrationMutation,
  usePlatformLevelAuthorizationQuery,
  useUserProviderQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { ErrorPage } from '@/core/pages/Errors/ErrorPage';
import { PropsWithChildren, createContext, useEffect, useMemo } from 'react';
import { toUserMetadata, UserMetadata } from '@/domain/community/user';

export interface UserContextValue {
  user: UserMetadata | undefined;
  accountId: string | undefined;
  loading: boolean;
  loadingMe: boolean;
  verified: boolean;
  isAuthenticated: boolean;
  platformRoles: RoleName[];
  accountPrivileges: AuthorizationPrivilege[];
  accountEntitlements: LicenseEntitlementType[];
}

const UserContext = createContext<UserContextValue>({
  user: undefined,
  accountId: undefined,
  loading: true,
  loadingMe: true, // Loading Authentication and Profile data. Once it's false that's enough for showing the page header and avatar.
  verified: false,
  isAuthenticated: false,
  platformRoles: [],
  accountPrivileges: [],
  accountEntitlements: [],
});

const UserProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();

  const {
    data: meData,
    loading: loadingMe,
    error: userProviderError,
  } = useUserProviderQuery({ skip: !isAuthenticated });

  const user = useMemo(() => meData?.me?.user, [meData?.me?.user]);

  const { data: platformLevelAuthorizationData, loading: isLoadingPlatformLevelAuthorization } =
    usePlatformLevelAuthorizationQuery({ skip: !user || !isAuthenticated });

  const [createUserProfile, { loading: loadingCreateUser, error }] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchUserProviderQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => {},
  });

  useEffect(() => {
    if (isAuthenticated && !loadingMe && !user && !loadingCreateUser && !error && !userProviderError) {
      createUserProfile();
    }
  }, [user, loadingMe, createUserProfile, isAuthenticated, loadingCreateUser, error]);

  const loading = loadingAuthentication || loadingCreateUser || loadingMe || isLoadingPlatformLevelAuthorization;

  const userMetadata = useMemo(() => {
    if (!meData?.me) {
      return undefined;
    }

    const myRoles = platformLevelAuthorizationData?.platform.roleSet.myRoles;
    const myPrivileges = platformLevelAuthorizationData?.platform.authorization;

    return toUserMetadata(user, myPrivileges, myRoles);
  }, [user, meData, platformLevelAuthorizationData]);

  const platformRoles = useMemo(
    () => platformLevelAuthorizationData?.platform.roleSet.myRoles ?? [],
    [platformLevelAuthorizationData]
  );
  const accountId = useMemo(() => user?.account?.id, [user]);
  const accountPrivileges = useMemo(() => user?.account?.authorization?.myPrivileges ?? [], [user]);
  const accountEntitlements = useMemo(() => user?.account?.license?.availableEntitlements ?? [], [user]);

  const providedValue = useMemo<UserContextValue>(
    () => ({
      user: userMetadata,
      accountId,
      loading,
      loadingMe: loadingAuthentication || loadingMe,
      verified,
      isAuthenticated,
      platformRoles,
      accountPrivileges,
      accountEntitlements,
    }),
    [
      loadingMe,
      userMetadata,
      loading,
      loadingAuthentication,
      verified,
      isAuthenticated,
      accountId,
      platformRoles,
      accountPrivileges,
      accountEntitlements,
    ]
  );

  return error ? (
    <ErrorPage error={error} />
  ) : (
    <UserContext.Provider value={providedValue}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserProvider };
