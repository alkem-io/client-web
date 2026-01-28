import { GridLegacy } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import AssociatedOrganizationsLazilyFetched from '@/domain/community/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useUserOrganizationIds from '../../user/userContributions/useUserOrganizationIds';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import useUserRouteContext from '../../user/routing/useUserRouteContext';

const UserAdminOrganizationsPage = () => {
  const { t } = useTranslation();
  const { userId } = useUserRouteContext();
  const { platformPrivilegeWrapper: currentUser } = useCurrentUserContext();
  const { userModel: userModel, loading } = useUserProvider(userId);
  const organizationIds = useUserOrganizationIds(userModel?.id);

  return (
    <UserAdminLayout currentTab={SettingsSection.Organizations}>
      <GridLegacy container rowSpacing={4}>
        <GridLegacy item xs={12}>
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
        </GridLegacy>
      </GridLegacy>
    </UserAdminLayout>
  );
};

export default UserAdminOrganizationsPage;
