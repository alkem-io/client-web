import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useResolvedPath } from 'react-router-dom';
import { UserForm } from '../../components/composite/forms/UserForm';
import { Loading } from '../../components/core';
import { useApolloErrorHandler, useNotification, useUpdateNavigation, useUrlParams, useUserContext } from '../../hooks';
import { useCreateTagsetOnProfileMutation, useUpdateUserMutation, useUserQuery } from '../../hooks/generated/graphql';
import { EditMode } from '../../models/editMode';
import { User } from '../../models/graphql-schema';
import { UserModel } from '../../models/User';
import { logger } from '../../services/logging/winston/logger';
import { buildUserProfileUrl } from '../../utils/urlBuilders';
import { PageProps } from '../common';
import { getUpdateUserInput } from '../../utils/getUpdateUserInput';

interface EditUserProfilePageProps extends PageProps {}

export const EditUserProfilePage: FC<EditUserProfilePageProps> = ({ paths }) => {
  const navigate = useNavigate();
  const { userNameId = '' } = useUrlParams();
  const { pathname: url } = useResolvedPath('.');

  const { user: currentUser } = useUserContext();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'profile', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  const { data, loading } = useUserQuery({
    variables: {
      id: userNameId,
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

    if (currentUser) {
      navigate(buildUserProfileUrl(currentUser.user.nameID), { replace: true });
    }
  };

  return (
    <UserForm
      title={'Profile'}
      user={{ ...user } as UserModel}
      avatar={user?.profile?.avatar}
      editMode={editMode}
      onSave={handleSave}
    />
  );
};

export default EditUserProfilePage;
