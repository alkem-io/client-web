import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteGroupMutation } from '@/core/apollo/generated/apollo-hooks';
import { DeleteGroupMutation } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';

type Options = {
  onComplete?: (data: DeleteGroupMutation) => void;
  onError?: (error: ApolloError) => void;
};

export const useDeleteUserGroup = (options?: Options) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const success = (message: string) => notify(message, 'success');

  const [deleteGroup, { loading, error }] = useDeleteGroupMutation({
    onCompleted: data => {
      success(t('operations.user-group.deleted-successfully', { name: data.deleteUserGroup.profile?.displayName }));
      options && options.onComplete && options.onComplete(data);
    },
    onError: options && options.onError && options.onError,

    update: (cache, { data }) => {
      if (data) {
        const { id, __typename } = data.deleteUserGroup;
        const normalizedId = cache.identify({ id: id, __typename: __typename });
        cache.evict({ id: normalizedId });
        cache.gc();
      }
    },
  });

  const handleDelete = (id: string) => {
    deleteGroup({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  return {
    handleDelete,
    loading,
    error,
  };
};
