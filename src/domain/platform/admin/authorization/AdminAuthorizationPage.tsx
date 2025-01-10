import React from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { Box, Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AdminSection } from '../layout/toplevel/constants';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PlatformRoleAssignementPage from './PlatformRoleAssignementPage';
import { gutters } from '@/core/ui/grid/utils';

interface AdminAuthorizationPageProps {
  role?: RoleName;
}

const tabs = [
  {
    title: 'Global admins',
    platformRole: RoleName.GlobalAdmin,
  },
  {
    title: 'Support',
    platformRole: RoleName.GlobalSupport,
  },
  {
    title: 'License Manager',
    platformRole: RoleName.GlobalLicenseManager,
  },
  {
    title: 'Community Reader',
    platformRole: RoleName.GlobalCommunityReader,
  },
  {
    title: 'Spaces Reader',
    platformRole: RoleName.GlobalSpacesReader,
  },
  {
    title: 'Beta Testers',
    platformRole: RoleName.PlatformBetaTester,
  },
  {
    title: 'VC Campaign',
    platformRole: RoleName.PlatformVcCampaign,
  },
];

const AdminAuthorizationPage = ({ role }: AdminAuthorizationPageProps) => {
  const selectedTab: RoleName | '_none' = role ?? '_none'; // TODO: test + tidy up

  return (
    <AdminLayout currentTab={AdminSection.Authorization}>
      <TabContext value={selectedTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList sx={{ '.MuiTabs-flexContainer': { gap: gutters() } }}>
            {tabs.map(tab => (
              <Tab
                key={tab.platformRole}
                value={tab.platformRole}
                component={RouterLink}
                to={`/admin/authorization/roles/${tab.platformRole}`}
                label={tab.title}
              />
            ))}
          </TabList>
        </Box>
        <TabPanel value="_none" />
        {tabs.map(tab => (
          <TabPanel key={tab.platformRole} value={tab.platformRole}>
            <PlatformRoleAssignementPage role={tab.platformRole} />
          </TabPanel>
        ))}
      </TabContext>
    </AdminLayout>
  );
};

export default AdminAuthorizationPage;
