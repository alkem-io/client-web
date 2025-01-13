import { useMemo } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { UserForm } from '../../user/userForm/UserForm';
import Loading from '@/core/ui/loading/Loading';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { useUserContext } from '../../user/hooks/useUserContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  useCreateTagsetOnProfileMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { EditMode } from '@/core/ui/forms/editMode';
import { UserModel } from '../../user/models/User';
import { buildUserProfileUrl } from '@/main/routing/urlBuilders';
import { getUpdateUserInput } from '../../user/utils/getUpdateUserInput';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';

export const UserAdminProfilePage = () => {
  const navigate = useNavigate();
  const { userNameId = '' } = useUrlParams();

  const { user: currentUser } = useUserContext();

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
    onError: error => console.error(error.message),
  });

  const [updateUser] = useUpdateUserMutation({
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const editMode = useMemo(() => {
    if (data?.lookup.user?.id === currentUser?.user.id) return EditMode.edit;
    return EditMode.readOnly;
  }, [data, currentUser]);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  const user = data?.lookup.user;

  const handleSave = async (userToUpdate: UserModel) => {
    const profileId = userToUpdate.profile.id;
    const tagsetsToAdd = userToUpdate.profile.tagsets?.filter(x => !x.id) ?? [];

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
    <StorageConfigContextProvider locationType="user" userId={user?.id!}>
      <UserAdminLayout currentTab={SettingsSection.MyProfile}>
        <PageContentColumn columns={12}>
          <PageContentBlock>
            <UserForm
              title="Profile"
              user={user}
              avatar={user?.profile.avatar}
              editMode={editMode}
              onSave={handleSave}
            />
          </PageContentBlock>
        </PageContentColumn>
      </UserAdminLayout>
    </StorageConfigContextProvider>
  );
};

export default UserAdminProfilePage;
