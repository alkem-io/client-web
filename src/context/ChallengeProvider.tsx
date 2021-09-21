import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useChallengeInfoQuery } from '../hooks/generated/graphql';
import { ChallengeInfoFragment } from '../models/graphql-schema';

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

interface UrlParams {
  ecoverseId: string;
  challengeId: string;
}

interface ChallengeProviderProps {}

const ChallengeProvider: FC<ChallengeProviderProps> = ({ children }) => {
  const { ecoverseId: ecoverseNameId, challengeId: challengeNameId } = useParams<UrlParams>();
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
