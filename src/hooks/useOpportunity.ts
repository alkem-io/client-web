import { useContext, useMemo } from 'react';
import { OpportunityContext, OpportunityContextProps } from '../context/OpportunityProvider/OpportunityProvider';

export const useOpportunity = (): OpportunityContextProps => {
  const context = useContext(OpportunityContext);
  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
