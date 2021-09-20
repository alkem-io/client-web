import React, { FC } from 'react';
import { useChallengeInfoQuery } from '../hooks/generated/graphql';
import { ChallengeInfoFragment } from '../models/graphql-schema';
import { useUrlParams } from '../hooks';

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

interface ChallengeProviderProps {}

const ChallengeProvider: FC<ChallengeProviderProps> = ({ children }) => {
  const { ecoverseId, challengeId } = useUrlParams();
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
