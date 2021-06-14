import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../../generated/graphql';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
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

  useUpdateNavigation({ currentPaths });

  const { data: usersInfo, loading: loadingUsers } = useUsersQuery();
  const parentMembers = useMemo(() => usersInfo?.users || [], [usersInfo]);

  if (loadingUsers) {
    return <Loading />;
  }

  return (
    <Container>
      <EditCredentials credential={role} parentMembers={parentMembers} />;
    </Container>
  );
};
export default AuthorizationPage;
