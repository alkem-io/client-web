import { useContext } from 'react';
import { OpportunityContext } from '../context/OpportunityProvider';

/**
 * @deprecated
 */
export const useOpportunity = () => useContext(OpportunityContext);
