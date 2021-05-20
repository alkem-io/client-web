import React, { FC, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  useCreateReferenceOnProfileMutation,
  useCreateUserMutation,
  useDeleteReferenceMutation,
  useDeleteUserMutation,
  UserDetailsFragmentDoc,
  useUpdateUserMutation,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { useNotification } from '../../../hooks/useNotification';
import { UserModel } from '../../../models/User';
import { PageProps } from '../../../pages';
import { CreateUserInput } from '../../../types/graphql-schema';
import { EditMode } from '../../../utils/editMode';
import { Loading } from '../../core/Loading';
import { getUpdateUserInput } from '../../UserProfile';
import UserForm from '../../UserProfile/UserForm';
import UserRemoveModal from './UserRemoveModal';

interface UserPageProps extends PageProps {
  user?: UserModel;
  mode: EditMode;
  title?: string;
}

export const UserPage: FC<UserPageProps> = ({ mode = EditMode.readOnly, user, title = 'User', paths }) => {
  const notify = useNotification();
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const history = useHistory();
  const [addReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  const currentPaths = useMemo(() => [...paths, { name: user && user.name ? user.name : 'new', real: false }], [paths]);

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

  const isSaving = updateMutationLoading || createMutationLoading;

  const handleCancel = () => history.goBack();

  const handleSave = async (editedUser: UserModel) => {
    const { id: userID, memberof, profile, ...rest } = editedUser;

    if (mode === EditMode.new) {
      const userInput: CreateUserInput = {
        ...rest,
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
      // TODO [ATS] - Optimze, same code available in EditUserProfile
      const profileId = editedUser.profile.id;
      const initialReferences = user?.profile?.references || [];
      const references = editedUser.profile.references;
      const toRemove = initialReferences.filter(x => x.id && !references.some(r => r.id && r.id === x.id));
      const toAdd = references.filter(x => !x.id);

      for (const ref of toRemove) {
        if (ref.id) await deleteReference({ variables: { input: { ID: ref.id } } });
      }

      for (const ref of toAdd) {
        await addReference({
          variables: {
            input: {
              parentID: Number(profileId),
              name: ref.name,
              description: ref.description,
              uri: ref.uri,
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
        name={user?.name}
        loading={userRemoveLoading}
      />
    </div>
  );
};
export default UserPage;
