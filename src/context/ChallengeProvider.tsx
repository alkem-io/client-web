import React, { FC, useMemo } from 'react';
import { useChallengeInfoQuery } from '../hooks/generated/graphql';
import { AuthorizationPrivilege, ChallengeInfoFragment } from '../models/graphql-schema';
import { useUrlParams } from '../hooks';

interface ChallengePermissions {
  viewerCanUpdate: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface ChallengeContextProps {
  challenge?: ChallengeInfoFragment;
  challengeId: string;
  challengeNameId: string;
  ecoverseId: string;
  ecoverseNameId: string;
  displayName: string;
  loading: boolean;
  permissions: ChallengePermissions;
}

const ChallengeContext = React.createContext<ChallengeContextProps>({
  loading: true,
  challengeId: '',
  challengeNameId: '',
  ecoverseId: '',
  ecoverseNameId: '',
  displayName: '',
  permissions: {
    viewerCanUpdate: false,
    contextPrivileges: [],
  },
});

interface ChallengeProviderProps {}

const ChallengeProvider: FC<ChallengeProviderProps> = ({ children }) => {
  const { ecoverseNameId = '', challengeNameId = '' } = useUrlParams();
  const { data, loading } = useChallengeInfoQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId || !challengeNameId,
  });
  const ecoverseId = data?.ecoverse?.id || '';
  const challenge = data?.ecoverse?.challenge;
  const challengeId = challenge?.id || '';
  const displayName = challenge?.displayName || '';

  const permissions = useMemo<ChallengePermissions>(
    () => ({
      viewerCanUpdate: challenge?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
      contextPrivileges: challenge?.context?.authorization?.myPrivileges ?? [],
    }),
    [challenge]
  );

  return (
    <ChallengeContext.Provider
      value={{
        challenge,
        challengeId,
        challengeNameId,
        ecoverseId,
        ecoverseNameId,
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
