import { useContext } from 'react';
import { ChallengeContext } from '../context/SubspaceProvider';

export const useChallenge = () => useContext(ChallengeContext);
