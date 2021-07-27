import React, { FC, useEffect } from 'react';
import {
  refetchMeHasProfileQuery,
  useCreateUserNewRegistrationMutation,
  useMeHasProfileQuery,
  useMembershipUserQuery,
  useMeQuery,
} from '../components/generated/graphql';
import { useAuthenticationContext } from '../hooks';
import { UserMetadata, useUserMetadataWrapper } from '../hooks';
import { Error } from '../pages/Error';
import { User } from '../models/graphql-schema';
export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
  verified: boolean;
}
const UserContext = React.createContext<UserContextContract>({
  user: undefined,
  loading: true,
  verified: false,
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

  if (error) return <Error error={error} />;

  const wrappedMe = meData?.me ? wrapper(meData.me as User, membershipData?.membershipUser) : undefined;
  return (
    <UserContext.Provider
      value={{
        user: wrappedMe,
        loading,
        verified,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
