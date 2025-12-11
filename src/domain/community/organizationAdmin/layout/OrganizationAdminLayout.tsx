import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { Diversity3Outlined, Settings } from '@mui/icons-material';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import EntitySettingsLayout from '../../../platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '../../../platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { organizationAdminTabs } from '../OrganizationAdminTabs';
import useOrganizationProvider from '../../organization/useOrganization/useOrganization';

interface OrganizationAdminLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const OrganizationAdminLayout: FC<OrganizationAdminLayoutProps> = props => {
  const entityAttrs = useOrganizationContext();

  const { t } = useTranslation();

  const { organization, loading } = useOrganizationProvider();

  return (
    <EntitySettingsLayout
      entityTypeName="organization"
      subheaderTabs={organizationAdminTabs}
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
