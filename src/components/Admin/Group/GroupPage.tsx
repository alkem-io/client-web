import React, { FC, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  useCreateReferenceOnProfileMutation,
  useCreateTagsetOnProfileMutation,
  useDeleteReferenceMutation,
  useGroupQuery,
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
import Loading from '../../core/Loading';
import GroupForm from './GroupForm';
interface Parameters {
  groupId: string;
}

interface GroupPageProps extends PageProps {}

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

export const GroupPage: FC<GroupPageProps> = ({ paths }) => {
  const { groupId } = useParams<Parameters>();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const history = useHistory();
  const { data, loading } = useGroupQuery({
    variables: {
      ecoverseId: '1',
      groupId: groupId,
    },
  });
  const { data: membersData } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: AuthorizationCredential.UserGroupMember,
        resourceID: groupId,
      },
    },
  });

  const groupName = data?.ecoverse.group.name || '';
  const currentPaths = useMemo(() => [...paths, { value: '', name: groupName, real: false }], [paths, data]);

  useUpdateNavigation({ currentPaths });
  const [updateGroup] = useUpdateGroupMutation({
    onError: handleError,
    onCompleted: data => notify(`Group ${data.updateUserGroup.name} has been update!`, 'success'),
  });

  const [createReference] = useCreateReferenceOnProfileMutation({ onError: handleError });
  const [deleteReference] = useDeleteReferenceMutation({ onError: handleError });
  const [createTagset] = useCreateTagsetOnProfileMutation({ onError: handleError });

  const members = membersData?.usersWithAuthorizationCredential.map(u => u as User) || [];

  const handleCancel = () => history.goBack();

  const handleSave = async (group: UserGroup) => {
    const profileId = group.profile?.id || '';
    const initialReferences = data?.ecoverse.group.profile?.references || [];
    const references = group.profile?.references || [];
    const toRemove = initialReferences.filter(x => x.id && !references.some(r => r.id && r.id === x.id));
    const toAdd = references.filter(x => !x.id);
    const tagsetsToAdd = group.profile?.tagsets?.filter(x => !x.id) || [];

    for (const ref of toRemove) {
      await deleteReference({ variables: { input: { ID: ref.id } } });
    }

    for (const ref of toAdd) {
      await createReference({
        variables: {
          input: {
            profileID: profileId,
            name: ref.name,
            description: ref.description,
            uri: ref.uri,
          },
        },
      });
    }

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

  if (loading) return <Loading text={'Loading'} />;
  return (
    <GroupForm
      group={
        data?.ecoverse.group || {
          id: groupId,
          name: '',
        }
      }
      members={members}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default GroupPage;
