import { GridLegacy } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import AssociatedOrganizationsLazilyFetched from '@/domain/community/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { useUserProvider } from '../../user/hooks/useUserProvider';
import useUserRouteContext from '../../user/routing/useUserRouteContext';
import useUserOrganizationIds from '../../user/userContributions/useUserOrganizationIds';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';

const UserAdminOrganizationsPage = () => {
  const { t } = useTranslation();
  const { userId } = useUserRouteContext();
  const { platformPrivilegeWrapper: currentUser } = useCurrentUserContext();
  const { userModel, loading } = useUserProvider(userId);
  const organizationIds = useUserOrganizationIds(userModel?.id);

  return (
    <UserAdminLayout currentTab={SettingsSection.Organizations}>
      <GridLegacy container={true} rowSpacing={4}>
        <GridLegacy item={true} xs={12}>
          <AssociatedOrganizationsLazilyFetched
            enableLeave={true}
            canCreateOrganization={
              currentUser?.hasPlatformPrivilege(AuthorizationPrivilege.CreateOrganization) ?? false
            }
            organizationIds={organizationIds ?? []}
            title={t('pages.user-profile.associated-organizations.title')}
            helpText={t('pages.user-profile.associated-organizations.help')}
            loading={loading}
            dense={true}
          />
        </GridLegacy>
      </GridLegacy>
    </UserAdminLayout>
  );
};

export default UserAdminOrganizationsPage;
