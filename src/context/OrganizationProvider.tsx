import React, { FC } from 'react';
import { useUrlParams } from '../hooks';
import { useOrganizationInfoQuery } from '../hooks/generated/graphql';
import { OrganizationInfoFragment } from '../models/graphql-schema';

interface OrganizationContextProps {
  organization?: OrganizationInfoFragment;
  organizationId: string;
  organizationNameId: string;
  displayName: string;
  loading: boolean;
}

const OrganizationContext = React.createContext<OrganizationContextProps>({
  loading: true,
  organizationId: '',
  organizationNameId: '',
  displayName: '',
});

const OrganizationProvider: FC = ({ children }) => {
  const { organizationNameId: organizationId } = useUrlParams();
  const { data, loading } = useOrganizationInfoQuery({
    variables: { organizationId },
    errorPolicy: 'all',
  });
  const organization = data?.organization;
  const displayName = data?.organization.displayName || '';

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationId: organization?.id || '',
        organizationNameId: organization?.nameID || organizationId,
        displayName,
        loading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
export { OrganizationProvider, OrganizationContext };
