import React, { FC } from 'react';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { useOrganizationInfoQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, OrganizationInfoFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useUserContext } from '../../../user/hooks/useUserContext';

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
  const { user } = useUserContext();
  const { data, loading: loadingOrganization } = useOrganizationInfoQuery({
    variables: {
      organizationId,
      includeAssociates: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) || false,
    },
    errorPolicy: 'all',
    skip: typeof user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) === 'undefined',
  });
  const organization = data?.organization;
  const displayName = organization?.profile.displayName || '';

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationId: organization?.id || '',
        organizationNameId: organization?.nameID || organizationId,
        canReadUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) || false,
        displayName,
        loading: loadingOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export { OrganizationProvider, OrganizationContext };
