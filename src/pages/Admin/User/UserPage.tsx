import React, { FC, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  useCreateTagsetOnProfileMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  UserDetailsFragmentDoc,
  useUpdateUserMutation,
  useUserQuery,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUrlParams } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { useNotification } from '../../../hooks';
import { UserModel } from '../../../models/User';
import { PageProps } from '../..';
import { CreateUserInput } from '../../../models/graphql-schema';
import { createUserNameID } from '../../../utils/createUserNameId';
import { EditMode } from '../../../utils/editMode';
import { Loading } from '../../../components/core/Loading/Loading';
import UserForm from '../../../components/UserProfile/UserForm';
import UserRemoveModal from '../../../components/Admin/User/UserRemoveModal';
import { logger } from '../../../services/logging/winston/logger';
import { getUpdateUserInput } from '../../User/EditUserProfilePage';

interface UserPageProps extends PageProps {
  mode: EditMode;
  title?: string;
}

export const UserPage: FC<UserPageProps> = ({ mode = EditMode.readOnly, title = 'User', paths }) => {
  const notify = useNotification();
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const history = useHistory();
  const { userId } = useUrlParams();
  const { data, loading } = useUserQuery({ variables: { id: userId }, fetchPolicy: 'cache-and-network' });

  const user = data?.user as UserModel;
  const currentPaths = useMemo(
    () => [...paths, { name: user && user.displayName ? user.displayName : 'new', real: false }],
    [paths, user]
  );

  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: handleError,
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
      history.push('/admin/users');
    },
    onError: handleError,
  });

  const isEditMode = mode === EditMode.edit;

  const [createUser, { loading: createMutationLoading }] = useCreateUserMutation({
    onError: handleError,
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
    onError: error => logger.error(error.message),
  });

  const isSaving = updateMutationLoading || createMutationLoading;

  const handleCancel = () => history.goBack();

  const handleSave = async (editedUser: UserModel) => {
    const { id: userID, memberof, profile, ...rest } = editedUser;

    if (mode === EditMode.new) {
      const userInput: CreateUserInput = {
        ...rest,
        nameID: createUserNameID(rest.firstName, rest.lastName),
        profileData: {
          avatar: profile.avatar,
          description: profile.description,
          referencesData: [...profile.references],
          tagsetsData: [...profile.tagsets],
        },
      };

      createUser({
        variables: {
          input: userInput,
        },
      });
    } else if (isEditMode && editedUser.id) {
      const profileId = editedUser.profile.id;
      const tagsetsToAdd = editedUser.profile.tagsets.filter(x => !x.id);

      for (const tagset of tagsetsToAdd) {
        await createTagset({
          variables: {
            input: {
              name: tagset.name,
              tags: [...tagset.tags],
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

  if (loading) return <Loading text={'Loading user...'} />;

  return (
    <div>
      {isSaving && <Loading text={'Saving...'} />}
      <UserForm
        editMode={mode}
        onSave={handleSave}
        onCancel={handleCancel}
        title={title}
        user={user}
        onDelete={() => setModalOpened(true)}
      />
      <UserRemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveUser}
        name={user?.displayName}
        loading={userRemoveLoading}
      />
    </div>
  );
};
export default UserPage;
