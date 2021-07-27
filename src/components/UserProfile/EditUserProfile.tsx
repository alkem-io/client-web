import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { useCreateTagsetOnProfileMutation, useMeQuery, useUpdateUserMutation } from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { useNotification } from '../../hooks';
import { UserModel } from '../../models/User';
import { UpdateUserInput, User } from '../../models/graphql-schema';
import { EditMode } from '../../utils/editMode';
import { Loading } from '../core/Loading';
import { UserForm } from './UserForm';

interface EditUserProfileProps {}

// TODO [ATS] Need optimization this code is copy paste a few times.
export const getUpdateUserInput = (user: UserModel): UpdateUserInput => {
  const { id: userID, email, memberof, profile, agent, ...rest } = user;

  return {
    ...rest,
    ID: userID,
    profileData: {
      ID: user.profile.id || '',
      avatar: profile.avatar,
      description: profile.description,
      references: profile.references.filter(r => r.id).map(t => ({ ID: t.id || '', name: t.name, uri: t.uri })),
      tagsets: profile.tagsets.filter(t => t.id).map(t => ({ ID: t.id || '', name: t.name, tags: [...t.tags] })),
    },
  };
};

export const EditUserProfile: FC<EditUserProfileProps> = () => {
  const history = useHistory();
  const { data, loading } = useMeQuery({ fetchPolicy: 'network-only' });
  const notify = useNotification();
  const [createTagset] = useCreateTagsetOnProfileMutation();
  const handleError = useApolloErrorHandler();

  const [updateUser] = useUpdateUserMutation({
    onError: handleError,
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const handleCancel = () => history.goBack();

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  const user = data?.me as User;

  const handleSave = async (userToUpdate: UserModel) => {
    const profileId = userToUpdate.profile.id;
    const tagsetsToAdd = userToUpdate.profile.tagsets.filter(x => !x.id);

    for (const tagset of tagsetsToAdd) {
      await createTagset({
        variables: {
          input: {
            name: tagset.name,
            tags: [...tagset.tags],
            profileID: profileId,
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
