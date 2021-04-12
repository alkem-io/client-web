import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import {
  User,
  UpdateUserInput,
  useUpdateUserMutation,
  useUploadAvatarMutation,
  useUserProfileQuery,
} from '../../generated/graphql';
import { useNotification } from '../../hooks/useNotification';
import { UserModel } from '../../models/User';
import { EditMode } from '../../utils/editMode';
import { UserForm } from '../Admin/User/UserForm';
import { Loading } from '../core/Loading';

interface EditUserProfileProps {}

export const EditUserProfile: FC<EditUserProfileProps> = () => {
  const history = useHistory();
  const { data, loading } = useUserProfileQuery();
  const notify = useNotification();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [updateUser] = useUpdateUserMutation({
    onError: error => handleError(error),
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const handleError = (error: ApolloError) => {
    console.log(error);
  };

  const handleSave = (user: UserModel) => {
    const { id: userID, memberof, profile, ...rest } = user;

    const userInput: UpdateUserInput = {
      ...rest,
      ID: userID,
      profileData: {
        ID: user.profile.id || '',
        avatar: profile.avatar,
        description: profile.description,
        createReferencesData: profile.references.filter(r => !r.id).map(t => ({ name: t.name, uri: t.uri })),
        updateReferencesData: profile.references
          .filter(r => r.id)
          .map(t => ({ ID: Number(t.id), name: t.name, uri: t.uri })),
        updateTagsetsData: profile.tagsets
          .filter(t => t.id)
          .map(t => ({ ID: Number(t.id), name: t.name, tags: [...t.tags] })),
        createTagsetsData: profile.tagsets
          .filter(t => !t.id)
          .map(t => ({ ID: Number(t.id), name: t.name, tags: [...t.tags] })),
      },
    };

    updateUser({
      variables: {
        input: userInput,
      },
    });
  };

  const handleCancel = () => history.goBack();

  const handleAvatarChange = (file: File) => {
    if (user && user.id && user.profile?.id) {
      uploadAvatar({
        variables: {
          profileId: Number(user.profile.id),
          file,
        },
      }).catch(err => handleError(err));
    }
  };

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
        onAvatarChange={handleAvatarChange}
      />
    </Container>
  );
};
export default EditUserProfile;
