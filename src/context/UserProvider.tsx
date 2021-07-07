import React, { FC } from 'react';
import Loading from '../components/core/Loading';
import { useMembershipUserQuery, useMeQuery } from '../generated/graphql';
import { UserMetadata, useUserMetadataWrapper } from '../hooks/useUserMetadataWrapper';
import { UserMembershipDetailsFragment, User } from '../types/graphql-schema';

export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
}
const UserContext = React.createContext<UserContextContract>({
  user: undefined,
  loading: true,
});

const UserProvider: FC<{}> = ({ children }) => {
  const { data, loading: profileLoading } = useMeQuery({ errorPolicy: 'all' });
  const { me } = data || {};
  const wrapper = useUserMetadataWrapper();

  const loading = profileLoading;

  if (loading) return <Loading text={'Loading user'} />;
  return (
    <MembershipWrapper userId={me?.id || 'not-existing-ID'}>
      {membership => (
        <UserContext.Provider
          value={{
            user: wrapper(me as User, membership),
            loading,
          }}
        >
          {children}
        </UserContext.Provider>
      )}
    </MembershipWrapper>
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

export { UserProvider, UserContext };
