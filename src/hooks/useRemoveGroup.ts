import { SearchableListItem } from '../components/Admin/SearchableList';
import { useDeleteGroupMutation } from '../generated/graphql';

export function useRemoveUserGroup(refetchQueries: string[]) {
  const [remove, result] = useDeleteGroupMutation({
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
          input: { ID: item.id },
        },
      });
    }
  };

  return { removeGroup, result };
}
