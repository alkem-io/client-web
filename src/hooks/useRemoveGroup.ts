import { SearchableListItem } from '../components/Admin/SearchableList';
import { useRemoveUserGroupMutation } from '../generated/graphql';

export function useRemoveUserGroup(refetchQueries: string[]) {
  const [remove, result] = useRemoveUserGroupMutation({
    refetchQueries,
    awaitRefetchQueries: true,
    onError: e => {
      console.error('Can not delete group: ', e);
    },
  });

  const removeGroup = (item: SearchableListItem) => {
    if (item) {
      remove({
        variables: {
          input: { ID: Number(item.id) },
        },
      });
    }
  };

  return { removeGroup, result };
}
