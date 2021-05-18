import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import { useDeleteUserMutation } from '../../../generated/graphql';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { UserModel } from '../../../models/User';
import { PageProps } from '../../../pages';
import SearchableList, { SearchableListItem } from '../SearchableList';

interface UserListProps extends PageProps {
  users: UserModel[];
}

export const UserList: FC<UserListProps> = ({ users, paths }) => {
  const { url } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });

  const data = users.map(u => ({ id: u.id, value: `${u.name} (${u.email})`, url: `${url}/${u.id}` }));

  const [deleteUser] = useDeleteUserMutation({
    refetchQueries: ['users'],
    awaitRefetchQueries: true,

    onError: e => console.error('User remove error---> ', e),
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

  return (
    <Container>
      {/* <ButtonGroup className={'d-flex justify-content-end'}>
        <Button className={'mb-2'} as={Link} to={`${url}/new`}>
          New
        </Button>
      </ButtonGroup> */}
      <SearchableList data={data} edit={true} onDelete={handleDelete} />
    </Container>
  );
};
export default UserList;
