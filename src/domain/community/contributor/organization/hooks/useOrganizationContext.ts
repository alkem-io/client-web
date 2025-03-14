import { useContext } from 'react';
import { OrganizationContext } from '../context/OrganizationProvider';

export const useOrganizationContext = () => useContext(OrganizationContext);
