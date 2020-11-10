import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { User } from '../../generated/graphql';
import SearchableList from './SearchableList';

interface UserListProps {
  users: User[];
}

export const UserList: FC<UserListProps> = ({ users }) => {
  const { url } = useRouteMatch();

  const data = users.map(u => ({ id: u.id, value: u.name }));
  return (
    <>
      <SearchableList data={data} url={url} edit={true} />
    </>
  );
};
export default UserList;
