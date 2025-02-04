import React, { FC } from 'react';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';
import { useOrganizationInfoQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, OrganizationInfoFragment } from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';

type OrganizationContextProps = {
  organization?: OrganizationInfoFragment;
  organizationId: string;
  roleSetId: string;
  canReadUsers: boolean;
  displayName: string;
  loading: boolean;
};

const OrganizationContext = React.createContext<OrganizationContextProps>({
  loading: true,
  canReadUsers: false,
  organizationId: '',
  roleSetId: '',
  displayName: '',
});

const OrganizationProvider: FC = ({ children }) => {
  const { organizationId, loading: resolvingOrganization } = useUrlResolver();
  const { user, loading: isUserLoading } = useUserContext();
  const { data, loading: loadingOrganizationInfo } = useOrganizationInfoQuery({
    variables: {
      organizationId: organizationId!,
    },
    errorPolicy: 'all',
    skip: !organizationId || isUserLoading,
  });
  const organization = data?.lookup.organization;
  const displayName = organization?.profile.displayName || '';

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationId: organization?.id ?? '',
        roleSetId: organization?.roleSet.id ?? '',
        canReadUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
        displayName,
        loading: resolvingOrganization || isUserLoading || loadingOrganizationInfo,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export { OrganizationProvider, OrganizationContext };
