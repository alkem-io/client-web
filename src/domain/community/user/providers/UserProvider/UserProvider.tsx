import React, { FC, useEffect, useMemo } from 'react';
import {
  refetchUserProviderQuery,
  useCreateUserNewRegistrationMutation,
  usePlatformLevelAuthorizationQuery,
  useUserProviderQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { ErrorPage } from '../../../../../core/pages/Errors/ErrorPage';
import { User } from '../../../../../core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '../../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { toUserMetadata, UserMetadata } from '../../hooks/useUserMetadataWrapper';

export interface UserContextValue {
  user: UserMetadata | undefined;
  loading: boolean;
  loadingMe: boolean; // Loading Authentication and Profile data. Once it's false that's enough for showing the page header and avatar.
  verified: boolean;
  isAuthenticated: boolean;
}

const UserContext = React.createContext<UserContextValue>({
  user: undefined,
  loading: true,
  loadingMe: true,
  verified: false,
  isAuthenticated: false,
});

const UserProvider: FC<{}> = ({ children }) => {
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();

  const { data: meData, loading: loadingMe } = useUserProviderQuery({
    skip: !isAuthenticated,
  });

  const { data: platformLevelAuthorizationData, loading: isLoadingPlatformLevelAuthorization } =
    usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated });
  const platformLevelAuthorization = platformLevelAuthorizationData?.platform.authorization;

  const [createUserProfile, { loading: loadingCreateUser, error }] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchUserProviderQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => {},
  });

  useEffect(() => {
    if (isAuthenticated && !loadingMe && !meData?.me?.user) {
      createUserProfile();
    }
  }, [meData?.me.user, loadingMe, createUserProfile, isAuthenticated]);

  const loading =
    loadingAuthentication ||
    loadingCreateUser ||
    loadingMe ||
    isLoadingPlatformLevelAuthorization ||
    (isAuthenticated && !meData?.me.user);

  const loadingMeAndParentQueries = loadingAuthentication || loadingMe;

  const userMetadata = useMemo(
    () => (meData?.me ? toUserMetadata(meData.me.user as User, platformLevelAuthorization) : undefined),
    [meData, platformLevelAuthorization]
  );

  const providedValue = useMemo<UserContextValue>(
    () => ({
      user: userMetadata,
      loading,
      loadingMe: loadingMeAndParentQueries,
      verified,
      isAuthenticated,
    }),
    [userMetadata, loading, loadingMeAndParentQueries, verified, isAuthenticated]
  );

  if (error) return <ErrorPage error={error} />;

  return <UserContext.Provider value={providedValue}>{children}</UserContext.Provider>;
};

export { UserProvider, UserContext };
