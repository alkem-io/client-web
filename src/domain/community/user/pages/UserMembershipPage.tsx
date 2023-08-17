import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { ContributionsView } from '../../profile/views/ProfileView';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { useUserMetadata } from '../hooks/useUserMetadata';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';

export interface UserMembershipPageProps {}

const UserMembershipPage: FC<UserMembershipPageProps> = () => {
  const { t } = useTranslation();
  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userNameId);

  return (
    <UserSettingsLayout currentTab={SettingsSection.Membership}>
      <GridProvider columns={12}>
        <ContributionsView
          title={t('common.my-memberships')}
          helpText={t('pages.user-profile.communities.help')}
          contributions={userMetadata?.contributions || []}
          loading={loading}
          enableLeave
        />
      </GridProvider>
      <SectionSpacer />
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <ContributionsView
            title={t('pages.user-profile.pending-applications.title')}
            helpText={t('pages.user-profile.pending-applications.help')}
            contributions={userMetadata?.pendingApplications || []}
            loading={loading}
          />
        </Grid>
      </Grid>
    </UserSettingsLayout>
  );
};

export default UserMembershipPage;
