import { useContext } from 'react';
import { OrganizationContext } from '../context/OrganizationProvider';

export const useOrganization = () => useContext(OrganizationContext);
