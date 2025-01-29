import React, { FC } from 'react';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import EntitySettingsLayout from '../../../platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import OrganizationPageBanner from '@/domain/community/contributor/organization/OrganizationPageBanner';
import OrganizationPageContainer from '@/domain/community/contributor/organization/OrganizationPageContainer/OrganizationPageContainer';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { Diversity3Outlined, Settings } from '@mui/icons-material';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { useTranslation } from 'react-i18next';
import { organizationAdminTabs } from '../OrganizationAdminTabs';

interface OrganizationAdminLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const OrganizationAdminLayout: FC<OrganizationAdminLayoutProps> = props => {
  const entityAttrs = useOrganization();

  const { t } = useTranslation();

  return (
    <OrganizationPageContainer>
      {({ organization, permissions, handleSendMessage }, { loading }) => (
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
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationAdminLayout;
