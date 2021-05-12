import React, { FC, useMemo } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../../generated/graphql';
import { PageProps } from '../../../pages';
import Loading from '../../core/Loading';
import EditCredentials from './EditCredentials';

interface AuthorizationPageProps extends PageProps {}

interface Params {
  globalRole: string;
}

export const AuthorizationPage: FC<AuthorizationPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { globalRole: role } = useParams<Params>();
  const currentPaths = useMemo(() => [...paths, { value: url, name: role, real: true }], [paths]);

  const { data: usersInfo, loading: loadingUsers } = useUsersQuery();
  const parentMembers = useMemo(() => usersInfo?.users || [], [usersInfo]);

  if (loadingUsers) {
    return <Loading />;
  }

  return <EditCredentials paths={currentPaths} credential={role} parentMembers={parentMembers} />;
};
export default AuthorizationPage;
