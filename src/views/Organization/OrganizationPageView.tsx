import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrganizationContainerEntities,
  OrganizationContainerState,
} from '../../containers/organization/OrganizationPageContainer';
import { OrganizationVerificationEnum } from '../../models/graphql-schema';
import { buildAdminOrganizationUrl } from '../../utils/urlBuilders';
import AssociatesView from '../ProfileView/AssociatesView';
import ContributionsView from '../ProfileView/ContributionsView';
import OrganizationProfileView, { OrganizationProfileViewEntity } from '../ProfileView/OrganizationProfileView';

interface OrganizationPageViewProps {
  entities: OrganizationContainerEntities;
  state: OrganizationContainerState;
}

export const OrganizationPageView: FC<OrganizationPageViewProps> = ({ entities }) => {
  const { t } = useTranslation();

  const { permissions, socialLinks, links, organization, capabilities, keywords, associates, contributions } = entities;

  const tagsets = useMemo(
    () => [
      { name: t('components.profile.fields.keywords.title'), tags: keywords },
      { name: t('components.profile.fields.capabilities.title'), tags: capabilities },
    ],
    [keywords, capabilities]
  );

  const entity = useMemo(
    () =>
      ({
        avatar: organization?.profile.avatar?.uri,
        displayName: organization?.displayName || '',
        settingsTooltip: t('pages.organization.settings.tooltip'),
        settingsUrl: buildAdminOrganizationUrl(organization?.nameID || ''),
        bio: organization?.profile.description,
        verified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
        tagsets,
        socialLinks,
        links,
        location: organization?.profile?.location,
      } as OrganizationProfileViewEntity),
    [organization, tagsets, socialLinks, links]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} xl={6}>
        <OrganizationProfileView entity={entity} permissions={permissions} />
      </Grid>
      <Grid item xs={12} xl={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <AssociatesView associates={associates} />
          </Grid>
          <Grid item xs={12}>
            <ContributionsView
              title={t('components.contributions.title')}
              helpText={t('components.contributions.help')}
              contributions={contributions}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OrganizationPageView;
