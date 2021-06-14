import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '..';
import Loading from '../../components/core/Loading';
import EditCredentials from '../../components/Admin/Authorization/EditCredentials';
import { AuthorizationCredential } from '../../types/graphql-schema';

interface AuthorizationPageProps extends PageProps {}

interface Params {
  globalRole: AuthorizationCredential;
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
