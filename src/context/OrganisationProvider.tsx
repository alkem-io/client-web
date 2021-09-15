import React, { FC } from 'react';
import { useParams } from 'react-router';
import { OrganisationInfoFragment } from '../models/graphql-schema';
import { useOrganisationInfoQuery } from '../hooks/generated/graphql';

interface OrganisationContextProps {
  organisation?: OrganisationInfoFragment;
  organisationId: string;
  loading: boolean;
}

const OrganisationContext = React.createContext<OrganisationContextProps>({
  loading: true,
  organisationId: '',
});

const OrganisationProvider: FC = ({ children }) => {
  const { organisationId } = useParams<{ organisationId: string }>();
  const { data, loading } = useOrganisationInfoQuery({
    variables: { organisationId },
    errorPolicy: 'all',
  });
  const organisation = data?.organisation;

  return (
    <OrganisationContext.Provider
      value={{
        organisation,
        organisationId,
        loading,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
};
export { OrganisationProvider, OrganisationContext };
