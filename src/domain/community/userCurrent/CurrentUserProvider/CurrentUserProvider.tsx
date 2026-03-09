import {
  refetchCurrentUserLightQuery,
  useCreateUserNewRegistrationMutation,
  usePlatformLevelAuthorizationQuery,
  useCurrentUserLightQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { ErrorPage } from '@/core/pages/Errors/ErrorPage';
import { error as sentryError, TagCategoryValues } from '@/core/logging/sentry/log';
import { PropsWithChildren, createContext, useEffect, useMemo } from 'react';
import { toPlatformPrivilegeWrapper } from './usePlatformPrivilegeWrapper';
import { CurrentUserModel } from '../model/CurrentUserModel';

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
  const { isAuthenticated, loading: loadingAuthentication, verified, session } = useAuthenticationContext();

  const {
    data: meData,
    loading: loadingMe,
    error: userProviderError,
  } = useCurrentUserLightQuery({ skip: !isAuthenticated });

  const user = useMemo(() => meData?.me?.user, [meData?.me?.user]);

  const { data: platformLevelAuthorizationData, loading: isLoadingPlatformLevelAuthorization } =
    usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated });

  const [createUserProfile, { loading: loadingCreateUser, error }] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchCurrentUserLightQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => {},
  });

  useEffect(() => {
    const email = (session?.identity?.traits as Record<string, unknown> | undefined)?.email as string | undefined;
    if (isAuthenticated && !loadingMe && !user && !loadingCreateUser && !error && !userProviderError && email) {
      createUserProfile({
        variables: {
          userData: {
            email,
            profileData: {
              displayName: email,
            },
          },
        },
      });
    }
  }, [user, loadingMe, createUserProfile, isAuthenticated, loadingCreateUser, error, session]);

  const loading = loadingAuthentication || loadingCreateUser || loadingMe || isLoadingPlatformLevelAuthorization;

  const platformPrivilegeWrapper = useMemo(() => {
    if (!meData?.me) {
      return undefined;
    }
    const myPrivileges = platformLevelAuthorizationData?.platform.authorization?.myPrivileges;

    return toPlatformPrivilegeWrapper(myPrivileges);
  }, [user, meData, platformLevelAuthorizationData]);

  const platformRoles = useMemo(
    () => platformLevelAuthorizationData?.platform.roleSet.myRoles ?? [],
    [platformLevelAuthorizationData]
  );
  const accountId = useMemo(() => user?.account?.id, [user]);
  const accountPrivileges = useMemo(() => user?.account?.authorization?.myPrivileges ?? [], [user]);
  const accountEntitlements = useMemo(() => user?.account?.license?.availableEntitlements ?? [], [user]);

  const providedValue = useMemo<CurrentUserModel>(
    () => ({
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
    }),
    [
      loadingMe,
      platformPrivilegeWrapper,
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

  useEffect(() => {
    if (error) {
      sentryError(error, { category: TagCategoryValues.AUTH, label: 'CurrentUserProvider: user registration failed' });
    }
  }, [error]);

  useEffect(() => {
    if (userProviderError) {
      sentryError(userProviderError, {
        category: TagCategoryValues.AUTH,
        label: 'CurrentUserProvider: user query failed',
      });
    }
  }, [userProviderError]);

  const criticalError = error ?? userProviderError;

  return criticalError ? (
    <ErrorPage error={criticalError} />
  ) : (
    <CurrentUserContext value={providedValue}>{children}</CurrentUserContext>
  );
};

export { CurrentUserContext, CurrentUserProvider as UserProvider };
