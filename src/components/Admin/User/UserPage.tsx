import { ApolloError } from '@apollo/client';
import generator from 'generate-password';
import React, { FC, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import {
  useCreateUserMutation,
  useRemoveUserMutation,
  UserInput,
  useUpdateUserMutation,
} from '../../../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../../../graphql/user';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { UserModel } from '../../../models/User';
import { PageProps } from '../../../pages';
import { EditMode } from '../../../utils/editMode';
import Button from '../../core/Button';
import { Loading } from '../../core/Loading';
import PasswordPrompt from '../PasswordPrompt';
import UserForm from './UserForm';
import UserRemoveModal from './UserRemoveModal';

interface UserPageProps extends PageProps {
  user?: UserModel;
  mode: EditMode;
  title?: string;
}

export const UserPage: FC<UserPageProps> = ({ mode = EditMode.readOnly, user, title = 'User', paths }) => {
  const [newUserId, setNewUserId] = useState<string | undefined>('1');
  const [status, setStatus] = useState<'success' | 'error' | undefined>();
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
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

  const [remove, { loading: userRemoveLoading }] = useRemoveUserMutation({
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
    onCompleted: data => {
      setNewUserId(data.createUser.id);
      setIsBlocked(true);
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
                fragment: USER_DETAILS_FRAGMENT,
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

  const handleSave = (user: UserModel) => {
    // Convert UserModel to UserInput
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: userID, memberof, profile, ...rest } = user;

    if (mode === EditMode.new) {
      const userInput: UserInput = {
        ...rest,
        profileData: {
          avatar: profile.avatar,
          description: profile.description,
          referencesData: [...profile.references],
          tagsetsData: [...profile.tagsets],
        },
      };

      const passwordBase = generator.generate({
        length: 4,
        numbers: true,
        symbols: false,
        excludeSimilarCharacters: true,
        exclude: '"', // avoid causing invalid Json
        strict: true,
      });
      const aadPassword = `Cherrytwist-${passwordBase}!`;

      userInput.aadPassword = aadPassword;

      setPassword(aadPassword);
      createUser({
        variables: {
          user: userInput,
        },
      });
    } else if (isEditMode && user.id) {
      const userInput: UserInput = {
        ...rest,
        profileData: {
          avatar: profile.avatar,
          description: profile.description,
          referencesData: [...profile.references].map(t => ({ name: t.name, uri: t.uri })),
          tagsetsData: [...profile.tagsets],
        },
      };

      updateUser({
        variables: {
          userId: Number(userID),
          user: userInput,
        },
      });
    }
  };

  const handleRemoveUser = () => {
    remove({
      variables: {
        userID: Number(user?.id),
      },
    }).finally(() => setModalOpened(false));
  };

  const closeModal = (): void => {
    setModalOpened(false);
  };

  const dismiss = () => {
    setStatus(undefined);
  };

  const closePasswordPrompt = () => {
    if (newUserId) {
      history.replace(`/admin/users/${newUserId}/edit`);
    } else {
      history.replace('/admin/users');
    }
  };

  return (
    <div>
      <PasswordPrompt password={password} show={isBlocked} onClose={closePasswordPrompt} />
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
