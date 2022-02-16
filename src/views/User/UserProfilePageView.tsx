import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AssociatedOrganizationsView from '../ProfileView/AssociatedOrganizationsView';
import { ContributionsView } from '../ProfileView';
import UserProfileView, { UserProfileViewProps } from '../ProfileView/UserProfileView';

export interface UserProfileViewPageProps extends UserProfileViewProps {}

export const UserProfilePageView: FC<UserProfileViewPageProps> = ({ entities, options }) => {
  const { t } = useTranslation();
  const { contributions, pendingApplications, organizationNameIDs, permissions } = entities.userMetadata;

  return (
    <Grid container spacing={2}>
      <Grid item container xs={12} xl={6} direction="column" spacing={2}>
        <Grid item>
          <UserProfileView entities={entities} options={options} />
        </Grid>
        <Grid item>
          <AssociatedOrganizationsView
            organizationNameIDs={organizationNameIDs}
            canCreateOrganization={permissions.canCreateOrganization}
            title={t('pages.user-profile.associated-organizations.title')}
            helpText={t('pages.user-profile.associated-organizations.help')}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} xl={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ContributionsView
              title={t('pages.user-profile.communities.title')}
              helpText={t('pages.user-profile.communities.help')}
              contributions={contributions}
            />
          </Grid>
          <Grid item xs={12}>
            <ContributionsView
              title={t('pages.user-profile.pending-applications.title')}
              helpText={t('pages.user-profile.pending-applications.help')}
              contributions={pendingApplications}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default UserProfilePageView;
