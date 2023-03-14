import React, { FC, useMemo } from 'react';
import { useChallengeInfoQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, ChallengeInfoFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

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
  challengeNameId: string;
  communityId: string;
  hubId: string;
  hubNameId: string;
  loading: boolean;
  permissions: ChallengePermissions;
  profile: ChallengeInfoFragment['profile'];
}

const ChallengeContext = React.createContext<ChallengeContextProps>({
  loading: true,
  challengeId: '',
  challengeNameId: '',
  communityId: '',
  hubId: '',
  hubNameId: '',
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
  },
});

interface ChallengeProviderProps {}

const ChallengeProvider: FC<ChallengeProviderProps> = ({ children }) => {
  const { hubNameId = '', challengeNameId = '' } = useUrlParams();
  const { data, loading } = useChallengeInfoQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    skip: !hubNameId || !challengeNameId,
  });
  const hubId = data?.hub?.id || '';
  const challenge = data?.hub?.challenge;
  const challengeId = challenge?.id || '';
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
      tagset: challenge?.profile.tagset,
      visuals: challenge?.profile.visuals ?? [],
      tagline: challenge?.profile.tagline || '',
    };
  }, [challenge?.profile]);

  return (
    <ChallengeContext.Provider
      value={{
        challenge,
        challengeId,
        challengeNameId,
        communityId,
        hubId,
        hubNameId,
        permissions,
        profile,
        loading,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export { ChallengeProvider, ChallengeContext };
