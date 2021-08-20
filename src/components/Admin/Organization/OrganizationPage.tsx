import React, { FC, useMemo } from 'react';
import { useApolloErrorHandler, useNotification, useUpdateNavigation } from '../../../hooks';
import {
  refetchOrganizationsListQuery,
  useCreateOrganizationMutation,
  useCreateTagsetOnProfileMutation,
  useUpdateOrganizationMutation,
} from '../../../hooks/generated/graphql';
import { useNavigateToEdit } from '../../../hooks/useNavigateToEdit';
import {
  CreateOrganisationInput,
  Organisation,
  Reference,
  Tagset,
  UpdateOrganisationInput,
} from '../../../models/graphql-schema';
import { PageProps } from '../../../pages';
import { EditMode } from '../../../utils/editMode';
import OrganizationForm from './OrganizationForm';
import { logger } from '../../../services/logging/winston/logger';
interface Props extends PageProps {
  organization?: Organisation;
  title?: string;
  mode: EditMode;
}

const OrganizationPage: FC<Props> = ({ organization, title, mode, paths }) => {
  const handleError = useApolloErrorHandler();
  const currentPaths = useMemo(
    () => [...paths, { name: organization?.displayName ? 'edit' : 'new', real: false }],
    [paths]
  );
  const notify = useNotification();
  const navigateToEdit = useNavigateToEdit();
  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => logger.error(error.message),
  });
  useUpdateNavigation({ currentPaths });

  const [createOrganization] = useCreateOrganizationMutation({
    onCompleted: data => {
      const organizationId = data.createOrganisation.nameID;
      if (organizationId) {
        notify('Organization created successfully', 'success');
        navigateToEdit(organizationId);
      }
    },
    onError: handleError,
    awaitRefetchQueries: true,
    refetchQueries: [refetchOrganizationsListQuery()],
  });

  const [updateOrganization] = useUpdateOrganizationMutation({
    onError: handleError,
    onCompleted: () => {
      notify('Organization updated successfully', 'success');
    },
  });

  const handleSubmit = async (editedOrganization: Organisation) => {
    const { id: orgID, nameID, profile, ...rest } = editedOrganization;

    if (mode === EditMode.new) {
      const organisationInput: CreateOrganisationInput = {
        ...rest,
        nameID,
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
      const references = editedOrganization.profile.references || [];
      const tagsetsToAdd = editedOrganization.profile.tagsets?.filter(x => !x.id) || [];

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

      const organisationInput: UpdateOrganisationInput = {
        ID: orgID,
        ...rest,
        profileData: {
          ID: profileId || '',
          avatar: profile.avatar,
          description: profile.description || '',
          references: references.map(x => ({
            ID: x.id,
            description: x.description,
            name: x.name,
            uri: x.uri,
          })),
          tagsets: profile?.tagsets?.filter(t => t.id).map(t => ({ ID: t.id, name: t.name, tags: [...t.tags] })) || [],
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
