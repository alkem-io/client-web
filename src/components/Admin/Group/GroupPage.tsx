import React, { FC, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useCreateTagsetOnProfileMutation,
  useDeleteGroupMutation,
  useUpdateGroupMutation,
  useUsersWithCredentialsQuery,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
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
import GroupForm from './GroupForm';

interface Params {
  ecoverseId: string;
}

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

  const { ecoverseId } = useParams<Params>();
  const history = useHistory();
  const groupRoute = `/admin/ecoverses/${ecoverseId}/community/groups`;

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
    onCompleted: data => success(`Group ${data.updateUserGroup.name} has been update!`),
  });

  const [createTagset] = useCreateTagsetOnProfileMutation({ onError: handleError });

  const members = membersData?.usersWithAuthorizationCredential.map(u => u as User) || [];

  const [deleteGroup] = useDeleteGroupMutation({
    onCompleted: data => {
      success(`Group ${data.deleteUserGroup.name} deleted successfully`);
      history.push(groupRoute);
    },
    onError: handleError,
    // todo: wrap into util function
    update: (cache, { data }) => {
      if (data) {
        const { id, __typename } = data.deleteUserGroup;
        const normalizedId = cache.identify({ id: id, __typename: __typename });
        cache.evict({ id: normalizedId });
        cache.gc();
      }
    },
  });

  const handleCancel = () => history.push(groupRoute);

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

  const handleDelete = (id: string) => {
    deleteGroup({
      variables: {
        input: {
          ID: id,
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
