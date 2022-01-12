import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApolloErrorHandler, useDeleteUserGroup, useNotification, useUpdateNavigation } from '../../../hooks';
import {
  useCreateTagsetOnProfileMutation,
  useUpdateGroupMutation,
  useUsersWithCredentialsQuery,
} from '../../../hooks/generated/graphql';
import {
  AuthorizationCredential,
  Maybe,
  Profile,
  UpdateProfileInput,
  User,
  UserGroup,
} from '../../../models/graphql-schema';
import { PageProps } from '../../../pages';
import { logger } from '../../../services/logging/winston/logger';
import GroupForm from './GroupForm';
interface GroupPageProps extends PageProps {
  group?: UserGroup;
}

export const getUpdateProfileInput = (profile?: Profile): Maybe<UpdateProfileInput> => {
  if (!profile) return;

  return {
    ID: profile.id || '',
    avatar: profile.avatar,
    description: profile.description,
    references: profile.references?.filter(r => r.id).map(t => ({ ID: t.id, name: t.name, uri: t.uri })),
    tagsets: profile.tagsets?.filter(t => t.id).map(t => ({ ID: t.id, name: t.name, tags: [...t.tags] })),
  };
};

export const GroupPage: FC<GroupPageProps> = ({ paths, group }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const success = (message: string) => notify(message, 'success');
  const handleError = useApolloErrorHandler();

  const navigate = useNavigate();

  const { handleDelete } = useDeleteUserGroup({
    onComplete: () => navigate('..', { replace: true }),
  });

  const { data: membersData } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: AuthorizationCredential.UserGroupMember,
        resourceID: group?.id,
      },
    },
  });

  const groupName = group?.name || '';
  const currentPaths = useMemo(() => [...paths, { value: '', name: groupName, real: false }], [paths, group]);

  useUpdateNavigation({ currentPaths });
  const [updateGroup] = useUpdateGroupMutation({
    onError: handleError,
    onCompleted: data => success(t('operations.user-group.updated-successfuly', { name: data.updateUserGroup.name })),
  });

  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => logger.error(error.message),
  });

  const members = membersData?.usersWithAuthorizationCredential.map(u => u as User) || [];

  const handleCancel = () => navigate('..', { replace: true });

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
    <GroupForm
      title={t('components.groupForm.title')}
      group={group || { id: '-1', name: '' }}
      members={members}
      onSave={handleSave}
      onDelete={handleDelete}
      onCancel={handleCancel}
    />
  );
};

export default GroupPage;
