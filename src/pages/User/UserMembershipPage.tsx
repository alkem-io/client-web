import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../components/core';
import { useUrlParams, useUserMetadata } from '../../hooks';
import { ContributionsView } from '../../views/ProfileView';

export interface UserMembershipPageProps {}

const UserMembershipPage: FC<UserMembershipPageProps> = () => {
  const { t } = useTranslation();
  const { userId } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userId);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  return (
    <Grid container rowSpacing={4}>
      <Grid item xs={12}>
        <ContributionsView
          title={t('common.my-memberships')}
          helpText={t('pages.user-profile.communities.help')}
          contributions={userMetadata?.contributions || []}
        />
      </Grid>
      <Grid item xs={12}>
        <ContributionsView
          title={t('pages.user-profile.pending-applications.title')}
          helpText={t('pages.user-profile.pending-applications.help')}
          contributions={userMetadata?.pendingApplications || []}
        />
      </Grid>
    </Grid>
  );
};
export default UserMembershipPage;
