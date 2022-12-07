import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolvedPath } from 'react-router-dom';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { useUpdateNavigation } from '../../../../../core/routing/useNavigation';
import { PageProps } from '../../../../shared/types/PageProps';
import { ContributionsView } from '../../../profile/views/ProfileView';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import UserSettingsLayout from '../../../../platform/admin/user/layout/UserSettingsLayout';
import { useUserMetadata } from '../hooks/useUserMetadata';

export interface UserMembershipPageProps extends PageProps {}

const UserMembershipPage: FC<UserMembershipPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');
  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userNameId);

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'membership', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <UserSettingsLayout currentTab={SettingsSection.Membership}>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <ContributionsView
            title={t('common.my-memberships')}
            helpText={t('pages.user-profile.communities.help')}
            contributions={userMetadata?.contributions || []}
            loading={loading}
          />
        </Grid>
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
