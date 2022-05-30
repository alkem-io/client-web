import React, { FC, useEffect, useMemo } from 'react';
import {
  refetchMeHasProfileQuery,
  useCreateUserNewRegistrationMutation,
  useMeHasProfileQuery,
  useMembershipUserQuery,
  useMeQuery,
} from '../hooks/generated/graphql';
import { useAuthenticationContext } from '../hooks';
import { UserMetadata, useUserMetadataWrapper } from '../hooks';
import { ErrorPage } from '../pages';
import { User } from '../models/graphql-schema';
export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
  verified: boolean;
  isAuthenticated: boolean;
}
const UserContext = React.createContext<UserContextContract>({
  user: undefined,
  loading: true,
  verified: false,
  isAuthenticated: false,
});

const UserProvider: FC<{}> = ({ children }) => {
  const wrapper = useUserMetadataWrapper();
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();
  const { data: meHasProfileData, loading: LoadingMeHasProfile } = useMeHasProfileQuery({ skip: !isAuthenticated });
  const { data: meData, loading: loadingMe } = useMeQuery({
    skip: !meHasProfileData?.meHasProfile,
  });

  const { data: membershipData, loading: loadingMembershipData } = useMembershipUserQuery({
    skip: !meData?.me.id,
    variables: {
      input: {
        userID: meData?.me.id || '',
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
    LoadingMeHasProfile ||
    loadingCreateUser ||
    loadingMe ||
    loadingMembershipData ||
    (isAuthenticated && !meHasProfileData?.meHasProfile);

  const wrappedMe = useMemo(
    () => (meData?.me ? wrapper(meData.me as User, membershipData?.membershipUser) : undefined),
    [meData, membershipData, wrapper]
  );

  const providedValue = useMemo(
    () => ({
      user: wrappedMe,
      loading,
      verified,
      isAuthenticated,
    }),
    [wrappedMe, loading, verified, isAuthenticated]
  );

  if (error) return <ErrorPage error={error} />;

  return <UserContext.Provider value={providedValue}>{children}</UserContext.Provider>;
};

export { UserProvider, UserContext };
