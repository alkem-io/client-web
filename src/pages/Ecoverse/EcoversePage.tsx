import { TabContext, TabPanel } from '@mui/lab';

import React, { FC } from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import EcoversePageContainer from '../../containers/ecoverse/EcoversePageContainer';
import { useEcoverse, useUpdateNavigation } from '../../hooks';
import { AuthorizationCredential } from '../../models/graphql-schema';
import DiscussionsRoute from '../../routing/discussions/DiscussionsRoute';
import EcoverseTabs from '../../routing/ecoverse/EcoverseTabs';
import RestrictedRoute, { CredentialForResource } from '../../routing/route.extensions';
import EcoverseChallengesView from '../../views/Ecoverse/EcoverseChallengesView';
import EcoverseContextView from '../../views/Ecoverse/EcoverseContextView';
import EcoverseDashboardView from '../../views/Ecoverse/EcoverseDashboardView';
import { PageProps } from '../common';
import EcoverseCommunityPage from '../Community/EcoverseCommunityPage';

interface EcoversePageProps extends PageProps {
  // tabName?: string;
  // tabNames: EcoverseRoutesType;
}

const EcoversePage: FC<EcoversePageProps> = ({ paths }): React.ReactElement => {
  const { path } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });
  const { isPrivate, ecoverseId } = useEcoverse();
  const discussionsRequiredCredentials: CredentialForResource[] =
    isPrivate && ecoverseId ? [{ credential: AuthorizationCredential.EcoverseMember, resourceId: ecoverseId }] : [];

  return (
    <EcoversePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        return (
          <EcoverseTabs entities={entities}>
            {({ tabName, tabNames }) => (
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
                <TabPanel value={tabNames['community']}>
                  <EcoverseCommunityPage paths={paths} />
                </TabPanel>
                <TabPanel value={tabNames['discussions']}>
                  <Switch>
                    <RestrictedRoute
                      path={`${path}/community/discussions`}
                      requiredCredentials={discussionsRequiredCredentials}
                    >
                      <DiscussionsRoute paths={paths} />
                    </RestrictedRoute>
                  </Switch>
                </TabPanel>
                <TabPanel value={tabNames['canvases']}>Comming soon</TabPanel>
              </TabContext>
            )}
          </EcoverseTabs>
        );
      }}
    </EcoversePageContainer>
  );
};

export { EcoversePage as Ecoverse };
