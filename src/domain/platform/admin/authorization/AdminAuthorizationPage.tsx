import React from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { Box, Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AdminSection } from '../layout/toplevel/constants';
import { AuthorizationCredential, PlatformRole } from '../../../../core/apollo/generated/graphql-schema';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PlatformRoleAssignementPage from './PlatformRoleAssignementPage';
import { gutters } from '../../../../core/ui/grid/utils';

interface AdminAuthorizationPageProps {
  credential?: AuthorizationCredential;
}

const AdminAuthorizationPage = ({ credential }: AdminAuthorizationPageProps) => {
  const selectedTab: AuthorizationCredential | '_none' = credential ?? '_none';

  return (
    <AdminLayout currentTab={AdminSection.Authorization}>
      <TabContext value={selectedTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList sx={{ '.MuiTabs-flexContainer': { gap: gutters() } }}>
            <Tab
              value={AuthorizationCredential.GlobalAdmin}
              component={RouterLink}
              to={`/admin/authorization/roles/${AuthorizationCredential.GlobalAdmin}`}
              label="Global admins"
            />
            <Tab
              value={AuthorizationCredential.GlobalCommunityRead}
              component={RouterLink}
              to={`/admin/authorization/roles/${AuthorizationCredential.GlobalCommunityRead}`}
              label="Global Community"
            />
            <Tab
              value={AuthorizationCredential.GlobalSupport}
              component={RouterLink}
              to={`/admin/authorization/roles/${AuthorizationCredential.GlobalSupport}`}
              label="Global Support"
            />
            <Tab
              value={AuthorizationCredential.BetaTester}
              component={RouterLink}
              to={`/admin/authorization/roles/${AuthorizationCredential.BetaTester}`}
              label="Beta Testers"
            />
          </TabList>
        </Box>
        <TabPanel value="_none" />
        <TabPanel value={AuthorizationCredential.GlobalAdmin}>
          <PlatformRoleAssignementPage
            role={PlatformRole.GlobalAdmin}
            authorizationCredential={AuthorizationCredential.GlobalAdmin}
          />
        </TabPanel>
        <TabPanel value={AuthorizationCredential.GlobalCommunityRead}>
          <PlatformRoleAssignementPage
            role={PlatformRole.CommunityReader}
            authorizationCredential={AuthorizationCredential.GlobalCommunityRead}
          />
        </TabPanel>
        <TabPanel value={AuthorizationCredential.GlobalSupport}>
          <PlatformRoleAssignementPage
            role={PlatformRole.Support}
            authorizationCredential={AuthorizationCredential.GlobalSupport}
          />
        </TabPanel>
        <TabPanel value={AuthorizationCredential.BetaTester}>
          <PlatformRoleAssignementPage
            role={PlatformRole.BetaTester}
            authorizationCredential={AuthorizationCredential.BetaTester}
          />
        </TabPanel>
      </TabContext>
    </AdminLayout>
  );
};

export default AdminAuthorizationPage;
