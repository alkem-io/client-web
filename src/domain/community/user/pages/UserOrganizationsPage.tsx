import { Grid } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '@core/routing/useUrlParams';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import AssociatedOrganizationsLazilyFetched from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import { useUserMetadata } from '../hooks/useUserMetadata';
import { AuthorizationPrivilege } from '@core/apollo/generated/graphql-schema';
import useUserOrganizationIds from '../userContributions/useUserOrganizationIds';

const UserOrganizationsPage = () => {
  const { t } = useTranslation();
  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userNameId);
  const organizationIds = useUserOrganizationIds(userMetadata?.user.id);

  return (
    <UserSettingsLayout currentTab={SettingsSection.Organizations}>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <AssociatedOrganizationsLazilyFetched
            enableLeave
            canCreateOrganization={
              userMetadata?.hasPlatformPrivilege(AuthorizationPrivilege.CreateOrganization) ?? false
            }
            organizationIds={organizationIds ?? []}
            title={t('pages.user-profile.associated-organizations.title')}
            helpText={t('pages.user-profile.associated-organizations.help')}
            loading={loading}
            dense
          />
        </Grid>
      </Grid>
    </UserSettingsLayout>
  );
};

export default UserOrganizationsPage;
