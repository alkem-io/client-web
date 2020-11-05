import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import {
  Ecoverse as EcoversePage,
  Challenge as ChallengePage,
  FourOuFour,
  Opportunity as OpportunityPage,
  PageProps,
} from '../pages';
import { challenges, opportunities, odyssey } from '../components/core/Typography.dummy.json';
/*local files imports end*/

interface EcoverseParameters {
  ecoverseId: string;
  challengeId: string;
  opportunityId: string;
}

export const Ecoverses: FC = () => {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/:id`}>
        <Ecoverse paths={[{ value: url, name: 'ecoverses', real: false }]} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const Ecoverse: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: odyssey.header, real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={path}>
        <EcoversePage paths={currentPaths} />
      </Route>
      <Route path={`${path}/challenges/:id`}>
        <Challenge paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const Challenge: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { id } = useParams<{ id: string }>();
  const currentPaths = useMemo(
    () => [...paths, { value: url, name: challenges.list.find(c => c.id === id)?.shortText || '', real: true }],
    [paths, id]
  );

  return (
    <Switch>
      <Route exact path={path}>
        <ChallengePage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/opportunities/:id`}>
        <Opportnity paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const Opportnity: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { id } = useParams<{ id: string }>();
  const currentPaths = useMemo(
    () => [...paths, { value: url, name: opportunities.list.find(c => c.id === Number(id))?.title || '', real: true }],
    [paths, id]
  );

  return (
    <Switch>
      <Route exact path={path}>
        <OpportunityPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
