import React, { FC, useEffect, useMemo } from 'react';
import {
  refetchMeHasProfileQuery,
  useCreateUserNewRegistrationMutation,
  useMeHasProfileQuery,
  useMeQuery,
  usePlatformLevelAuthorizationQuery,
  useRolesUserQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { ErrorPage } from '../../../../../../core/pages/Errors/ErrorPage';
import { User } from '../../../../../../core/apollo/generated/graphql-schema';
import { UserRolesInEntity } from './UserRolesInEntity';
import { useAuthenticationContext } from '../../../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { UserMetadata, useUserMetadataWrapper } from '../../hooks/useUserMetadataWrapper';

export interface UserContextValue {
  user: UserMetadata | undefined;
  userHubRoles: UserRolesInEntity[] | undefined;
  loading: boolean;
  loadingMe: boolean; // Loading Authentication and Profile data. Once it's false that's enough for showing the page header and avatar but f.e. roles information is not guaranteed yet.
  verified: boolean;
  isAuthenticated: boolean;
}

const UserContext = React.createContext<UserContextValue>({
  user: undefined,
  userHubRoles: undefined,
  loading: true,
  loadingMe: true,
  verified: false,
  isAuthenticated: false,
});

const UserProvider: FC<{}> = ({ children }) => {
  const wrapper = useUserMetadataWrapper();
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();
  const { data: meHasProfileData, loading: loadingMeHasProfile } = useMeHasProfileQuery({ skip: !isAuthenticated });
  // TODO "me" query fetches too much beyond user name
  const { data: meData, loading: loadingMe } = useMeQuery({
    skip: !meHasProfileData?.meHasProfile,
  });

  const { data: rolesData, loading: loadingRolesData } = useRolesUserQuery({
    skip: !meData?.me.id,
    variables: {
      input: meData?.me.id!,
    },
  });

  const { data: platformLevelAuthorizationData } = usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated });
  const platformLevelAuthorization = platformLevelAuthorizationData?.authorization;

  const [createUserProfile, { loading: loadingCreateUser, error }] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchMeHasProfileQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => {},
  });

  useEffect(() => {
    if (isAuthenticated && meHasProfileData && !meHasProfileData.meHasProfile) {
      createUserProfile();
    }
  }, [meHasProfileData, createUserProfile, isAuthenticated]);

  const loading =
    loadingAuthentication ||
    loadingMeHasProfile ||
    loadingCreateUser ||
    loadingMe ||
    loadingRolesData ||
    (isAuthenticated && !meHasProfileData?.meHasProfile);

  const loadingMeAndParentQueries = loadingAuthentication || loadingMeHasProfile || loadingMe;

  const wrappedMe = useMemo(
    () => (meData?.me ? wrapper(meData.me as User, rolesData?.rolesUser, platformLevelAuthorization) : undefined),
    [meData, rolesData, wrapper, platformLevelAuthorization]
  );

  const providedValue = useMemo<UserContextValue>(
    () => ({
      user: wrappedMe,
      userHubRoles: rolesData?.rolesUser.hubs,
      loading,
      loadingMe: loadingMeAndParentQueries,
      verified,
      isAuthenticated,
    }),
    [wrappedMe, rolesData, loading, loadingMeAndParentQueries, verified, isAuthenticated]
  );

  if (error) return <ErrorPage error={error} />;

  return <UserContext.Provider value={providedValue}>{children}</UserContext.Provider>;
};

export { UserProvider, UserContext };
