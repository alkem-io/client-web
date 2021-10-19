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
import ContributionView from '../ProfileView/ContributionView';
import ProfileView, { ProfileViewProps } from '../ProfileView/ProfileView';

interface OrganizationPageViewProps {
  entities: OrganizationContainerEntities;
  state: OrganizationContainerState;
}

export const OrganizationPageView: FC<OrganizationPageViewProps> = ({ entities }) => {
  const { t } = useTranslation();

  const { permissions, socialLinks, links, organization, skills, keywords } = entities;

  const tagsets = useMemo(
    () => [
      { name: 'Keywords', tags: keywords },
      { name: 'Skills', tags: skills },
    ],
    [keywords, skills]
  );

  const associates = [
    { name: 'Isabella Bookmaker', title: 'Owner', src: '' },
    { name: 'James Yellowflower', title: 'Owner', src: '' },
    { name: 'Masha Fence', title: 'Owner', src: '' },
    { name: 'Maddie Thinker', title: 'Owner', src: '' },
    { name: 'Josh Hipster', title: 'Owner', src: '' },
    { name: 'Nathalie Shadow', title: 'Owner', src: '' },
    { name: 'Jamie Blackwhite', title: 'Owner', src: '' },
    { name: 'Kevin Toghguy', title: 'Owner', src: '' },
    { name: 'Brandon Furrow', title: 'Owner', src: '' },
    { name: 'Natash Orange', title: 'Owner', src: '' },
    { name: 'Bella Leaner', title: 'Owner', src: '' },
    { name: 'Claire Influencer', title: 'Owner', src: '' },
    { name: 'Mason Thinkhard', title: 'Owner', src: '' },
    { name: 'Bram Airborne', title: 'Owner', src: '' },
    { name: 'Leigh-Anne Earrings', title: 'Owner', src: '' },
  ];

  const contributions = [
    { name: 'PET-Technologie', type: 'challenge', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
    { name: 'Care for data', type: 'opportunity', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
    { name: 'Care for data', type: 'challenge', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
    {
      name: 'PET-Technologie',
      type: 'opportunity',
      tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'],
      img: '',
    },
    { name: 'PET-Technologie', type: 'challenge', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
  ];

  const entity: ProfileViewProps['entity'] = useMemo(
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
        <ProfileView entity={entity} permissions={permissions} />
      </Grid>
      <Grid item xs={12} xl={5}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <AssociatesView associates={associates} />
          </Grid>
          <Grid item xs={12}>
            <ContributionView contributions={contributions} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OrganizationPageView;
