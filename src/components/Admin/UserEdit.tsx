import { gql } from '@apollo/client';
import generator from 'generate-password';
import React, { FC, useState } from 'react';
import { Alert, FormGroup } from 'react-bootstrap';
import { Prompt, useHistory } from 'react-router-dom';
import { EditMode, UserForm } from '.';
import { useCreateUserMutation, UserInput, useUpdateUserMutation } from '../../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../../graphql/admin';
import { UserModel } from '../../models/User';
import { Loading } from '../core/Loading';
import InputWithCopy from './InputWithCopy';
import User from './User';

interface UserEditProps {
  editMode?: EditMode;
  title?: string;
}

export const UserEdit: FC<UserEditProps> = ({ editMode = EditMode.readOnly, title = 'User' }) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [strongPassword, setStrongPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const history = useHistory();
  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => setShowSuccess(true),
  });

  const isEditMode = editMode === EditMode.edit;

  const [createUser, { loading: createMutationLoading }] = useCreateUserMutation({
    onError: error => {
      setShowError(true);
      console.log(error);
    },
    onCompleted: data => {
      history.replace(`/admin/users/${data.createUser.id}/edit`);
      setIsBlocked(true);
      setShowSuccess(true);
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
    const { id: userID, profile, ...rest } = user;
    const userInput: UserInput = {
      ...rest,
      profileData: {
        avatar: profile.avatar,
        description: '',
        referencesData: [...profile.references],
        tagsetsData: [...profile.tagsets],
      },
    };

    if (editMode === EditMode.new) {
      const aadPassword = generator.generate({
        length: 24,
        numbers: true,
        symbols: true,
        excludeSimilarCharacters: true,
        exclude: '"', // avoid causing invalid Json
        strict: true,
      });

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

  const page =
    editMode === EditMode.new ? (
      <UserForm editMode={editMode} onSave={handleSave} title="New user" />
    ) : (
      <User mode={editMode} onSave={handleSave} />
    );

  return (
    <div>
      <Prompt
        when={isBlocked}
        message={
          'Make sure you copied the Generated Password! Once you close this form the password will be lost forever!'
        }
      />
      <FormGroup>{isBlocked && <InputWithCopy label="Generated Password" text={strongPassword} />}</FormGroup>
      <Alert show={isBlocked} variant="warning">
        Please copy the "Generated password". Once form is closed it will be lost forever.
      </Alert>
      <Alert show={showError} variant="danger" onClose={() => setShowError(false)} dismissible>
        Error saving user.
      </Alert>
      <Alert show={showSuccess} variant="success" onClose={() => setShowSuccess(false)} dismissible>
        Saved successfully.
      </Alert>
      {isSaving && <Loading text={'Saving...'} />}
      {page}
    </div>
  );
};
export default UserEdit;
