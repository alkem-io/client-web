import { useContext, useMemo } from 'react';
import { OpportunityContext } from '../context/OpportunityProvider/OpportunityProvider';

export const useOpportunity = () => {
  const context = useContext(OpportunityContext);
  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
