import React, { FC, useCallback, useEffect } from 'react';
import { ReactNode } from 'react-markdown';
import Loading from '../components/core/Loading';
import {
  refetchMeQuery,
  useCreateUserNewRegistrationMutation,
  useMeHasProfileQuery,
  useMembershipUserQuery,
  useMeQuery,
} from '../generated/graphql';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { UserMetadata, useUserMetadataWrapper } from '../hooks/useUserMetadataWrapper';
import { Error } from '../pages/Error';
import { User, UserMembershipDetailsFragment } from '../types/graphql-schema';
export interface UserContextContract {
  user: UserMetadata | undefined;
}
const UserContext = React.createContext<UserContextContract>({
  user: undefined,
});

const UserProvider: FC<{}> = ({ children }) => {
  const wrapper = useUserMetadataWrapper();
  const { isAuthenticated, loading } = useAuthenticationContext();
  const getProvider = useCallback((me?: User, membership?: UserMembershipDetailsFragment) => {
    const wrappedMe = me ? wrapper(me as User, membership) : undefined;
    return (
      <UserContext.Provider
        value={{
          user: wrappedMe,
        }}
      >
        {children}
      </UserContext.Provider>
    );
  }, []);

  if (loading) return <Loading text={'Check session'} />;

  if (!isAuthenticated) return getProvider();

  return (
    <EnsureUserProfileExists>
      <UserLoader>
        {me => {
          if (me) {
            return <MembershipWrapper userId={me.id}>{membership => getProvider(me, membership)}</MembershipWrapper>;
          }
          return getProvider();
        }}
      </UserLoader>
    </EnsureUserProfileExists>
  );
};

const MembershipWrapper: FC<{
  userId: string;
  children: (membership?: UserMembershipDetailsFragment) => React.ReactNode;
}> = ({ userId, children }) => {
  const { data: membershipData, loading: loadingMembership } = useMembershipUserQuery({
    variables: { input: { userID: userId } },
    errorPolicy: 'all',
    onError: () => {
      // because reset store can crash - error needs to be consumed
    },
  });
  if (loadingMembership) return <Loading text={'Loading membership'} />;
  return <>{children(membershipData?.membershipUser)}</>;
};

const UserLoader: FC<{
  children: (me?: User) => ReactNode;
}> = ({ children }) => {
  const { data, loading: profileLoading } = useMeQuery({ errorPolicy: 'all' });
  const { me } = data || {};
  if (profileLoading) return <Loading text={'Loading user profile'} />;
  return <>{children(me as User)} </>;
};

const EnsureUserProfileExists: FC = ({ children }) => {
  const { data, loading: loadingMe } = useMeHasProfileQuery();
  const [createUser, { loading, error }] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchMeQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => {},
  });

  useEffect(() => {
    if (data) {
      if (data.meHasProfile) {
      } else {
        createUser();
      }
    }
  }, [data]);

  if (loading || loadingMe) return <Loading text={'Initializing user profile ...'} />;
  if (error) return <Error error={error} />;
  return <>{children}</>;
};

export { UserProvider, UserContext };
