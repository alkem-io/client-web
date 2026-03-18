import { Box, Tab, Tabs } from '@mui/material';
import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import { TabPanel } from '@/domain/common/layout/TabPanel';
import { SettingsSection } from '../../../platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import OrganizationAuthorizationRoleAssignementView from '../views/OrganizationAuthorizationRoleAssignementView';

const OrganizationAdminAuthorizationPage = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Authorization}>
      <Gutters disablePadding={true}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label={t('common.admin')} sx={{ paddingX: 1 }} />
            <Tab label={t('common.owner')} sx={{ paddingX: 1 }} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <OrganizationAuthorizationRoleAssignementView key="admin" role={RoleName.Admin} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <OrganizationAuthorizationRoleAssignementView key="owner" role={RoleName.Owner} />
        </TabPanel>
      </Gutters>
    </OrganizationAdminLayout>
  );
};

export default OrganizationAdminAuthorizationPage;
