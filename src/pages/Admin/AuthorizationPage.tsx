import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../hooks/generated/graphql';
import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '..';
import Loading from '../../components/core/Loading';
import EditGlobalCredentials from '../../components/Admin/Authorization/EditGlobalCredentials';
import { AuthorizationCredential } from '../../models/graphql-schema';

interface AuthorizationPageProps extends PageProps {
  resourceId?: string;
}

interface Params {
  globalRole: AuthorizationCredential;
}

export const AuthorizationPage: FC<AuthorizationPageProps> = ({ paths, resourceId }) => {
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
      <EditGlobalCredentials credential={role} parentMembers={parentMembers} resourceId={resourceId} />;
    </Container>
  );
};
export default AuthorizationPage;
