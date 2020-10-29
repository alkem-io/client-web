import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { UserModel } from '../../models/User';
import SearchableList from './SearchableList';

interface UserListProps {
  users: UserModel[];
}

export const UserList: FC<UserListProps> = ({ users }) => {
  const { path } = useRouteMatch();

  const data = users.map(u => ({ id: u.id, value: u.name }));
  return (
    <>
      <SearchableList data={data} path={path} />
    </>
  );
};
export default UserList;
