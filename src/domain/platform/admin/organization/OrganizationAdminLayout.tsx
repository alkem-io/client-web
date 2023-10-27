import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useOrganization } from '../../../community/contributor/organization/hooks/useOrganization';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import OrganizationPageBanner from '../../../community/organization/layout/OrganizationPageBanner';
import OrganizationTabs from '../../../community/contributor/organization/layout/OrganizationTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import OrganizationPageContainer from '../../../community/contributor/organization/OrganizationPageContainer/OrganizationPageContainer';

const tabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Profile,
    route: 'profile',
    icon: PeopleOutlinedIcon,
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

const AutonomousBanner = () => {
  return (
    <OrganizationPageContainer>
      {({ organization, permissions, handleSendMessage }, { loading }) => (
        <OrganizationPageBanner
          organization={organization}
          canEdit={permissions.canEdit}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      )}
    </OrganizationPageContainer>
  );
};

const OrganizationAdminLayout: FC<OrganizationAdminLayoutProps> = props => {
  const entityAttrs = useOrganization();

  return (
    <EntitySettingsLayout
      entityTypeName="organization"
      tabs={tabs}
      pageBannerComponent={AutonomousBanner}
      tabsComponent={OrganizationTabs}
      {...entityAttrs}
      {...props}
    />
  );
};

export default OrganizationAdminLayout;
