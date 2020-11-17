import React, { FC, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Prompt, useHistory } from 'react-router-dom';
import { EditMode, UserForm } from '.';
import { UserInput } from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { useUserCreationContext } from '../../hooks/useUserCreationContext';
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
  const currentPaths = useMemo(() => [...paths, { name: user && user.name ? user.name : 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const [newUserId, setNewUserId] = useState<string | undefined>();
  const history = useHistory();

  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const {
    createUser,
    updateUser,
    removeUser,
    status,
    message,
    password,
    confirm,
    dismiss,
    isBlocked,
    loading: userOperationLoading,
  } = useUserCreationContext();

  useEffect(() => {
    return () => {
      dismiss();
      confirm();
    };
  }, []);

  const isEditMode = mode === EditMode.edit;

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
      createUser(userInput).then(x => setNewUserId(x?.data?.createUser.id));
    } else if (isEditMode && user.id) {
      updateUser(userID, userInput);
    }
  };

  const handleRemoveUser = async () => {
    if (user?.id) {
      removeUser(user?.id).finally(() => setModalOpened(false));
    }
  };

  const closeModal = (): void => {
    setModalOpened(false);
  };

  const handlePasswordPromptClose = () => {
    confirm();
    dismiss();
    history.replace(`/admin/users/${newUserId}/edit`);
  };

  return (
    <div>
      <Prompt
        when={isBlocked}
        message={
          'Make sure you copied the Generated Password! Once you close this form the password will be lost forever!'
        }
      />
      <PasswordPrompt password={password} show={isBlocked} onClose={handlePasswordPromptClose} />
      <Alert show={status !== undefined} variant={status === 'error' ? 'danger' : status} onClose={dismiss} dismissible>
        {message}
      </Alert>

      {userOperationLoading && <Loading text={'Saving...'} />}
      <div className={'d-flex'}>
        <div className={'flex-grow-1'} />
        {isEditMode && (
          <Button variant={'negative'} small onClick={() => setModalOpened(true)}>
            Remove user
          </Button>
        )}
      </div>
      <UserForm editMode={mode} onSave={handleSave} title={title} user={user} />
      <UserRemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveUser}
        name={user?.name}
        loading={userOperationLoading}
      />
    </div>
  );
};
export default UserPage;
