import React, { FC } from 'react';
import { Switch, useRouteMatch } from 'react-router';
import { TabContext, TabPanel } from '@mui/lab';
import { useChallenge, useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';
import ChallengePageContainer from '../../containers/challenge/ChallengePageContainer';
import ChallengeTabs from '../../routing/challenge/ChallengeTabs';
import RestrictedRoute, { CredentialForResource } from '../../routing/route.extensions';
import DiscussionsRoute from '../../routing/discussions/DiscussionsRoute';
import ChallengeCommunityPage from '../Community/ChallengeCommunityPage';
import { ChallengeDashboardView } from '../../views/Challenge/ChallengeDashboardView';
import { ChallengeContextView } from '../../views/Challenge/ChallengeContextView';
import { ChallengeOpportunitiesView } from '../../views/Challenge/ChallengeOpportunitiesView';
import { AuthorizationCredential } from '../../models/graphql-schema';

interface ChallengePageProps extends PageProps {}

export const ChallengePage: FC<ChallengePageProps> = ({ paths }): React.ReactElement => {
  const { path } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });
  const { challengeId } = useChallenge();
  const requiredCredentials: CredentialForResource[] = challengeId
    ? [{ credential: AuthorizationCredential.ChallengeMember, resourceId: challengeId }]
    : [];

  return (
    <ChallengePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        return (
          <ChallengeTabs>
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
                  <Switch>
                    <RestrictedRoute path={`${path}/community/discussions`} requiredCredentials={requiredCredentials}>
                      <DiscussionsRoute paths={paths} />
                    </RestrictedRoute>
                  </Switch>
                  <DiscussionsRoute paths={paths} />
                </TabPanel>
                <TabPanel value={tabNames['canvases']}>Coming soon</TabPanel>
              </TabContext>
            )}
          </ChallengeTabs>
        );
      }}
    </ChallengePageContainer>
  );
};
