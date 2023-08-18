import React, { FC, useEffect, useMemo } from 'react';
import {
  refetchMeQuery,
  useCreateUserNewRegistrationMutation,
  useMeQuery,
  usePlatformLevelAuthorizationQuery,
  useRolesUserQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { ErrorPage } from '../../../../../core/pages/Errors/ErrorPage';
import {
  ApplicationForRoleResult,
  InvitationForRoleResult,
  User,
} from '../../../../../core/apollo/generated/graphql-schema';
import { UserRolesInEntity } from './UserRolesInEntity';
import { useAuthenticationContext } from '../../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { toUserMetadata, UserMetadata } from '../../hooks/useUserMetadataWrapper';

export interface UserContextValue {
  user: UserMetadata | undefined;
  userSpaceRoles: UserRolesInEntity[] | undefined;
  loading: boolean;
  loadingMe: boolean; // Loading Authentication and Profile data. Once it's false that's enough for showing the page header and avatar but f.e. roles information is not guaranteed yet.
  verified: boolean;
  isAuthenticated: boolean;
}

const UserContext = React.createContext<UserContextValue>({
  user: undefined,
  userSpaceRoles: undefined,
  loading: true,
  loadingMe: true,
  verified: false,
  isAuthenticated: false,
});

const UserProvider: FC<{}> = ({ children }) => {
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();
  // TODO "me" query fetches too much beyond user name
  const { data: meData, loading: loadingMe } = useMeQuery({
    skip: !isAuthenticated,
  });

  const { data: rolesData, loading: loadingRolesData } = useRolesUserQuery({
    skip: !meData?.me.user?.id,
    variables: {
      input: meData?.me.user?.id!,
    },
  });

  const { data: platformLevelAuthorizationData } = usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated });
  const platformLevelAuthorization = platformLevelAuthorizationData?.platform.authorization;

  const [createUserProfile, { loading: loadingCreateUser, error }] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchMeQuery()],
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
    loadingRolesData ||
    (isAuthenticated && !meData?.me.user);

  const loadingMeAndParentQueries = loadingAuthentication || loadingMe;

  const userMetadata = useMemo(
    () =>
      meData?.me
        ? toUserMetadata(
            meData.me.user as User,
            meData.me.applications as ApplicationForRoleResult[],
            meData.me.invitations as InvitationForRoleResult[],
            rolesData?.rolesUser,
            platformLevelAuthorization
          )
        : undefined,
    [meData, rolesData, platformLevelAuthorization]
  );

  const providedValue = useMemo<UserContextValue>(
    () => ({
      user: userMetadata,
      userSpaceRoles: rolesData?.rolesUser.spaces,
      loading,
      loadingMe: loadingMeAndParentQueries,
      verified,
      isAuthenticated,
    }),
    [userMetadata, rolesData, loading, loadingMeAndParentQueries, verified, isAuthenticated]
  );

  if (error) return <ErrorPage error={error} />;

  return <UserContext.Provider value={providedValue}>{children}</UserContext.Provider>;
};

export { UserProvider, UserContext };
