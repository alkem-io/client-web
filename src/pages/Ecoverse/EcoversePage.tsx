import { TabContext, TabPanel } from '@mui/lab';
import React, { FC } from 'react';
import EcoversePageContainer from '../../containers/ecoverse/EcoversePageContainer';
import { useUpdateNavigation } from '../../hooks';
import { EcoverseRoutesType } from '../../routing/ecoverse/EcoverseTabs';
import EcoverseChallengesView from '../../views/Ecoverse/EcoverseChallengesView';
import EcoverseContextView from '../../views/Ecoverse/EcoverseContextView';
import EcoverseDashboardView from '../../views/Ecoverse/EcoverseDashboardView';
import { PageProps } from '../common';

interface EcoversePageProps extends PageProps {
  tabName?: string;
  tabNames: EcoverseRoutesType;
}

const EcoversePage: FC<EcoversePageProps> = ({ paths, tabName = 'dashboard', tabNames }): React.ReactElement => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <EcoversePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        return (
          <TabContext value={tabName}>
            <TabPanel value={tabNames['dashboard']}>
              <EcoverseDashboardView entities={entities} state={state} />
            </TabPanel>
            <TabPanel value={tabNames['context']}>
              <EcoverseContextView entities={entities} state={state} />
            </TabPanel>
            <TabPanel value={tabNames['challenges']}>
              <EcoverseChallengesView entities={entities} state={state} />
            </TabPanel>
          </TabContext>
        );
      }}
    </EcoversePageContainer>
  );
};

export { EcoversePage as Ecoverse };
