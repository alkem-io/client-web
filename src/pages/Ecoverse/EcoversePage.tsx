import {
  ContentPasteOutlined,
  DashboardOutlined,
  ForumOutlined,
  GroupOutlined,
  SettingsOutlined,
  TocOutlined,
  WbIncandescentOutlined,
} from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { styled, Tab, TabProps, Tabs } from '@mui/material';
import React, { FC } from 'react';
import EcoversePageContainer from '../../containers/ecoverse/EcoversePageContainer';
import { useUpdateNavigation } from '../../hooks';
import EcoverseChallengesView from '../../views/Ecoverse/EcoverseChallengesView';
import EcoverseContextView from '../../views/Ecoverse/EcoverseContextView';
import EcoverseDashboardView from '../../views/Ecoverse/EcoverseDashboardView';
import { PageProps } from '../common';
import EcoverseCommunityPage from '../Community/EcoverseCommunityPage';

interface EcoversePageProps extends PageProps {}

const EcoversePage: FC<EcoversePageProps> = ({ paths }): React.ReactElement => {
  const [value, setValue] = React.useState('dashboard');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useUpdateNavigation({ currentPaths: paths });

  const StyledTab = styled((props: TabProps) => <Tab iconPosition="start" {...props} />)(({ theme }) => ({
    fontSize: '18px',
    '&.Mui-selected': {
      color: theme.palette.text.primary,
      fontWeight: 'bold',
    },
  }));

  return (
    <EcoversePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        return (
          <TabContext value={value}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <StyledTab icon={<DashboardOutlined />} label="Dashboard" value="dashboard" />
              <StyledTab icon={<TocOutlined />} label="Context" value="context" />
              <StyledTab icon={<GroupOutlined />} label="Community" value="community" />
              <StyledTab icon={<ContentPasteOutlined />} label="Challenges" value="challenges" />
              <StyledTab icon={<ForumOutlined />} label="Discussions" value="discussions" />
              <StyledTab icon={<WbIncandescentOutlined />} label="Canvases" value="canvases" />
              <StyledTab icon={<SettingsOutlined />} label="Settings" value="settings" />
            </Tabs>
            <TabPanel value="dashboard">
              <EcoverseDashboardView entities={entities} state={state} />
            </TabPanel>
            <TabPanel value="context">
              <EcoverseContextView entities={entities} state={state} />
            </TabPanel>
            <TabPanel value="community">
              <EcoverseCommunityPage paths={paths} />
            </TabPanel>
            <TabPanel value="challenges">
              <EcoverseChallengesView entities={entities} state={state} />
            </TabPanel>
            <TabPanel value="discussions">Item Three</TabPanel>
            <TabPanel value="canvases">Comming soon</TabPanel>
            <TabPanel value="settings">Item Three</TabPanel>
            {/* <EcoverseView entities={entities} state={state} />{' '} */}
          </TabContext>
        );
      }}
    </EcoversePageContainer>
  );
};

export { EcoversePage as Ecoverse };
