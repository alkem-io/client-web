import React, { FC } from 'react';
import { PageProps } from '../..';
import ListPage from '../../../components/Admin/ListPage';
import UserListContainer from '../../../containers/user/user-list/UserListContainer';

interface UserListPageProps extends PageProps {}

export const UserListPage: FC<UserListPageProps> = ({ paths }) => {
  return (
    <UserListContainer
      component={({ userList, onDelete, loading }) => (
        <ListPage data={userList} paths={paths} onDelete={onDelete} loading={loading} />
      )}
    />
  );
};

export default UserListPage;
