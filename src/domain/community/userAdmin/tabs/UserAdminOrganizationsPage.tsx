import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import AssociatedOrganizationsLazilyFetched from '@/domain/community/contributor/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import { useUserMetadata } from '../../../../_deprecated/useUserMetadata';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useUserOrganizationIds from '../../user/userContributions/useUserOrganizationIds';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';

const UserAdminOrganizationsPage = () => {
  const { t } = useTranslation();
  const { userId } = useUrlResolver();
  const { userWrapper: currentUser } = useCurrentUserContext();
  const { user: userModel, loading } = useUserMetadata(userId);
  const organizationIds = useUserOrganizationIds(userModel?.id);

  return (
    <UserAdminLayout currentTab={SettingsSection.Organizations}>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <AssociatedOrganizationsLazilyFetched
            enableLeave
            canCreateOrganization={
              currentUser?.hasPlatformPrivilege(AuthorizationPrivilege.CreateOrganization) ?? false
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
