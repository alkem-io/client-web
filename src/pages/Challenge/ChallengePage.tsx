import React, { FC } from 'react';
import { Routes, useRouteMatch } from 'react-router';
import { TabContext, TabPanel } from '@mui/lab';
import { useChallenge, useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';
import ChallengePageContainer from '../../containers/challenge/ChallengePageContainer';
import ChallengeTabs from '../../routing/challenge/ChallengeTabs';
import RestrictedRoute, { CredentialForResource } from '../../routing/RestrictedRoute';
import DiscussionsRoute from '../../routing/discussions/DiscussionsRoute';
import ChallengeCommunityPage from '../Community/ChallengeCommunityPage';
import { ChallengeDashboardView } from '../../views/Challenge/ChallengeDashboardView';
import { ChallengeContextView } from '../../views/Challenge/ChallengeContextView';
import { ChallengeOpportunitiesView } from '../../views/Challenge/ChallengeOpportunitiesView';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import ChallengeCanvasManagementView from '../../views/Challenge/ChallengeCanvasManagementView';
import { Route } from 'react-router-dom';

interface ChallengePageProps extends PageProps {}

export const ChallengePage: FC<ChallengePageProps> = ({ paths }): React.ReactElement => {
  const { path } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });
  const { challengeId, ecoverseId } = useChallenge();
  const requiredCredentials: CredentialForResource[] = challengeId
    ? [
        { credential: AuthorizationCredential.ChallengeMember, resourceId: challengeId },
        { credential: AuthorizationCredential.EcoverseAdmin, resourceId: ecoverseId },
      ]
    : [];

  return (
    <DiscussionsProvider>
      <ChallengePageContainer>
        {(entities, state) => {
          if (!entities || !state) return null;
          return (
            <ChallengeTabs entities={entities}>
              {({ tabName, tabNames }) => (
                <TabContext value={tabName}>
                  <TabPanel value={tabNames['dashboard']}>
                    <ChallengeDashboardView entities={entities} state={state} />
                  </TabPanel>
                  <TabPanel value={tabNames['context']}>
                    <ChallengeContextView entities={entities} state={state} />
                  </TabPanel>
                  <TabPanel value={tabNames['opportunities']}>
                    <ChallengeOpportunitiesView entities={entities} state={state} />
                  </TabPanel>
                  <TabPanel value={tabNames['community']}>
                    <ChallengeCommunityPage paths={paths} />
                  </TabPanel>
                  <TabPanel value={tabNames['discussions']}>
                    <Routes>
                      <Route
                        path={`${path}/community/discussions`}
                        render={() => (
                          <RestrictedRoute requiredCredentials={requiredCredentials}>
                            <DiscussionsRoute paths={paths} />
                          </RestrictedRoute>
                        )}
                      />
                    </Routes>
                  </TabPanel>
                  <TabPanel value={tabNames['canvases']}>
                    {entities.challenge && (
                      <ChallengeCanvasManagementView
                        entities={{
                          challenge: entities.challenge,
                        }}
                        state={{
                          loading: state.loading,
                          error: state.error,
                        }}
                        actions={undefined}
                        options={undefined}
                      />
                    )}
                  </TabPanel>
                </TabContext>
              )}
            </ChallengeTabs>
          );
        }}
      </ChallengePageContainer>
    </DiscussionsProvider>
  );
};
