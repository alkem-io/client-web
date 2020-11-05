import React, { FC } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import {
  Ecoverse as EcoversePage,
  Challenge as ChallengePage,
  FourOuFour,
  Opportunity as OpportunityPage,
} from '../pages';
/*local files imports end*/

interface EcoverseParameters {
  ecoverseId: string;
  challengeId: string;
  opportunityId: string;
}

export const Ecoverse: FC = () => {
  const { path, url } = useRouteMatch();
  const { ecoverseId, challengeId, opportunityId } = useParams<EcoverseParameters>();

  console.log(url, ecoverseId, challengeId, opportunityId);

  return (
    <Switch>
      <Route exact path={`${path}/:ecoverseId/challenges/:challengeId/opportunities/:id`}>
        <OpportunityPage />
      </Route>
      <Route exact path={`${path}/:ecoverseId/challenges/:id`}>
        <ChallengePage />
      </Route>
      <Route exact path={`${path}/:id`}>
        <EcoversePage />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
