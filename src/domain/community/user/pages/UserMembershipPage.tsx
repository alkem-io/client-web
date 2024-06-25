import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { ContributionsView } from '../../profile/views/ProfileView';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { useUserMetadata } from '../hooks/useUserMetadata';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import useUserContributions from '../userContributions/useUserContributions';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';

export interface UserMembershipPageProps {}

const UserMembershipPage: FC<UserMembershipPageProps> = () => {
  const { t } = useTranslation();
  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userNameId);

  const contributions = useUserContributions(userNameId);

  const applications = useMemo<SpaceHostedItem[] | undefined>(
    () =>
      userMetadata?.pendingApplications.map(application => ({
        id: application.id,
        spaceID: application.space.id,
        spaceLevel: application.space.level,
      })),
    [userMetadata?.pendingApplications]
  );

  return (
    <UserSettingsLayout currentTab={SettingsSection.Membership}>
      <GridProvider columns={12}>
        <ContributionsView
          title={t('common.my-memberships')}
          contributions={contributions}
          loading={loading}
          enableLeave
        />
      </GridProvider>
      <SectionSpacer />
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <ContributionsView
            title={t('pages.user-profile.pending-applications.title')}
            contributions={applications}
            loading={loading}
          />
        </Grid>
      </Grid>
    </UserSettingsLayout>
  );
};

export default UserMembershipPage;
