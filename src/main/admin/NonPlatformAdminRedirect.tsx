import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { FC, PropsWithChildren } from 'react';
import NonAdminRedirect from './NonAdminRedirect';

const NonPlatformAdminRedirect: FC<PropsWithChildren> = ({ children }) => {
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
