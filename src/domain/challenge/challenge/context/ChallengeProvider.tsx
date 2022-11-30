import React, { FC, useMemo } from 'react';
import { useChallengeInfoQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, ChallengeInfoFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../../hooks';

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
  hubId: string;
  hubNameId: string;
  displayName: string;
  loading: boolean;
  permissions: ChallengePermissions;
}

const ChallengeContext = React.createContext<ChallengeContextProps>({
  loading: true,
  challengeId: '',
  challengeNameId: '',
  hubId: '',
  hubNameId: '',
  displayName: '',
  permissions: {
    canUpdate: false,
    canCreate: false,
    canCreateOpportunity: false,
    canReadCommunity: false,
    contextPrivileges: [],
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
  const displayName = challenge?.displayName || '';

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

  return (
    <ChallengeContext.Provider
      value={{
        challenge,
        challengeId,
        challengeNameId,
        hubId,
        hubNameId,
        permissions,
        displayName,
        loading,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export { ChallengeProvider, ChallengeContext };
