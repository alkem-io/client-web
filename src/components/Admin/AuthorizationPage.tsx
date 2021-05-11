import React, { FC, useMemo } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useUsersQuery, useUsersWithCredentialsQuery } from '../../generated/graphql';
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
    // addUser({
    //   variables: {
    //     input: {
    //       groupID: Number(groupId),
    //       userID: Number(member.id),
    //     },
    //   },
    //   refetchQueries: ['groupMembers'],
    //   awaitRefetchQueries: true,
    // });
  };
  const handleRemove = (_member: Member) => {
    // removeUser({
    //   variables: {
    //     input: {
    //       groupID: Number(groupId),
    //       userID: Number(member.id),
    //     },
    //   },
    //   refetchQueries: ['groupMembers'],
    //   awaitRefetchQueries: true,
    // });
  };
  const availableMembers = useMemo(() => {
    return parentMembers.filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [parentMembers, members]);

  if (loadingMembers || loadingUsers) {
    return <Loading />;
  }
  return (
    <EditMembers members={members} availableMembers={availableMembers} onAdd={handleAdd} onRemove={handleRemove} />
  );
};
export default AuthorizationPage;
