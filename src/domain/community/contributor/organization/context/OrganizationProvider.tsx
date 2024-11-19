import React, { FC } from 'react';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { useOrganizationInfoQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, OrganizationInfoFragment } from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';

type OrganizationContextProps = {
  organization?: OrganizationInfoFragment;
  organizationId: string;
  organizationNameId: string | undefined;
  canReadUsers: boolean;
  displayName: string;
  loading: boolean;
};

const OrganizationContext = React.createContext<OrganizationContextProps>({
  loading: true,
  canReadUsers: false,
  organizationId: '',
  organizationNameId: '',
  displayName: '',
});

const OrganizationProvider: FC = ({ children }) => {
  const { organizationNameId } = useUrlParams();
  const { user, loading: isUserLoading } = useUserContext();
  const { data, loading: isOrganizationLoading } = useOrganizationInfoQuery({
    variables: {
      organizationId: organizationNameId!,
      includeAssociates: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
    },
    errorPolicy: 'all',
    skip: !organizationNameId || isUserLoading,
  });
  const organization = data?.organization;
  const displayName = organization?.profile.displayName || '';

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationId: organization?.id ?? '',
        organizationNameId: organization?.nameID ?? organizationNameId,
        canReadUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
        displayName,
        loading: isUserLoading || isOrganizationLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export { OrganizationProvider, OrganizationContext };
