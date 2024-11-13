import React from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { Box, Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AdminSection } from '../layout/toplevel/constants';
import { AuthorizationCredential, PlatformRole } from '@core/apollo/generated/graphql-schema';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PlatformRoleAssignementPage from './PlatformRoleAssignementPage';
import { gutters } from '@core/ui/grid/utils';

interface AdminAuthorizationPageProps {
  credential?: AuthorizationCredential;
}

const tabs = [
  {
    title: 'Global admins',
    authorizationCredential: AuthorizationCredential.GlobalAdmin,
    platformRole: PlatformRole.GlobalAdmin,
  },
  {
    title: 'Support',
    authorizationCredential: AuthorizationCredential.GlobalSupport,
    platformRole: PlatformRole.Support,
  },
  {
    title: 'License Manager',
    authorizationCredential: AuthorizationCredential.GlobalLicenseManager,
    platformRole: PlatformRole.LicenseManager,
  },
  {
    title: 'Community Reader',
    authorizationCredential: AuthorizationCredential.GlobalCommunityRead,
    platformRole: PlatformRole.CommunityReader,
  },
  {
    title: 'Spaces Reader',
    authorizationCredential: AuthorizationCredential.GlobalSpacesReader,
    platformRole: PlatformRole.SpacesReader,
  },
  {
    title: 'Beta Testers',
    authorizationCredential: AuthorizationCredential.BetaTester,
    platformRole: PlatformRole.BetaTester,
  },
  {
    title: 'VC Campaign',
    authorizationCredential: AuthorizationCredential.VcCampaign,
    platformRole: PlatformRole.VcCampaign,
  },
];

const AdminAuthorizationPage = ({ credential }: AdminAuthorizationPageProps) => {
  const selectedTab: AuthorizationCredential | '_none' = credential ?? '_none';

  return (
    <AdminLayout currentTab={AdminSection.Authorization}>
      <TabContext value={selectedTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList sx={{ '.MuiTabs-flexContainer': { gap: gutters() } }}>
            {tabs.map(tab => (
              <Tab
                key={tab.authorizationCredential}
                value={tab.authorizationCredential}
                component={RouterLink}
                to={`/admin/authorization/roles/${tab.authorizationCredential}`}
                label={tab.title}
              />
            ))}
          </TabList>
        </Box>
        <TabPanel value="_none" />
        {tabs.map(tab => (
          <TabPanel key={tab.authorizationCredential} value={tab.authorizationCredential}>
            <PlatformRoleAssignementPage
              role={tab.platformRole}
              authorizationCredential={tab.authorizationCredential}
            />
          </TabPanel>
        ))}
      </TabContext>
    </AdminLayout>
  );
};

export default AdminAuthorizationPage;
