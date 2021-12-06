import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams, useUserMetadata } from '../../hooks';
import AssociatedOrganizationsView from '../../views/ProfileView/AssociatedOrganizationsView';

export interface UserOrganizationsPageProps {}

const UserOrganizationsPage: FC<UserOrganizationsPageProps> = () => {
  const { t } = useTranslation();
  const { userId } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userId);

  return (
    <Grid container rowSpacing={4}>
      <Grid item xs={12}>
        <AssociatedOrganizationsView
          organizationNameIDs={userMetadata?.organizationNameIDs || []}
          title={t('pages.user-profile.associated-organizations.title')}
          helpText={t('pages.user-profile.associated-organizations.help')}
          loading={loading}
          dense
        />
      </Grid>
    </Grid>
  );
};
export default UserOrganizationsPage;
