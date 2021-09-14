import { useContext, useMemo } from 'react';
import { OrganisationContext } from '../context/OrganisationProvider';

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
