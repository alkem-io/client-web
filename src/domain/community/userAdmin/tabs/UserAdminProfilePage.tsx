import {
  useCreateTagsetOnProfileMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { EditMode } from '@/core/ui/forms/editMode';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import type { UserModel } from '../../user/models/UserModel';
import useUserRouteContext from '../../user/routing/useUserRouteContext';
import { UserForm } from '../../user/userForm/UserForm';
import { getUpdateUserInput } from '../../user/utils/getUpdateUserInput';

export const UserAdminProfilePage = () => {
  const navigate = useNavigate();
  const { userId, getProfileUrl } = useUserRouteContext();

  const { userModel: currentUser } = useCurrentUserContext();

  const { data, loading } = useUserQuery({
    variables: {
      id: userId!,
    },
    skip: !userId,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const notify = useNotification();
  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification handler.
    // there is an issue handling multiple snackbars.
    onError: _error => {},
  });

  const [updateUser] = useUpdateUserMutation({
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const editMode = (() => {
    if (data?.lookup.user?.id === currentUser?.id) return EditMode.edit;
    return EditMode.readOnly;
  })();

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  const user = data?.lookup.user;

  const handleSave = async (userToUpdate: UserModel) => {
    const profileId = userToUpdate.profile?.id;
    const tagsetsToAdd = userToUpdate.profile?.tagsets?.filter(x => !x.id) ?? [];

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

    const currentUserUrl = getProfileUrl(currentUser?.profile?.url) || '';
    if (currentUser) {
      navigate(currentUserUrl, { replace: true });
    }
  };

  return (
    <StorageConfigContextProvider locationType="user" userId={user?.id!}>
      <UserAdminLayout currentTab={SettingsSection.MyProfile}>
        <PageContentColumn columns={12}>
          <PageContentBlock>
            <UserForm user={user} avatar={user?.profile?.avatar} editMode={editMode} onSave={handleSave} />
          </PageContentBlock>
        </PageContentColumn>
      </UserAdminLayout>
    </StorageConfigContextProvider>
  );
};

export default UserAdminProfilePage;
