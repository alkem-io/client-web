import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../components/core';
import { useUrlParams, useUserMetadata } from '../../hooks';
import AssociatedOrganizationsView from '../../views/ProfileView/AssociatedOrganizationsView';

export interface UserOrganizationsPageProps {}

const UserOrganizationsPage: FC<UserOrganizationsPageProps> = () => {
  const { t } = useTranslation();
  const { userId } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userId);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  return (
    <Grid container rowSpacing={4}>
      <Grid item xs={12}>
        <AssociatedOrganizationsView
          organizationNameIDs={userMetadata?.organizationNameIDs || []}
          title={t('pages.user-profile.associated-organizations.title')}
          helpText={t('pages.user-profile.associated-organizations.help')}
          dense
        />
      </Grid>
    </Grid>
  );
};
export default UserOrganizationsPage;
