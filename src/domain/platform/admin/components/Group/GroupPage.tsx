import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useDeleteUserGroup } from './useDeleteUserGroup';
import {
  useCreateTagsetOnProfileMutation,
  useUpdateGroupMutation,
  useUsersWithCredentialsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationCredential, GroupInfoFragment, User } from '@/core/apollo/generated/graphql-schema';
import GroupForm, { UserGroupUpdateInput } from './GroupForm/GroupForm';
import { getUpdateProfileInput } from '@/domain/community/user/utils/getUpdateUserInput';
import OrganizationAdminLayout from '@/domain/platform/admin/organization/OrganizationAdminLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';

export const GroupPage = ({ group }: { group?: GroupInfoFragment }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const success = (message: string) => notify(message, 'success');

  const navigate = useNavigate();

  const { handleDelete } = useDeleteUserGroup({
    onComplete: () => navigate(-1),
  });

  const { data: membersData } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: AuthorizationCredential.UserGroupMember,
        resourceID: group?.id,
      },
    },
  });

  const [updateGroup] = useUpdateGroupMutation({
    onCompleted: data =>
      success(t('operations.user-group.updated-successfully', { name: data.updateUserGroup.profile?.displayName })),
  });

  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => console.error(error.message),
  });

  const members = membersData?.usersWithAuthorizationCredential.map(u => u as User) || [];

  const handleCancel = () => navigate(-1);

  const handleSave = async (group: UserGroupUpdateInput) => {
    const profileId = group.profile?.id || '';
    const tagsetsToAdd = group.profile?.tagsets?.filter(x => !x.id) || [];

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

    await updateGroup({
      variables: {
        input: {
          ID: group.id,
          profileData: getUpdateProfileInput(group.profile),
        },
      },
    });
  };

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community} tabRoutePrefix="../../../../">
      <GroupForm
        title={t('components.groupForm.title')}
        group={group || { id: '-1' }}
        members={members}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </OrganizationAdminLayout>
  );
};

export default GroupPage;
