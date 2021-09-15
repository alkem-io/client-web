import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useChallengeInfoQuery } from '../hooks/generated/graphql';
import { ChallengeInfoFragment } from '../models/graphql-schema';

interface ChallengeContextProps {
  challenge?: ChallengeInfoFragment;
  challengeId: string;
  ecoverseId: string;
  loading: boolean;
}

const ChallengeContext = React.createContext<ChallengeContextProps>({
  loading: true,
  challengeId: '',
  ecoverseId: '',
});

interface UrlParams {
  ecoverseId: string;
  challengeId: string;
}

interface ChallengeProviderProps {}

const ChallengeProvider: FC<ChallengeProviderProps> = ({ children }) => {
  const { ecoverseId, challengeId } = useParams<UrlParams>();
  const { data, loading } = useChallengeInfoQuery({
    variables: { ecoverseId, challengeId },
    errorPolicy: 'all',
  });
  const challenge = data?.ecoverse?.challenge;

  return (
    <ChallengeContext.Provider
      value={{
        challenge,
        ecoverseId,
        challengeId,
        loading,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export { ChallengeProvider, ChallengeContext };
