import React, { FC } from 'react';
import { PageProps } from '../..';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import { Loading } from '../../../components/core';
import { useApolloErrorHandler } from '../../../hooks';
import { useDeleteUserMutation, useUsersQuery } from '../../../hooks/generated/graphql';

interface UserListPageProps extends PageProps {}

export const UserListPage: FC<UserListPageProps> = ({ paths }) => {
  const { data, loading } = useUsersQuery({ fetchPolicy: 'cache-and-network' });

  const users = data?.users || [];

  const userList = users.map(u => ({ id: u.id, value: `${u.displayName} (${u.email})`, url: `${u.id}/edit` }));
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
          ID: item.id,
        },
      },
    });
  };

  if (loading) {
    return <Loading text={'Loading Users ...'} />;
  }
  return <ListPage data={userList} paths={paths} onDelete={handleDelete} />;
};

export default UserListPage;
