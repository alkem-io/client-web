import { useContext } from 'react';
import { OpportunityContext } from '../context/OpportunityProvider';

export const useOpportunity = () => useContext(OpportunityContext);
