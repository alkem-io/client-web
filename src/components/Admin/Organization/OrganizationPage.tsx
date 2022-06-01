import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useNotification, useOrganization, useUpdateNavigation } from '../../../hooks';
import {
  refetchOrganizationsListQuery,
  useCreateOrganizationMutation,
  useCreateTagsetOnProfileMutation,
  useOrganizationProfileInfoQuery,
  useUpdateOrganizationMutation,
} from '../../../hooks/generated/graphql';
import { useNavigateToEdit } from '../../../hooks/useNavigateToEdit';
import { EditMode } from '../../../models/editMode';
import {
  CreateOrganizationInput,
  Organization,
  Reference,
  Tagset,
  UpdateOrganizationInput,
} from '../../../models/graphql-schema';
import { PageProps } from '../../../pages';
import { logger } from '../../../services/logging/winston/logger';
import { Loading } from '../../core';
import OrganizationForm from './OrganizationForm';
interface Props extends PageProps {
  title?: string;
  mode: EditMode;
}

const OrganizationPage: FC<Props> = ({ title, mode, paths }) => {
  const handleError = useApolloErrorHandler();
  const { t } = useTranslation();
  const { organizationNameId } = useOrganization();

  const { data, loading } = useOrganizationProfileInfoQuery({
    variables: { id: organizationNameId },
    fetchPolicy: 'cache-and-network',
    skip: !organizationNameId,
  });

  const organization = data?.organization;

  const currentPaths = useMemo(
    () => [...paths, { name: t(`common.enums.edit-mode.${mode}` as const), real: false }],
    [paths]
  );
  const notify = useNotification();
  const navigateToEdit = useNavigateToEdit();
  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification handler.
    // there is an issue handling multiple snackbars.
    onError: error => logger.error(error.message),
  });
  useUpdateNavigation({ currentPaths });

  const [createOrganization] = useCreateOrganizationMutation({
    onCompleted: data => {
      const organizationId = data.createOrganization.nameID;
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

  const undefinedIfEmpty = (value: string | undefined) => {
    if (!value) return;
    return value === '' ? undefined : value;
  };

  const handleSubmit = async (editedOrganization: Organization) => {
    const {
      id: orgID,
      nameID,
      profile,
      contactEmail,
      displayName,
      domain,
      legalEntityName,
      website,
    } = editedOrganization;

    if (mode === EditMode.new) {
      const input: CreateOrganizationInput = {
        nameID,
        contactEmail: undefinedIfEmpty(contactEmail),
        displayName: displayName,
        domain: domain,
        legalEntityName: legalEntityName,
        website: website,
        profileData: {
          description: profile.description,
          referencesData: [...(profile.references as Reference[])],
          tagsetsData: [...(profile.tagsets as Tagset[])].map(t => ({ name: t.name, tags: t.tags })),
        },
      };

      createOrganization({
        variables: {
          input: input,
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
      const organizationInput: UpdateOrganizationInput = {
        ID: orgID,
        nameID,
        contactEmail: undefinedIfEmpty(contactEmail),
        displayName: displayName,
        domain: domain,
        legalEntityName: legalEntityName,
        website: website,
        profileData: {
          ID: profileId || '',
          description: profile.description,
          location: {
            city: profile.location?.city || '',
            country: profile.location?.country || '',
          },
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
            ...organizationInput,
          },
        },
      });
    }
  };

  if (loading) return <Loading text={t('components.loading.message', { blockName: t('common.organization') })} />;

  return <OrganizationForm organization={organization} onSave={handleSubmit} editMode={mode} title={title} />;
};

export default OrganizationPage;
