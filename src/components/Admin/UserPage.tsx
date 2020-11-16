import { gql } from '@apollo/client';
import generator from 'generate-password';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Prompt, useHistory } from 'react-router-dom';
import { EditMode, UserForm } from '.';
import {
  useCreateUserMutation,
  useRemoveUserMutation,
  UserInput,
  useUpdateUserMutation,
} from '../../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../../graphql/user';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { UserModel } from '../../models/User';
import { PageProps } from '../../pages';
import Button from '../core/Button';
import { Loading } from '../core/Loading';
import PasswordPrompt from './PasswordPrompt';
import UserRemoveModal from './UserRemoveModal';

interface UserPageProps extends PageProps {
  user?: UserModel;
  mode: EditMode;
  title?: string;
}

export const UserPage: FC<UserPageProps> = ({ mode = EditMode.readOnly, user, title = 'User', paths }) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [strongPassword, setStrongPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const history = useHistory();

  const currentPaths = useMemo(() => [...paths, { name: user && user.name ? user.name : 'new', real: false }], [paths]);

  useUpdateNavigation({ currentPaths });

  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => setShowSuccess(true),
  });

  const [remove, { loading: userRemoveLoading }] = useRemoveUserMutation({
    refetchQueries: ['users'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setModalOpened(false);
      history.push('/admin/users');
    },
    onError: e => console.error('User remove error---> ', e),
  });

  useEffect(() => {
    const handleUnload = e => {
      if (isBlocked) {
        const message =
          'Make sure you copied the Generated Password! Once you close this form the password will be lost forever!';

        if (e) {
          e.preventDefault(); // Prevent navigation
          e.returnValue = message; // Works only for old browsers
        }
        return message; // Works only for the oldest browsers
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [isBlocked]);

  const isEditMode = mode === EditMode.edit;

  const [createUser, { loading: createMutationLoading }] = useCreateUserMutation({
    onError: error => {
      setShowError(true);
      setShowSuccess(false);
      console.log(error);
    },
    onCompleted: data => {
      history.replace(`/admin/users/${data.createUser.id}/edit`);
      setIsBlocked(true);
      setShowSuccess(true);
      setShowError(false);
    },
    update: (cache, { data }) => {
      if (data) {
        const { createUser } = data;

        cache.modify({
          fields: {
            users(existingUsers = []) {
              const newUserRef = cache.writeFragment({
                data: createUser,
                fragment: gql`
                  ${USER_DETAILS_FRAGMENT}
                `,
              });
              return [...existingUsers, newUserRef];
            },
          },
        });
      }
    },
  });

  const isSaving = updateMutationLoading || createMutationLoading;

  const handleSave = (user: UserModel) => {
    // Convert UserModel to UserInput
    const { id: userID, profile, memberof, ...rest } = user;
    const userInput: UserInput = {
      ...rest,
      profileData: {
        avatar: profile.avatar,
        description: profile.description,
        referencesData: [...profile.references],
        tagsetsData: [...profile.tagsets],
      },
    };

    if (mode === EditMode.new) {
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

      setStrongPassword(aadPassword);
      createUser({
        variables: {
          user: userInput,
        },
      });
    } else if (isEditMode && user.id) {
      const { email, ...userToUpdate } = userInput;
      updateUser({
        variables: {
          userId: Number(userID),
          user: userToUpdate,
        },
      });
    }
  };

  const handleRemoveUser = () => {
    remove({
      variables: {
        userID: Number(user?.id),
      },
    });
  };

  const closeModal = (): void => {
    setModalOpened(false);
  };

  return (
    <div>
      <Prompt
        when={isBlocked}
        message={
          'Make sure you copied the Generated Password! Once you close this form the password will be lost forever!'
        }
      />
      {isBlocked && <PasswordPrompt password={strongPassword} show={isBlocked} onClose={() => setIsBlocked(false)} />}
      <Alert show={showError} variant="danger" onClose={() => setShowError(false)} dismissible>
        Error saving user.
      </Alert>
      <Alert show={showSuccess} variant="success" onClose={() => setShowSuccess(false)} dismissible>
        Saved successfully.
      </Alert>
      {isSaving && <Loading text={'Saving...'} />}
      <div className={'d-flex'}>
        <div className={'flex-grow-1'} />
        <Button variant={'negative'} small onClick={() => setModalOpened(true)}>
          Remove user
        </Button>
      </div>
      <UserForm editMode={mode} onSave={handleSave} title={title} user={user} />
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
