import React, { FC, useEffect, useMemo } from 'react';
import {
  refetchMeHasProfileQuery,
  useCreateUserNewRegistrationMutation,
  useMeHasProfileQuery,
  useMeQuery,
  useRolesUserQuery,
} from '../../../../hooks/generated/graphql';
import { useAuthenticationContext } from '../../../../hooks';
import { UserMetadata, useUserMetadataWrapper } from '../../../../hooks';
import { ErrorPage } from '../../../../pages';
import { User } from '../../../../models/graphql-schema';
import { UserRolesInEntity } from './UserRolesInEntity';

export interface UserContextValue {
  user: UserMetadata | undefined;
  userHubRoles: UserRolesInEntity[] | undefined;
  loading: boolean;
  essentialsLoaded: boolean; // Loaded Authentication and Profile data, enough for showing the page header, but f.e. roles information is not guaranteed.
  verified: boolean;
  isAuthenticated: boolean;
}

const UserContext = React.createContext<UserContextValue>({
  user: undefined,
  userHubRoles: undefined,
  loading: true,
  essentialsLoaded: false,
  verified: false,
  isAuthenticated: false,
});

const UserProvider: FC<{}> = ({ children }) => {
  const wrapper = useUserMetadataWrapper();
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();
  const { data: meHasProfileData, loading: loadingMeHasProfile } = useMeHasProfileQuery({ skip: !isAuthenticated });
  const { data: meData, loading: loadingMe } = useMeQuery({
    skip: !meHasProfileData?.meHasProfile,
  });

  const { data: rolesData, loading: loadingRolesData } = useRolesUserQuery({
    skip: !meData?.me.id,
    variables: {
      input: {
        userID: meData?.me.id!,
      },
    },
  });

  const [createUserProfile, { loading: loadingCreateUser, error }] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchMeHasProfileQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => {},
  });

  useEffect(() => {
    if (isAuthenticated && meHasProfileData && !meHasProfileData.meHasProfile) {
      createUserProfile();
    }
  }, [meHasProfileData]);

  const loading =
    loadingAuthentication ||
    loadingMeHasProfile ||
    loadingCreateUser ||
    loadingMe ||
    loadingRolesData ||
    (isAuthenticated && !meHasProfileData?.meHasProfile);

  const essentialsLoaded = !loadingAuthentication && !loadingMeHasProfile && !loadingMe;

  const wrappedMe = useMemo(
    () => (meData?.me ? wrapper(meData.me as User, rolesData?.rolesUser) : undefined),
    [meData, rolesData, wrapper]
  );

  const providedValue = useMemo<UserContextValue>(
    () => ({
      user: wrappedMe,
      userHubRoles: rolesData?.rolesUser.hubs,
      loading,
      essentialsLoaded,
      verified,
      isAuthenticated,
    }),
    [wrappedMe, rolesData, loading, essentialsLoaded, verified, isAuthenticated]
  );

  if (error) return <ErrorPage error={error} />;

  return <UserContext.Provider value={providedValue}>{children}</UserContext.Provider>;
};

export { UserProvider, UserContext };
