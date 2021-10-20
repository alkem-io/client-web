import { Grid } from '@material-ui/core';
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
import OrganizationProfileView, { OrganizationProfileViewProps } from '../ProfileView/OrganizationProfileView';

interface OrganizationPageViewProps {
  entities: OrganizationContainerEntities;
  state: OrganizationContainerState;
}

export const OrganizationPageView: FC<OrganizationPageViewProps> = ({ entities }) => {
  const { t } = useTranslation();

  const { permissions, socialLinks, links, organization, skills, keywords, associates, contributions } = entities;

  const tagsets = useMemo(
    () => [
      { name: t('components.profile.fields.keywords.title'), tags: keywords },
      { name: t('components.profile.fields.skills.title'), tags: skills },
    ],
    [keywords, skills]
  );

  const entity: OrganizationProfileViewProps['entity'] = useMemo(
    () => ({
      avatar: organization?.profile.avatar,
      displayName: organization?.displayName || '',
      settingsTooltip: t('pages.organization.settings.tooltip'),
      settingsUrl: buildAdminOrganizationUrl(organization?.nameID || ''),
      bio: organization?.profile.description,
      varified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
      tagsets,
      socialLinks,
      links,
    }),
    [organization, tagsets]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} xl={7}>
        <OrganizationProfileView entity={entity} permissions={permissions} />
      </Grid>
      <Grid item xs={12} xl={5}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <AssociatesView associates={associates} />
          </Grid>
          <Grid item xs={12}>
            <ContributionsView contributions={contributions} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OrganizationPageView;
