import React, { FC, useMemo } from 'react';
import { useChallengeInfoQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  ChallengeInfoFragment,
  CommunityMembershipStatus,
} from '../../../../core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

interface ChallengePermissions {
  canUpdate: boolean;
  canCreate: boolean;
  canCreateOpportunity: boolean;
  canReadCommunity: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface ChallengeContextProps {
  challenge?: ChallengeInfoFragment;
  challengeId: string;
  communityId: string;
  loading: boolean;
  permissions: ChallengePermissions;
  profile: ChallengeInfoFragment['profile'];
  myMembershipStatus: CommunityMembershipStatus | undefined;
}

const ChallengeContext = React.createContext<ChallengeContextProps>({
  loading: true,
  challengeId: '',
  communityId: '',
  permissions: {
    canUpdate: false,
    canCreate: false,
    canCreateOpportunity: false,
    canReadCommunity: false,
    contextPrivileges: [],
  },
  profile: {
    id: '',
    displayName: '',
    visuals: [],
    tagline: '',
    url: '',
  },
  myMembershipStatus: undefined,
});

interface ChallengeProviderProps {}

const ChallengeProvider: FC<ChallengeProviderProps> = ({ children }) => {
  const { challengeId } = useRouteResolver();

  const { data, loading } = useChallengeInfoQuery({
    variables: { challengeId: challengeId! },
    errorPolicy: 'all',
    skip: !challengeId,
  });

  const challenge = data?.lookup.challenge;
  const communityId = challenge?.community?.id ?? '';

  const myPrivileges = useMemo(
    () => challenge?.authorization?.myPrivileges ?? [],
    [challenge?.authorization?.myPrivileges]
  );
  const canReadCommunity = (challenge?.community?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const permissions = useMemo<ChallengePermissions>(
    () => ({
      canUpdate: myPrivileges.includes(AuthorizationPrivilege.Update),
      canCreate: myPrivileges.includes(AuthorizationPrivilege.Create),
      canCreateOpportunity: myPrivileges.includes(AuthorizationPrivilege.CreateOpportunity),
      canReadCommunity,
      contextPrivileges: challenge?.context?.authorization?.myPrivileges ?? [],
    }),
    [myPrivileges, challenge, canReadCommunity]
  );

  const profile = useMemo(() => {
    return {
      id: challenge?.profile.id ?? '',
      displayName: challenge?.profile.displayName || '',
      description: challenge?.profile.description,
      tagset: challenge?.profile.tagset,
      visuals: challenge?.profile.visuals ?? [],
      tagline: challenge?.profile.tagline || '',
      references: challenge?.profile.references ?? [],
      location: challenge?.profile.location,
      url: challenge?.profile.url ?? '',
    };
  }, [challenge?.profile]);

  return (
    <ChallengeContext.Provider
      value={{
        challenge,
        challengeId: challengeId ?? '',
        communityId,
        permissions,
        profile,
        loading,
        myMembershipStatus: challenge?.community?.myMembershipStatus,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export { ChallengeProvider, ChallengeContext };
