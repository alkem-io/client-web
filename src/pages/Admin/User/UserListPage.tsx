import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDeleteUserMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { UserModel } from '../../../models/User';
import { PageProps } from '../..';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem } from '../../../components/Admin/SearchableList';

interface UserListPageProps extends PageProps {
  users: UserModel[];
}

export const UserListPage: FC<UserListPageProps> = ({ users, paths }) => {
  const { url } = useRouteMatch();

  const data = users.map(u => ({ id: u.id, value: `${u.displayName} (${u.email})`, url: `${url}/${u.id}/edit` }));
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

  return <ListPage data={data} paths={paths} onDelete={handleDelete} />;
};

// interface Props<TEntities, TActions> {
//   entities: TEntities;
//   actions: TActions;
// }

// interface Entities {
//   users: UserModel[];
// }

// interface Actions {
//   onDelete?: () => void;
// }

// interface UserProps extends Props<Entities, Actions> {

// }

// interface CompositeEntities extends Entities {
// }

export default UserListPage;
