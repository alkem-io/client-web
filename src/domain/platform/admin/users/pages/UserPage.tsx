import React, { FC, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import UserRemoveModal from '@/domain/platform/admin/components/User/UserRemoveModal';
import UserForm from '@/domain/community/user/userForm/UserForm';
import { Loading } from '@/core/ui/loading/Loading';
import {
  useCreateTagsetOnProfileMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  UserDetailsFragmentDoc,
  useUpdateUserMutation,
  useUserQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { EditMode } from '@/core/ui/forms/editMode';
import { CreateUserInput } from '@/core/apollo/generated/graphql-schema';
import { UserModel } from '@/domain/community/user/models/User';
import { createUserNameID } from '@/domain/community/user/utils/createUserNameId';
import { getUpdateUserInput } from '@/domain/community/user/utils/getUpdateUserInput';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';

interface UserPageProps {
  mode: EditMode;
}

const UserPage: FC<UserPageProps> = ({ mode = EditMode.readOnly }) => {
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

  const user = data?.lookup.user as UserModel;

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

  const isEditMode = mode === EditMode.edit;

  const [createUser, { loading: createMutationLoading }] = useCreateUserMutation({
    onCompleted: () => {
      notify('User saved successfully!', 'success');
    },
    update: (cache, { data }) => {
      if (data) {
        const { createUser } = data;

        cache.modify({
          fields: {
            users(existingUsers = []) {
              const newUserRef = cache.writeFragment({
                data: createUser,
                fragment: UserDetailsFragmentDoc,
              });
              return [...existingUsers, newUserRef];
            },
          },
        });
      }
    },
  });

  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => console.error(error.message),
  });

  const isSaving = updateMutationLoading || createMutationLoading;

  const handleSave = async (editedUser: UserModel) => {
    const { id: userID, memberof, profile, ...rest } = editedUser;

    if (mode === EditMode.new) {
      const userInput: CreateUserInput = {
        ...rest,
        nameID: createUserNameID(rest.firstName, rest.lastName),
        profileData: {
          description: profile.description,
          displayName: profile.displayName,
          referencesData: profile.references,
        },
      };

      createUser({
        variables: {
          input: userInput,
        },
      });
    } else if (isEditMode && editedUser.id) {
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
    }
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
        editMode={mode}
        onSave={handleSave}
        user={user}
        avatar={data?.lookup.user?.profile.avatar}
        onDelete={() => setModalOpened(true)}
      />
      <UserRemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveUser}
        name={user?.profile.displayName}
        loading={userRemoveLoading}
      />
    </>
  );
};

export default UserPage;
