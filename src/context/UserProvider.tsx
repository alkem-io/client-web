import React, { FC } from 'react';
import { User, useMeQuery } from '../generated/graphql';
import { CommunityType } from '../models/Constants';

export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
}

export interface UserMetadata {
  user: User;
  ofGroup: (name: string, strict: boolean) => boolean;
  ofChallenge: (name: string) => boolean;
  isAdmin: boolean;
  roles: string[];
}

const wrapUser = (user: User | undefined): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const metadata = {
    user,
    ofGroup: (name, strict = true) =>
      Boolean(
        user.memberof?.communities.find(
          c => c && c.groups && c.groups.find(x => (strict ? x.name === name : x.name.includes(name)) !== undefined)
        )
      ),
    ofChallenge: name =>
      Boolean(user.memberof?.communities.find(c => c && c.type === CommunityType.CHALLENGE && c.name === name)),
    isAdmin: false,
    roles:
      user?.memberof?.communities
        .flatMap(c => c.groups?.map(g => g.name))
        .filter((x): x is string => x !== undefined) || [],
  };

  metadata.isAdmin = metadata.ofGroup('admin', false);

  return metadata;
};

const UserContext = React.createContext<UserContextContract>({
  user: undefined,
  loading: true,
});

const UserProvider: FC<{}> = ({ children }) => {
  const { data, loading: profileLoading } = useMeQuery({ errorPolicy: 'all' });
  const { me } = data || {};
  const loading = profileLoading; //|| status === 'authenticating' || status === 'refreshing';

  return (
    <UserContext.Provider
      value={{
        user: wrapUser(me as User),
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
