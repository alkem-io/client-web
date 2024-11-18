import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useOrganization } from '../../../community/contributor/organization/hooks/useOrganization';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import OrganizationPageBanner from '../../../community/organization/layout/OrganizationPageBanner';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import OrganizationPageContainer from '../../../community/contributor/organization/OrganizationPageContainer/OrganizationPageContainer';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { Diversity3Outlined, Settings, LocalOfferOutlined } from '@mui/icons-material';
import { buildOrganizationUrl } from '@/main/routing/urlBuilders';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { useTranslation } from 'react-i18next';

const tabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Profile,
    route: 'profile',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Account,
    route: 'account',
    icon: LocalOfferOutlined,
  },
  {
    section: SettingsSection.Community,
    route: 'community',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Authorization,
    route: 'authorization',
    icon: GppGoodOutlinedIcon,
  },
];

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
          subheaderTabs={tabs}
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
                uri={organization?.nameID && buildOrganizationUrl(organization?.nameID)}
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
