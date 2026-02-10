import { useMemo } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { UserForm } from '../../user/userForm/UserForm';
import Loading from '@/core/ui/loading/Loading';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  useCreateTagsetOnProfileMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { EditMode } from '@/core/ui/forms/editMode';
import { UserModel } from '../../user/models/UserModel';
import { getUpdateUserInput } from '../../user/utils/getUpdateUserInput';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import useUserRouteContext from '../../user/routing/useUserRouteContext';

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
    onError: error => console.error(error.message),
  });

  const [updateUser] = useUpdateUserMutation({
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const editMode = useMemo(() => {
    if (data?.lookup.user?.id === currentUser?.id) return EditMode.edit;
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

    const currentUserUrl = getProfileUrl(currentUser?.profile.url) || '';
    if (currentUser) {
      navigate(currentUserUrl, { replace: true });
    }
  };

  return (
    <StorageConfigContextProvider locationType="user" userId={user?.id!}>
      <UserAdminLayout currentTab={SettingsSection.MyProfile}>
        <PageContentColumn columns={12}>
          <PageContentBlock>
            <UserForm user={user} avatar={user?.profile.avatar} editMode={editMode} onSave={handleSave} />
          </PageContentBlock>
        </PageContentColumn>
      </UserAdminLayout>
    </StorageConfigContextProvider>
  );
};

export default UserAdminProfilePage;
