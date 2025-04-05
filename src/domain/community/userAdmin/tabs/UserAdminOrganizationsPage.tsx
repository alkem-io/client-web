import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import AssociatedOrganizationsLazilyFetched from '@/domain/community/contributor/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import { useUserMetadata } from '../../../../_deprecated/toKeep/useUserMetadata';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useUserOrganizationIds from '../../user/userContributions/useUserOrganizationIds';

const UserAdminOrganizationsPage = () => {
  const { t } = useTranslation();
  const { userId } = useUrlResolver();
  const { user: userMetadata, loading } = useUserMetadata(userId);
  const organizationIds = useUserOrganizationIds(userMetadata?.user.id);

  return (
    <UserAdminLayout currentTab={SettingsSection.Organizations}>
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
    </UserAdminLayout>
  );
};

export default UserAdminOrganizationsPage;
