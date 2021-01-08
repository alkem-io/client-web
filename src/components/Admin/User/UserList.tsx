import React, { FC } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { UserModel } from '../../../models/User';
import { PageProps } from '../../../pages';
import Button from '../../core/Button';
import SearchableList from '../SearchableList';

interface UserListProps extends PageProps {
  users: UserModel[];
}

export const UserList: FC<UserListProps> = ({ users, paths }) => {
  const { url } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });

  const data = users.map(u => ({ id: u.id, value: `${u.name} (${u.email})`, url: `${url}/${u.id}` }));

  return (
    <>
      <ButtonGroup className={'d-flex justify-content-end'}>
        <Button className={'mb-2'} as={Link} to={`${url}/new`}>
          New
        </Button>
      </ButtonGroup>
      <SearchableList data={data} edit={true} />
    </>
  );
};
export default UserList;
