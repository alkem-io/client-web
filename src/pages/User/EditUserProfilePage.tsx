import React, { FC, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Loading } from '../../components/core';
import { UserForm } from '../../components/composite/forms/UserForm';
import { useApolloErrorHandler, useNotification, useUrlParams, useUserContext } from '../../hooks';
import { useCreateTagsetOnProfileMutation, useUpdateUserMutation, useUserQuery } from '../../hooks/generated/graphql';
import { UpdateUserInput, User } from '../../models/graphql-schema';
import { UserModel } from '../../models/User';
import { logger } from '../../services/logging/winston/logger';
import { EditMode } from '../../models/editMode';

interface EditUserProfilePageProps {}

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

export const EditUserProfilePage: FC<EditUserProfilePageProps> = () => {
  const { userId } = useUrlParams();
  const { user: currentUser } = useUserContext();

  const { url } = useRouteMatch();
  const history = useHistory();
  const { data, loading } = useUserQuery({
    variables: {
      id: userId,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const notify = useNotification();
  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => logger.error(error.message),
  });
  const handleError = useApolloErrorHandler();

  const [updateUser] = useUpdateUserMutation({
    onError: handleError,
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const handleCancel = () => history.replace(url.replace('/edit', ''));

  const editMode = useMemo(() => {
    if (data?.user.id === currentUser?.user.id) return EditMode.edit;
    return EditMode.readOnly;
  }, [data, currentUser]);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  const user = data?.user as User;

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
      editMode={editMode}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default EditUserProfilePage;
