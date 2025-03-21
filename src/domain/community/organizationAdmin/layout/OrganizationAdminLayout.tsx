import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import OrganizationPageBanner from '@/domain/community/contributor/organization/OrganizationPageBanner';
import { useOrganizationContext } from '@/domain/community/contributor/organization/hooks/useOrganizationContext';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { Diversity3Outlined, Settings } from '@mui/icons-material';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import EntitySettingsLayout from '../../../platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { organizationAdminTabs } from '../OrganizationAdminTabs';
import useOrganizationProvider from '../../contributor/organization/useOrganization/useOrganization';

interface OrganizationAdminLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const OrganizationAdminLayout: FC<OrganizationAdminLayoutProps> = props => {
  const entityAttrs = useOrganizationContext();

  const { t } = useTranslation();

  const { organization, permissions, handleSendMessage, loading } = useOrganizationProvider();

  return (
    <EntitySettingsLayout
      entityTypeName="organization"
      subheaderTabs={organizationAdminTabs}
      pageBanner={
        <OrganizationPageBanner
          organization={organization}
          canEdit={permissions.canEdit}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      }
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem iconComponent={Diversity3Outlined}>{t('common.organizations')}</BreadcrumbsItem>
          <BreadcrumbsItem
            loading={loading}
            avatar={organization?.profile.avatar}
            iconComponent={Diversity3Outlined}
            uri={organization?.profile.url}
          >
            {organization?.profile.displayName}
          </BreadcrumbsItem>
          <BreadcrumbsItem iconComponent={Settings}>{t('common.settings')}</BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      {...entityAttrs}
      {...props}
    />
  );
};

export default OrganizationAdminLayout;
