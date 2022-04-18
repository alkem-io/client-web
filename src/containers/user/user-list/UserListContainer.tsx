import { FC, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../utils/containers/ComponentOrChildrenFn';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import { useDeleteUserMutation, useUserListQuery } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';

interface Props {}

interface Provided {
  loading: boolean;
  deleting: boolean;
  error?: ApolloError;
  userList: SearchableListItem[];
  onDelete: (item: SearchableListItem) => void;
}

export type UserListContainerProps = ContainerPropsWithProvided<Props, Provided>;

const UserListContainer: FC<UserListContainerProps> = ({ ...rendered }) => {
  const handleError = useApolloErrorHandler();

  const { data, loading, error } = useUserListQuery();
  const userList = useMemo(
    () =>
      (data?.users ?? []).map<SearchableListItem>(({ id, displayName, email }) => ({
        id,
        value: `${displayName} (${email})`,
        url: `${id}/edit`,
      })),
    [data]
  );

  const [deleteUser, { loading: deleting }] = useDeleteUserMutation({
    onError: handleError,
  });

  const onDelete = (item: SearchableListItem) => {
    deleteUser({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  return renderComponentOrChildrenFn(rendered, {
    userList,
    loading,
    deleting,
    error,
    onDelete,
  });
};
export default UserListContainer;
