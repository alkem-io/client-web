import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { User, UserInput, useUpdateMyProfileMutation, useUserProfileQuery } from '../../generated/graphql';
import { useNotification } from '../../hooks/useNotification';
import { UserModel } from '../../models/User';
import { EditMode } from '../../utils/editMode';
import { UserForm } from '../Admin/User/UserForm';
import { Loading } from '../core/Loading';

interface EditUserProfileProps {}

export const EditUserProfile: FC<EditUserProfileProps> = () => {
  const { data, loading } = useUserProfileQuery();
  const notify = useNotification();
  const [updateUser] = useUpdateMyProfileMutation({
    onError: error => console.log(error),
    onCompleted: () => {
      console.log('User profile updated successfully');
      notify('User updated successfully', 'success');
      // setMessage('User updated successfully');
      // setStatus('success');
    },
  });

  const handleSave = (user: UserModel) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: userID, memberof, profile, ...rest } = user;

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
        user: userInput,
      },
    });
  };

  const handleCancel = () => console.log('caceled');

  const user = data?.me as User;
  if (loading) return <Loading text={'Loading User Profile ...'} />;
  return (
    <Container className={'mt-5'}>
      <UserForm
        title={'Profile'}
        user={{ ...user, aadPassword: '' } as UserModel}
        editMode={EditMode.edit}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Container>
  );
};
export default EditUserProfile;
