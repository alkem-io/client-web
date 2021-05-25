import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import {
  useCreateReferenceOnProfileMutation,
  useCreateTagsetOnProfileMutation,
  useDeleteReferenceMutation,
  useMeQuery,
  useUpdateUserMutation,
} from '../../generated/graphql';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useNotification } from '../../hooks/useNotification';
import { UserModel } from '../../models/User';
import { UpdateUserInput, User } from '../../types/graphql-schema';
import { EditMode } from '../../utils/editMode';
import { Loading } from '../core/Loading';
import { UserForm } from './UserForm';

interface EditUserProfileProps {}

// TODO [ATS] Need optimization this code is copy paste a few times.
export const getUpdateUserInput = (user: UserModel): UpdateUserInput => {
  const { id: userID, email, memberof, profile, agent, ...rest } = user;

  return {
    ...rest,
    ID: userID,
    profileData: {
      ID: user.profile.id || '',
      avatar: profile.avatar,
      description: profile.description,
      references: profile.references.filter(r => r.id).map(t => ({ ID: t.id || '', name: t.name, uri: t.uri })),
      tagsets: profile.tagsets.filter(t => t.id).map(t => ({ ID: t.id || '', name: t.name, tags: [...t.tags] })),
    },
  };
};

export const EditUserProfile: FC<EditUserProfileProps> = () => {
  const history = useHistory();
  const { data, loading } = useMeQuery();
  const notify = useNotification();
  const [createReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();
  const [createTagset] = useCreateTagsetOnProfileMutation();
  const handleError = useApolloErrorHandler();

  const [updateUser] = useUpdateUserMutation({
    onError: handleError,
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const handleCancel = () => history.goBack();

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  const user = data?.me as User;

  const handleSave = async (userToUpdate: UserModel) => {
    const profileId = userToUpdate.profile.id;
    const initialReferences = user?.profile?.references || [];
    const references = userToUpdate.profile.references;
    const toRemove = initialReferences.filter(x => x.id && !references.some(r => r.id && r.id === x.id));
    const toAdd = references.filter(x => !x.id);
    const tagsetsToAdd = userToUpdate.profile.tagsets.filter(x => !x.id);

    for (const ref of toRemove) {
      await deleteReference({ variables: { input: { ID: ref.id } } });
    }

    for (const ref of toAdd) {
      await createReference({
        variables: {
          input: {
            parentID: profileId,
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
            parentID: profileId,
          },
        },
      });
    }

    await updateUser({
      variables: {
        input: getUpdateUserInput(userToUpdate),
      },
    });
  };

  return (
    <UserForm
      title={'Profile'}
      user={{ ...user } as UserModel}
      editMode={EditMode.edit}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};
export default EditUserProfile;
