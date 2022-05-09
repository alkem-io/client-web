import { useContext, useMemo } from 'react';
import { OrganizationContext } from '../context/OrganizationProvider';

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
