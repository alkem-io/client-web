import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import {
  OrganizationProfileInfoDocument,
  useCreateOrganizationMutation,
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useUpdateOrganizationMutation,
} from '../../../generated/graphql';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { useNotification } from '../../../hooks/useNotification';
import { PageProps } from '../../../pages';
import {
  CreateOrganisationInput,
  Organisation,
  Reference,
  Tagset,
  UpdateOrganisationInput,
} from '../../../types/graphql-schema';
import { EditMode } from '../../../utils/editMode';
import OrganizationForm from './OrganizationForm';
interface Props extends PageProps {
  organization?: Organisation;
  title?: string;
  mode: EditMode;
}

const OrganizationPage: FC<Props> = ({ organization, title, mode, paths }) => {
  const currentPaths = useMemo(() => [...paths, { name: organization?.name ? 'edit' : 'new', real: false }], [paths]);
  const notify = useNotification();
  const [addReference] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  useUpdateNavigation({ currentPaths });

  const handleError = (error: ApolloError) => {
    notify(error.message, 'error');
  };

  const [createOrganization] = useCreateOrganizationMutation({
    onCompleted: () => {
      notify('Organization created successfully', 'success');
    },
    onError: error => handleError(error),
    awaitRefetchQueries: true,
    refetchQueries: ['organizationsList'],
  });

  const [updateOrganization] = useUpdateOrganizationMutation({
    onError: error => handleError(error),
    onCompleted: () => {
      notify('Organization updated successfully', 'success');
    },
    awaitRefetchQueries: true,
    refetchQueries: [{ query: OrganizationProfileInfoDocument, variables: { id: organization?.id } }],
  });

  const handleSubmit = async (editedOrganization: Organisation) => {
    const { id: orgID, textID, profile, ...rest } = editedOrganization;

    if (mode === EditMode.new) {
      const organisationInput: CreateOrganisationInput = {
        ...rest,
        textID,
        profileData: {
          avatar: profile.avatar,
          description: profile.description || '',
          referencesData: [...(profile.references as Reference[])],
          tagsetsData: [...(profile.tagsets as Tagset[])].map(t => ({ name: t.name, tags: t.tags })),
        },
      };

      createOrganization({
        variables: {
          input: organisationInput,
        },
      });
    }

    if (mode === EditMode.edit) {
      const profileId = organization?.profile?.id;
      const initialReferences = organization?.profile?.references || [];
      const references = editedOrganization.profile.references || [];
      const toRemove = initialReferences.filter(x => x.id && !references.some(r => r.id && r.id === x.id));
      const toAdd = references.filter(x => !x.id);

      for (const ref of toRemove) {
        await deleteReference({ variables: { input: { ID: Number(ref.id) } } });
      }

      for (const ref of toAdd) {
        await addReference({
          variables: {
            input: {
              parentID: Number(profileId),
              name: ref.name,
              description: ref.description,
              uri: ref.uri,
            },
          },
        });
      }
      const organisationInput: UpdateOrganisationInput = {
        ID: orgID,
        ...rest,
        profileData: {
          ID: profileId || '',
          avatar: profile.avatar,
          description: profile.description || '',
        },
      };

      updateOrganization({
        variables: {
          input: {
            ...organisationInput,
          },
        },
      });
    }
  };

  return <OrganizationForm organization={organization} onSave={handleSubmit} editMode={mode} title={title} />;
};

export default OrganizationPage;
