import { useOrganizationInfoQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, OrganizationInfoFragment } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import React, { PropsWithChildren } from 'react';

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

const OrganizationProvider = ({ children }: PropsWithChildren) => {
  const { organizationId, loading: resolvingOrganization } = useUrlResolver();
  const { platformPrivilegeWrapper: userWrapper, loading: isUserLoading } = useCurrentUserContext();
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
    <OrganizationContext
      value={{
        organization,
        organizationId: organization?.id ?? '',
        roleSetId: organization?.roleSet.id ?? '',
        canReadUsers: userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
        displayName,
        loading: resolvingOrganization || isUserLoading || loadingOrganizationInfo,
      }}
    >
      {children}
    </OrganizationContext>
  );
};

export { OrganizationContext, OrganizationProvider };
