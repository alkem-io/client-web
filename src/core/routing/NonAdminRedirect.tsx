import React, { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../ui/loading/Loading';
import { AuthorizationPrivilege } from '../apollo/generated/graphql-schema';
import useHasPlatformLevelPrivilege from '../../domain/community/contributor/user/PlatformLevelAuthorization/useHasPlatformLevelPrivilege';

const NonAdminRedirect: FC = ({ children }) => {
  const { pathname } = useLocation();

  const [isAdmin, { loading: isLoadingPrivileges }] = useHasPlatformLevelPrivilege(AuthorizationPrivilege.Admin);

  if (isLoadingPrivileges) {
    return <Loading text="Loading user configuration" />;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return <Navigate to={`/restricted?origin=${encodeURI(pathname)}`} />;
};

export default NonAdminRedirect;
