import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useNotification, useOrganization, useUpdateNavigation } from '../../../../hooks';
import {
  useCreateOrganizationMutation,
  useCreateTagsetOnProfileMutation,
  useOrganizationProfileInfoQuery,
  useUpdateOrganizationMutation,
} from '../../../../hooks/generated/graphql';
import { useNavigateToEdit } from '../../../../hooks/useNavigateToEdit';
import { EditMode } from '../../../../models/editMode';
import { CreateOrganizationInput, UpdateOrganizationInput, Organization } from '../../../../models/graphql-schema';
import { PageProps } from '../../../../pages';
import { logger } from '../../../../services/logging/winston/logger';
import { Loading } from '../../../../common/components/core';
import OrganizationForm from './OrganizationForm';
import clearCacheForQuery from '../../../shared/utils/apollo-cache/clearCacheForQuery';
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
        notify(t('pages.admin.organization.notifications.organization-created'), 'success');
        navigateToEdit(organizationId);
      }
    },
    onError: handleError,
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
  });

  const [updateOrganization] = useUpdateOrganizationMutation({
    onError: handleError,
    onCompleted: () => {
      notify('Organization updated successfully', 'success');
    },
  });

  const handleSubmit = async (editedOrganization: CreateOrganizationInput | UpdateOrganizationInput) => {
    if (mode === EditMode.new) {
      const { nameID, profileData, contactEmail, displayName, domain, legalEntityName, website } =
        editedOrganization as CreateOrganizationInput;

      const input: CreateOrganizationInput = {
        nameID,
        contactEmail: contactEmail,
        displayName: displayName,
        domain: domain,
        legalEntityName: legalEntityName,
        website: website,
        profileData: {
          description: profileData?.description,
          referencesData: profileData?.referencesData,
          tagsetsData: profileData?.tagsetsData,
        },
      };

      createOrganization({
        variables: {
          input,
        },
      });
    }

    if (mode === EditMode.edit) {
      const {
        ID: orgID,
        nameID,
        profileData,
        contactEmail,
        displayName,
        domain,
        legalEntityName,
        website,
      } = editedOrganization as UpdateOrganizationInput;
      const profileId = organization?.profile?.id;
      const references = profileData?.references;
      const tagsetsToAdd = profileData?.tagsets?.filter(x => !x.ID) || [];

      for (const tagset of tagsetsToAdd) {
        if (tagset.name && tagset.tags) {
          await createTagset({
            variables: {
              input: {
                name: tagset.name,
                tags: tagset.tags,
                profileID: profileId,
              },
            },
          });
        }
      }
      const input: UpdateOrganizationInput = {
        ID: orgID,
        nameID,
        contactEmail: contactEmail,
        displayName: displayName,
        domain: domain,
        legalEntityName: legalEntityName,
        website: website,
        profileData: {
          ID: profileId || '',
          description: profileData?.description,
          location: {
            city: profileData?.location?.city,
            country: profileData?.location?.country,
          },
          references: references,
          tagsets: profileData?.tagsets?.filter(t => t.ID),
        },
      };

      updateOrganization({
        variables: {
          input,
        },
      });
    }
  };

  if (loading) return <Loading text={t('components.loading.message', { blockName: t('common.organization') })} />;

  return (
    <OrganizationForm organization={organization as Organization} onSave={handleSubmit} editMode={mode} title={title} />
  );
};

export default OrganizationPage;
