import React, { FC } from 'react';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { useOrganizationInfoQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, OrganizationInfoFragment } from '../../../../../core/apollo/generated/graphql-schema';
import useHasPlatformLevelPrivilege from '../../user/PlatformLevelAuthorization/useHasPlatformLevelPrivilege';

interface OrganizationContextProps {
  organization?: OrganizationInfoFragment;
  organizationId: string;
  organizationNameId: string;
  canReadUsers: boolean;
  displayName: string;
  loading: boolean;
}

const OrganizationContext = React.createContext<OrganizationContextProps>({
  loading: true,
  canReadUsers: false,
  organizationId: '',
  organizationNameId: '',
  displayName: '',
});

const OrganizationProvider: FC = ({ children }) => {
  const { organizationNameId: organizationId = '' } = useUrlParams();
  const canReadUsers = useHasPlatformLevelPrivilege(AuthorizationPrivilege.ReadUsers);
  const { data, loading } = useOrganizationInfoQuery({
    variables: {
      organizationId,
      includeAssociates: canReadUsers,
    },
    errorPolicy: 'all',
    skip: typeof canReadUsers === 'undefined',
  });
  const organization = data?.organization;
  const displayName = organization?.profile.displayName || '';

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationId: organization?.id || '',
        organizationNameId: organization?.nameID || organizationId,
        canReadUsers: canReadUsers ?? false,
        displayName,
        loading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export { OrganizationProvider, OrganizationContext };
