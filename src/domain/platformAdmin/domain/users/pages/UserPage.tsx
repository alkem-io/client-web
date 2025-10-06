import { FC, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import UserForm from '@/domain/community/user/userForm/UserForm';
import Loading from '@/core/ui/loading/Loading';
import {
  useCreateTagsetOnProfileMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { EditMode } from '@/core/ui/forms/editMode';
import { UserModel } from '@/domain/community/user/models/UserModel';
import { getUpdateUserInput } from '@/domain/community/user/utils/getUpdateUserInput';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';

interface UserPageProps {
  readOnly?: boolean;
}

const UserPage: FC<UserPageProps> = ({ readOnly = true }) => {
  const notify = useNotification();
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const navigate = useNavigate();
  const { userId, loading: resolving } = useUrlResolver();

  const { data, loading: loadingData } = useUserQuery({
    variables: {
      id: userId!, // ensured by skip
    },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.lookup.user;

  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const [remove, { loading: userRemoveLoading }] = useDeleteUserMutation({
    update(cache, data) {
      cache.modify({
        fields: {
          users(existingUsers = [], { readField }) {
            return existingUsers.filter(x => readField('id', x) !== data['id']);
          },
        },
      });
    },
    awaitRefetchQueries: true,
    onCompleted: () => {
      navigate('/admin/users', { replace: true });
    },
  });

  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => console.error(error.message),
  });

  const isSaving = updateMutationLoading;

  const handleSave = async (editedUser: UserModel) => {
    const profileId = editedUser.profile.id;
    const tagsetsToAdd = editedUser.profile.tagsets?.filter(x => !x.id) ?? [];

    for (const tagset of tagsetsToAdd) {
      await createTagset({
        variables: {
          input: {
            name: tagset.name,
            tags: tagset.tags,
            profileID: profileId,
          },
        },
      });
    }

    updateUser({
      variables: {
        input: getUpdateUserInput(editedUser),
      },
    });
  };

  const handleRemoveUser = () => {
    if (user)
      remove({
        variables: {
          input: {
            ID: user?.id,
          },
        },
      }).finally(() => setModalOpened(false));
  };

  const closeModal = (): void => {
    setModalOpened(false);
  };

  if (loadingData || resolving) return <Loading text={'Loading user...'} />;

  return (
    <>
      {isSaving && <Loading text={'Saving...'} />}
      <UserForm
        editMode={readOnly ? EditMode.readOnly : EditMode.edit}
        onSave={handleSave}
        user={user}
        avatar={user?.profile.avatar}
        onDelete={() => setModalOpened(true)}
      />
      <ConfirmationDialog
        entities={{ title: 'Remove user' }}
        options={{ show: isModalOpened }}
        actions={{
          onCancel: closeModal,
          onConfirm: handleRemoveUser,
        }}
        state={{
          isLoading: userRemoveLoading,
        }}
      />
    </>
  );
};

export default UserPage;
