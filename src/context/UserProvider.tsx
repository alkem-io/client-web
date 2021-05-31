import React, { FC, useMemo } from 'react';
import Loading from '../components/core/Loading';
import { useMembershipQuery, useMeQuery } from '../generated/graphql';
import { UserMetadata, useUserMetadataWrapper } from '../hooks/useUserMetadataWrapper';
import { Membership, User } from '../types/graphql-schema';

export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
  isAuthenticated: boolean;
}
const UserContext = React.createContext<UserContextContract>({
  user: undefined,
  loading: true,
  isAuthenticated: false,
});

const UserProvider: FC<{}> = ({ children }) => {
  const { data, loading: profileLoading } = useMeQuery({ errorPolicy: 'all' });
  const { me } = data || {};
  const wrapper = useUserMetadataWrapper();
  const isAuthenticated = useMemo(() => Boolean(me?.id), [me]);

  const loading = profileLoading;

  if (loading) return <Loading text={'Loading user'} />;
  return (
    <MembershipWrapper userId={me?.id || 'not-existing-ID'}>
      {membership => (
        <UserContext.Provider
          value={{
            user: wrapper(me as User, membership),
            isAuthenticated,
            loading,
          }}
        >
          {children}
        </UserContext.Provider>
      )}
    </MembershipWrapper>
  );
};

const MembershipWrapper: FC<{ userId: string; children: (membership?: Membership) => React.ReactNode }> = ({
  userId,
  children,
}) => {
  const { data: membershipData, loading: loadingMembership } = useMembershipQuery({
    variables: { input: { userID: userId } },
    errorPolicy: 'all',
    onError: () => {
      //No Op
    },
  });
  if (loadingMembership) return <Loading text={'Loading membership'} />;
  return <>{children(membershipData?.membership)}</>;
};

export { UserProvider, UserContext };
