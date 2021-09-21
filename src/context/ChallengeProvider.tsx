import React, { FC } from 'react';
import { useChallengeInfoQuery } from '../hooks/generated/graphql';
import { ChallengeInfoFragment } from '../models/graphql-schema';
import { useUrlParams } from '../hooks';

interface ChallengeContextProps {
  challenge?: ChallengeInfoFragment;
  challengeId: string;
  challengeNameId: string;
  ecoverseId: string;
  ecoverseNameId: string;
  loading: boolean;
}

const ChallengeContext = React.createContext<ChallengeContextProps>({
  loading: true,
  challengeId: '',
  challengeNameId: '',
  ecoverseId: '',
  ecoverseNameId: '',
});

interface ChallengeProviderProps {}

const ChallengeProvider: FC<ChallengeProviderProps> = ({ children }) => {
  const { ecoverseNameId, challengeNameId } = useUrlParams();
  const { data, loading } = useChallengeInfoQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId || !challengeNameId,
  });
  const ecoverseId = data?.ecoverse?.id || '';
  const challenge = data?.ecoverse?.challenge;
  const challengeId = challenge?.id || '';

  return (
    <ChallengeContext.Provider
      value={{
        challenge,
        challengeId,
        challengeNameId,
        ecoverseId,
        ecoverseNameId,
        loading,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export { ChallengeProvider, ChallengeContext };
