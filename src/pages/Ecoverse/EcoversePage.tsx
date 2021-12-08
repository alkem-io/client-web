import React, { FC } from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { TabContext, TabPanel } from '@mui/lab';
import EcoversePageContainer from '../../containers/ecoverse/EcoversePageContainer';
import { useEcoverse, useUpdateNavigation } from '../../hooks';
import { AuthorizationCredential, User } from '../../models/graphql-schema';
import DiscussionsRoute from '../../routing/discussions/DiscussionsRoute';
import EcoverseTabs from '../../routing/ecoverse/EcoverseTabs';
import RestrictedRoute, { CredentialForResource } from '../../routing/route.extensions';
import EcoverseChallengesView from '../../views/Ecoverse/EcoverseChallengesView';
import EcoverseContextView from '../../views/Ecoverse/EcoverseContextView';
import { PageProps } from '../common';
import EcoverseCommunityPage from '../Community/EcoverseCommunityPage';
import EcoverseDashboardView2 from '../../views/Ecoverse/EcoverseDashboardView2';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';

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
    <DiscussionsProvider>
      <EcoversePageContainer>
        {(entities, state) => {
          if (!entities || !state) return null;
          const communityReadAccess = entities.permissions.communityReadAccess;
          return (
            <EcoverseTabs entities={entities}>
              {({ tabName, tabNames }) => (
                <TabContext value={tabName}>
                  <TabPanel value={tabNames['dashboard']}>
                    <EcoverseChallengesContainer
                      entities={{
                        ecoverseNameId: entities?.ecoverse?.nameID || '',
                      }}
                    >
                      {cEntities => (
                        <EcoverseDashboardView2
                          title={entities?.ecoverse?.displayName}
                          bannerUrl={entities?.ecoverse?.context?.visual?.banner}
                          tagline={entities?.ecoverse?.context?.tagline}
                          vision={entities?.ecoverse?.context?.vision}
                          ecoverseId={entities?.ecoverse?.id}
                          ecoverseNameId={entities?.ecoverse?.nameID}
                          communityId={entities?.ecoverse?.community?.id}
                          organizationNameId={entities?.ecoverse?.host?.nameID}
                          activity={entities.activity}
                          challenges={cEntities.challenges}
                          discussions={entities.discussionList}
                          members={entities?.ecoverse?.community?.members as User[]}
                          loading={state.loading}
                          isMember={entities.isMember}
                          communityReadAccess={communityReadAccess}
                          hideChallenges={entities.isPrivate}
                        />
                      )}
                    </EcoverseChallengesContainer>
                  </TabPanel>
                  <TabPanel sx={{ paddingLeft: 0, paddingRight: 0 }} value={tabNames['context']}>
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
                  <TabPanel value={tabNames['canvases']}>Coming soon</TabPanel>
                </TabContext>
              )}
            </EcoverseTabs>
          );
        }}
      </EcoversePageContainer>
    </DiscussionsProvider>
  );
};

export { EcoversePage as Ecoverse };
