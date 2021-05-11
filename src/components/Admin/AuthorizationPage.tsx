import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useRouteMatch } from 'react-router-dom';
import {
  useGrantCredentialsMutation,
  useRevokeCredentialsMutation,
  UsersWithCredentialsDocument,
  useUsersQuery,
  useUsersWithCredentialsQuery,
} from '../../generated/graphql';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { Member } from '../../models/User';
import { PageProps } from '../../pages';
import { credentialsResolver } from '../../utils/credentials-resolver';
import Loading from '../core/Loading';
import EditMembers from './Community/EditMembers';

interface AuthorizationPageProps extends PageProps {}

interface Params {
  globalRole: string;
}

export const AuthorizationPage: FC<AuthorizationPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { globalRole: role } = useParams<Params>();
  const currentPaths = useMemo(() => [...paths, { value: url, name: role, real: true }], [paths]);
  const handleError = useApolloErrorHandler();

  const [grant] = useGrantCredentialsMutation({
    onError: handleError,
  });

  const [revoke] = useRevokeCredentialsMutation({
    onError: handleError,
  });

  const { data, loading: loadingMembers } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: credentialsResolver(role),
      },
    },
  });
  const { data: usersInfo, loading: loadingUsers } = useUsersQuery();
  useUpdateNavigation({ currentPaths });

  const parentMembers = useMemo(() => usersInfo?.users || [], [usersInfo]);
  const members = useMemo(() => data?.usersWithAuthorizationCredential || [], [data]);

  const handleAdd = (_member: Member) => {
    grant({
      variables: {
        input: {
          userID: Number(_member.id),
          type: credentialsResolver(role),
        },
      },
      refetchQueries: [
        { query: UsersWithCredentialsDocument, variables: { input: { type: credentialsResolver(role) } } },
      ],
      awaitRefetchQueries: true,
    });
  };

  const handleRemove = (_member: Member) => {
    revoke({
      variables: {
        input: {
          userID: Number(_member.id),
          type: credentialsResolver(role),
        },
      },
      refetchQueries: [
        { query: UsersWithCredentialsDocument, variables: { input: { type: credentialsResolver(role) } } },
      ],
      awaitRefetchQueries: true,
    });
  };
  const availableMembers = useMemo(() => {
    return parentMembers.filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [parentMembers, members]);

  if (loadingMembers || loadingUsers) {
    return <Loading />;
  }
  return (
    <Container>
      <EditMembers members={members} availableMembers={availableMembers} onAdd={handleAdd} onRemove={handleRemove} />
    </Container>
  );
};
export default AuthorizationPage;
