import { ApolloError } from '@apollo/client';
import { Severity } from '@sentry/react';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useMeQuery,
  useUpdateUserMutation,
} from '../../generated/graphql';
import { useNotification } from '../../hooks/useNotification';
import { UserModel } from '../../models/User';
import { pushNotification } from '../../reducers/notifincations/actions';
import { UpdateUserInput, User } from '../../types/graphql-schema';
import { EditMode } from '../../utils/editMode';
import { UserForm } from './UserForm';
import { Loading } from '../core/Loading';

interface EditUserProfileProps {}

export const getUpdateUserInput = (user: UserModel): UpdateUserInput => {
  const { id: userID, email, memberof, profile, ...rest } = user;

  return {
    ...rest,
    ID: userID,
    profileData: {
      ID: user.profile.id || '',
      avatar: profile.avatar,
      description: profile.description,
      references: profile.references.filter(r => r.id).map(t => ({ ID: Number(t.id), name: t.name, uri: t.uri })),
      tagsets: profile.tagsets.filter(t => t.id).map(t => ({ ID: Number(t.id), name: t.name, tags: [...t.tags] })),
    },
  };
};

export const EditUserProfile: FC<EditUserProfileProps> = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { data, loading } = useMeQuery();
  const notify = useNotification();
  const [addReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  const [updateUser] = useUpdateUserMutation({
    onError: error => handleError(error),
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const handleError = (error: ApolloError) => {
    dispatch(pushNotification(error.message, Severity.Error));
  };

  const handleCancel = () => history.goBack();

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  const user = data?.me as User;

  const handleSave = async (userToUpdate: UserModel) => {
    const profileId = userToUpdate.profile.id;
    const initialReferences = user?.profile?.references || [];
    const references = userToUpdate.profile.references;
    const toRemove = initialReferences.filter(x => x.id && !references.some(r => r.id && r.id === x.id));
    const toAdd = references.filter(x => !x.id);

    for (const ref of toRemove) {
      await deleteReference({ variables: { input: { ID: Number(ref.id) } } });
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
    await updateUser({
      variables: {
        input: getUpdateUserInput(userToUpdate),
      },
    });
  };

  return (
    <UserForm
      title={'Profile'}
      user={{ ...user } as UserModel}
      editMode={EditMode.edit}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};
export default EditUserProfile;
