import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useResolvedPath } from 'react-router-dom';
import { UserForm } from '../userForm/UserForm';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUserContext } from '../hooks/useUserContext';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import {
  useCreateTagsetOnProfileMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { EditMode } from '../../../../core/ui/forms/editMode';
import { User } from '../../../../core/apollo/generated/graphql-schema';
import { UserModel } from '../models/User';
import { logger } from '../../../../core/logging/winston/logger';
import { buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import { PageProps } from '../../../shared/types/PageProps';
import { getUpdateUserInput } from '../utils/getUpdateUserInput';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';

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

  const [updateUser] = useUpdateUserMutation({
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
            tags: tagset.tags,
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
    <StorageConfigContextProvider locationType="user" userId={user.nameID}>
      <UserSettingsLayout currentTab={SettingsSection.MyProfile}>
        <UserForm
          title={'Profile'}
          user={{ ...user } as UserModel}
          avatar={user?.profile.visual}
          editMode={editMode}
          onSave={handleSave}
        />
      </UserSettingsLayout>
    </StorageConfigContextProvider>
  );
};

export default EditUserProfilePage;
