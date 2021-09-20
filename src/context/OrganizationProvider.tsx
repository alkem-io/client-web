import React, { FC } from 'react';
import { useParams } from 'react-router';
import { OrganizationInfoFragment } from '../models/graphql-schema';
import { useOrganizationInfoQuery } from '../hooks/generated/graphql';

interface OrganizationContextProps {
  organization?: OrganizationInfoFragment;
  organizationId: string;
  organizationNameId: string;
  loading: boolean;
}

const OrganizationContext = React.createContext<OrganizationContextProps>({
  loading: true,
  organizationId: '',
  organizationNameId: '',
});

const OrganizationProvider: FC = ({ children }) => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { data, loading } = useOrganizationInfoQuery({
    variables: { organizationId },
    errorPolicy: 'all',
  });
  const organization = data?.organization;

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationId: organization?.id || '',
        organizationNameId: organization?.nameID || organizationId,
        loading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
export { OrganizationProvider, OrganizationContext };
