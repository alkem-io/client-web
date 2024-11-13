import React, { FC } from 'react';
import { AuthorizationPrivilege } from '@core/apollo/generated/graphql-schema';
import { usePlatformLevelAuthorizationQuery } from '@core/apollo/generated/apollo-hooks';
import NonAdminRedirect from './NonAdminRedirect';

const NonPlatformAdminRedirect: FC = ({ children }) => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  return (
    <NonAdminRedirect
      privileges={data?.platform.authorization?.myPrivileges}
      loading={loading}
      adminPrivilege={AuthorizationPrivilege.PlatformAdmin}
    >
      {children}
    </NonAdminRedirect>
  );
};

export default NonPlatformAdminRedirect;
