import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  useCreateTagsetOnProfileMutation,
  useUpdateGroupMutation,
  useUsersWithCredentialsQuery,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/graphql/useApolloErrorHandler';
import { useDeleteUserGroup } from '../../../hooks/useDeleteUserGroup';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { useNotification } from '../../../hooks/useNotification';
import { PageProps } from '../../../pages';
import {
  AuthorizationCredential,
  Maybe,
  Profile,
  UpdateProfileInput,
  User,
  UserGroup,
} from '../../../types/graphql-schema';
import { urlStrip } from '../../../utils/urlStrip';
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
  const { url } = useRouteMatch();
  const notify = useNotification();
  const success = (message: string) => notify(message, 'success');
  const handleError = useApolloErrorHandler();

  const history = useHistory();
  const returnRoute = urlStrip(url);

  const { handleDelete } = useDeleteUserGroup({
    onComplete: () => history.push(returnRoute),
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

  const [createTagset] = useCreateTagsetOnProfileMutation({ onError: handleError });

  const members = membersData?.usersWithAuthorizationCredential.map(u => u as User) || [];

  const handleCancel = () => history.push(returnRoute);

  const handleSave = async (group: UserGroup) => {
    const profileId = group.profile?.id || '';
    const tagsetsToAdd = group.profile?.tagsets?.filter(x => !x.id) || [];

    for (const tagset of tagsetsToAdd) {
      debugger;
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
