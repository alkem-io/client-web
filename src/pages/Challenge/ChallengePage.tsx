import { TabContext, TabPanel } from '@mui/lab';
import React, { FC } from 'react';
import { Routes } from 'react-router';
import { Route } from 'react-router-dom';
import ChallengePageContainer from '../../containers/challenge/ChallengePageContainer';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import { useChallenge, useUpdateNavigation } from '../../hooks';
import { AuthorizationCredential } from '../../models/graphql-schema';
import ChallengeTabs from '../../routing/challenge/ChallengeTabs';
import DiscussionsRoute from '../../routing/discussions/DiscussionsRoute';
import RestrictedRoute, { CredentialForResource } from '../../routing/RestrictedRoute';
import ChallengeCanvasManagementView from '../../views/Challenge/ChallengeCanvasManagementView';
import { ChallengeContextView } from '../../views/Challenge/ChallengeContextView';
import { ChallengeDashboardView } from '../../views/Challenge/ChallengeDashboardView';
import { ChallengeOpportunitiesView } from '../../views/Challenge/ChallengeOpportunitiesView';
import { PageProps } from '../common';
import ChallengeCommunityPage from '../Community/ChallengeCommunityPage';

interface ChallengePageProps extends PageProps {}

export const ChallengePage: FC<ChallengePageProps> = ({ paths }): React.ReactElement => {
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
                        path={'community/discussions/*'}
                        element={<RestrictedRoute requiredCredentials={requiredCredentials}></RestrictedRoute>}
                      >
                        <DiscussionsRoute paths={paths} />
                      </Route>
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
