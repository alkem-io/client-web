import { ApolloError } from '@apollo/client';
import React, { FC, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  UserDetailsFragmentDoc,
} from '../../../generated/graphql';
import { CreateUserInput } from '../../../types/graphql-schema';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { UserModel } from '../../../models/User';
import { PageProps } from '../../../pages';
import { EditMode } from '../../../utils/editMode';
import Button from '../../core/Button';
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
  const [status, setStatus] = useState<'success' | 'error' | undefined>();
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const history = useHistory();

  const currentPaths = useMemo(() => [...paths, { name: user && user.name ? user.name : 'new', real: false }], [paths]);

  useUpdateNavigation({ currentPaths });

  const handleError = (error: ApolloError) => {
    setStatus('error');
    setMessage(error.message);
  };

  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => {
      setMessage('User updated successfully');
      setStatus('success');
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
    onError: e => {
      handleError(e);
    },
  });

  const isEditMode = mode === EditMode.edit;

  const [createUser, { loading: createMutationLoading }] = useCreateUserMutation({
    onError: handleError,
    onCompleted: () => {
      setStatus('success');
      setMessage('User saved successfully!');
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

  const handleSave = async (user: UserModel) => {
    // Convert UserModel to UserInput
    const { id: userID, memberof, profile, ...rest } = user;

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
    } else if (isEditMode && user.id) {
      updateUser({
        variables: {
          input: getUpdateUserInput(user),
        },
      });
    }
  };

  const handleRemoveUser = () => {
    remove({
      variables: {
        input: {
          ID: Number(user?.id),
        },
      },
    }).finally(() => setModalOpened(false));
  };

  const closeModal = (): void => {
    setModalOpened(false);
  };

  const dismiss = () => {
    setStatus(undefined);
  };

  return (
    <div>
      <Alert show={status !== undefined} variant={status === 'error' ? 'danger' : status} onClose={dismiss} dismissible>
        {message}
      </Alert>
      {isSaving && <Loading text={'Saving...'} />}
      <div className={'d-flex'}>
        <div className={'flex-grow-1'} />
        {isEditMode && (
          <Button variant={'negative'} small onClick={() => setModalOpened(true)}>
            Remove user
          </Button>
        )}
      </div>
      <UserForm editMode={mode} onSave={handleSave} onCancel={handleCancel} title={title} user={user} />
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
