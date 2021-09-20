import { FourOuFour, OpportunityPage, PageProps } from '../pages';
import { AuthorizationCredential, Opportunity as OpportunityType, User } from '../models/graphql-schema';
import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router';
import { useEcoverse, useUrlParams, useUserContext } from '../hooks';
import { useOpportunityProfileQuery, useOpportunityUserIdsQuery } from '../hooks/generated/graphql';
import Loading from '../components/core/Loading/Loading';
import { Project } from './project';
import OpportunityCommunityPage from '../pages/community/OpportunityCommunityPage';
import RestrictedRoute from './route.extensions';

interface OpportunityRootProps extends PageProps {
  opportunities: Pick<OpportunityType, 'id' | 'nameID'>[] | undefined;
  challengeUUID: string;
}

const OpportunityRoute: FC<OpportunityRootProps> = ({ paths, opportunities = [], challengeUUID }) => {
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const { opportunityId: id, challengeId } = useUrlParams();
  const { user } = useUserContext();
  const { ecoverseId, toEcoverseId } = useEcoverse();
  const opportunityId = opportunities.find(x => x.nameID === id)?.id || '';

  const { data: query, loading: opportunityLoading } = useOpportunityProfileQuery({
    variables: { ecoverseId, opportunityId },
    errorPolicy: 'all',
  });

  const { data: usersQuery, loading: usersLoading } = useOpportunityUserIdsQuery({
    variables: { ecoverseId, opportunityId },
    errorPolicy: 'all',
  });

  const opportunity = query?.ecoverse.opportunity;
  const opportunityGroups = usersQuery?.ecoverse.opportunity;
  const members = opportunityGroups?.community?.members;
  const users = useMemo(() => members || [], [members]);

  const currentPaths = useMemo(
    () => (opportunity ? [...paths, { value: url, name: opportunity.displayName, real: true }] : paths),
    [paths, id, opportunity]
  );

  const isAdmin = useMemo(
    () =>
      user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
      user?.isEcoverseAdmin(toEcoverseId(ecoverseId)) ||
      user?.isChallengeAdmin(challengeUUID) ||
      false,
    [user, ecoverseId, challengeUUID]
  );

  const loading = opportunityLoading || usersLoading;

  if (loading) {
    return <Loading text={'Loading opportunity'} />;
  }

  if (!opportunity) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route exact path={path}>
        <OpportunityPage
          challengeId={challengeId}
          opportunity={opportunity as OpportunityType}
          users={users as User[] | undefined}
          paths={currentPaths}
          onProjectTransition={project => {
            history.push(`${url}/projects/${project ? project.nameID : 'new'}`);
          }}
          // TODO [ATS]: More generic way of controlling the UI based on user credentials must be implemented
          permissions={{
            edit: isAdmin,
            projectWrite: isAdmin,
            editAspect: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
            editActorGroup: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
            editActors: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
            removeRelations: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
          }}
        />
      </Route>
      <RestrictedRoute path={`${path}/community`}>
        <OpportunityCommunityPage paths={currentPaths} />
      </RestrictedRoute>
      <Route path={`${path}/projects`}>
        <Project paths={currentPaths} projects={opportunity.projects} opportunityId={opportunity.id} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default OpportunityRoute;
