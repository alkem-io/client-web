import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { UserModel } from '../../models/User';
import { PageProps } from '../../pages';
import SearchableList from './SearchableList';

interface UserListProps extends PageProps {
  users: UserModel[];
}

export const UserList: FC<UserListProps> = ({ users, paths }) => {
  const { url } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });

  const data = users.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` }));
  return <SearchableList data={data} edit={true} />;
};
export default UserList;
