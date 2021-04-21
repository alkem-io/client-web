import { ApolloError } from '@apollo/client';
import { Severity } from '@sentry/react';
import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
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
import { pushNotification } from '../../reducers/notifincations/actions';
import { EditMode } from '../../utils/editMode';
import { UserForm } from '../Admin/User/UserForm';
import { Loading } from '../core/Loading';

interface EditUserProfileProps {}

export const getUpdateUserInput = (user: UserModel) => {
  const { id: userID, memberof, profile, ...rest } = user;

  return {
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
      createTagsetsData: profile.tagsets.filter(t => !t.id).map(t => ({ name: t.name, tags: [...t.tags] })),
    },
  } as UpdateUserInput;
};

export const EditUserProfile: FC<EditUserProfileProps> = () => {
  const dispatch = useDispatch();
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
    dispatch(pushNotification(error.message, Severity.Error));
  };

  const handleSave = (user: UserModel) => {
    updateUser({
      variables: {
        input: getUpdateUserInput(user),
      },
    });
  };

  const handleCancel = () => history.goBack();

  const handleAvatarChange = (file: File) => {
    if (user && user.id && user.profile?.id) {
      uploadAvatar({
        variables: {
          file,
          input: {
            file: '',
            profileID: user.profile.id,
          },
        },
      }).catch(err => handleError(err));
    }
  };

  if (loading) return <Loading text={'Loading User Profile ...'} />;
  const user = data?.me as User;
  return (
    <Container className={'mt-5'}>
      <UserForm
        title={'Profile'}
        user={{ ...user } as UserModel}
        editMode={EditMode.edit}
        onSave={handleSave}
        onCancel={handleCancel}
        onAvatarChange={handleAvatarChange}
      />
    </Container>
  );
};
export default EditUserProfile;
