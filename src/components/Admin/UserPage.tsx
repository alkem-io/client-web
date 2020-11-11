// export const UserPage: FC<UserPageProps> = ({ paths, user }) => {
//   const { path, url } = useRouteMatch();
//   useUpdateNavigation({ currentPaths: paths });
//   const title = 'Users';
//   return (
//     <>
//       <Row className="justify-content-end">
//         <Col>
//           <h2 style={{ textAlign: 'center' }}>{title}</h2>
//         </Col>
//         <Col sm={1}>
//           <Link to={`${path}/new`}>
//             <Button variant="primary" small>
//               New
//             </Button>
//           </Link>
//         </Col>
//       </Row>
//       <hr />
//       <Row>
//         <Col></Col>
//       </Row>
//     </>
//   );
// };
// export default UserPage;

import { gql } from '@apollo/client';
import generator from 'generate-password';
import React, { FC, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Prompt, useHistory } from 'react-router-dom';
import { EditMode, UserForm } from '.';
import { useCreateUserMutation, User, UserInput, useUpdateUserMutation } from '../../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../../graphql/admin';
import { UserModel } from '../../models/User';
import { PageProps } from '../../pages';
import { Loading } from '../core/Loading';
import PasswordPrompt from './PasswordPrompt';

interface UserPageProps extends PageProps {
  user?: UserModel;
  mode: EditMode;
  title?: string;
}

export const UserPage: FC<UserPageProps> = ({ mode = EditMode.readOnly, user, title = 'User' }) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [strongPassword, setStrongPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const history = useHistory();

  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => setShowSuccess(true),
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

    if (mode === EditMode.new) {
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
      <UserForm editMode={mode} onSave={handleSave} title={title} user={user} />
    </div>
  );
};
export default UserPage;
