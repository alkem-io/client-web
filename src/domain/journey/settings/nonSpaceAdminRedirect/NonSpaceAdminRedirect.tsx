import React, { PropsWithChildren } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useSpacePrivilegesQuery } from '@/core/apollo/generated/apollo-hooks';
import NonAdminRedirect from '../../../../main/admin/NonAdminRedirect';

interface NonSpaceAdminRedirectProps {
  spaceId: string | undefined;
}

const NonSpaceAdminRedirect = ({ spaceId, children }: PropsWithChildren<NonSpaceAdminRedirectProps>) => {
  const { data, loading: isLoadingPrivileges } = useSpacePrivilegesQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  return (
    <NonAdminRedirect
      privileges={data?.lookup.space?.authorization?.myPrivileges}
      adminPrivilege={AuthorizationPrivilege.Update} // Space admins don't have ADMIN privilege for the space for now
      loading={isLoadingPrivileges || !spaceId}
    >
      {children}
    </NonAdminRedirect>
  );
};

export default NonSpaceAdminRedirect;
