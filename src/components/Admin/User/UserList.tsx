import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDeleteUserMutation } from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { UserModel } from '../../../models/User';
import { PageProps } from '../../../pages';
import ListPage from '../ListPage';
import { SearchableListItem } from '../SearchableList';

interface UserListProps extends PageProps {
  users: UserModel[];
}

export const UserList: FC<UserListProps> = ({ users, paths }) => {
  const { url } = useRouteMatch();

  const data = users.map(u => ({ id: u.id, value: `${u.name} (${u.email})`, url: `${url}/${u.id}/edit` }));
  const handleError = useApolloErrorHandler();

  const [deleteUser] = useDeleteUserMutation({
    refetchQueries: ['users'],
    awaitRefetchQueries: true,

    onError: handleError,
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteUser({
      variables: {
        input: {
          ID: Number(item.id),
        },
      },
    });
  };

  return <ListPage data={data} paths={paths} onDelete={handleDelete} />;
};
export default UserList;
