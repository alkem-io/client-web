import { useContext, useMemo } from 'react';
import { ChallengeContext } from '../context/ChallengeProvider';

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
