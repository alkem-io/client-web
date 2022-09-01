import { useContext } from 'react';
import { ChallengeContext } from '../context/ChallengeProvider';

export const useChallenge = () => useContext(ChallengeContext);
