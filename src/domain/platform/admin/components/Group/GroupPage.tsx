import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useDeleteUserGroup } from './useDeleteUserGroup';
import {
  useCreateTagsetOnProfileMutation,
  useUpdateGroupMutation,
  useUsersWithCredentialsQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationCredential, User, UserGroup } from '../../../../../core/apollo/generated/graphql-schema';
import { logger } from '../../../../../services/logging/winston/logger';
import GroupForm from './GroupForm/GroupForm';
import { getUpdateProfileInput } from '../../../../../common/utils/getUpdateUserInput';
import OrganizationAdminLayout from '../../organization/OrganizationAdminLayout';
import { SettingsSection } from '../../layout/EntitySettingsLayout/constants';

interface GroupPageProps {
  group?: UserGroup;
}

export const GroupPage: FC<GroupPageProps> = ({ group }) => {
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
    onCompleted: data => success(t('operations.user-group.updated-successfuly', { name: data.updateUserGroup.name })),
  });

  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => logger.error(error.message),
  });

  const members = membersData?.usersWithAuthorizationCredential.map(u => u as User) || [];

  const handleCancel = () => navigate(-1);

  const handleSave = async (group: UserGroup) => {
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
          name: group.name,
          profileData: getUpdateProfileInput(group.profile),
        },
      },
    });
  };

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community} tabRoutePrefix="../../../../">
      <GroupForm
        title={t('components.groupForm.title')}
        group={group || { id: '-1', name: '' }}
        members={members}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </OrganizationAdminLayout>
  );
};

export default GroupPage;
