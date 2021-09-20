import React, { FC } from 'react';
import { OrganisationInfoFragment } from '../models/graphql-schema';
import { useOrganisationInfoQuery } from '../hooks/generated/graphql';
import { useUrlParams } from '../hooks';

interface OrganisationContextProps {
  organisation?: OrganisationInfoFragment;
  organizationId: string;
  loading: boolean;
}

const OrganisationContext = React.createContext<OrganisationContextProps>({
  loading: true,
  organizationId: '',
});

const OrganisationProvider: FC = ({ children }) => {
  const { organizationId } = useUrlParams();
  const { data, loading } = useOrganisationInfoQuery({
    variables: { organisationId: organizationId },
    errorPolicy: 'all',
  });
  const organisation = data?.organisation;

  return (
    <OrganisationContext.Provider
      value={{
        organisation,
        organizationId,
        loading,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
};
export { OrganisationProvider, OrganisationContext };
