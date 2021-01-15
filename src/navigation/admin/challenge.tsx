import React, { FC, useMemo } from 'react';
import { FourOuFour, PageProps } from '../../pages';
import { Link, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import {
  useChallengeGroupsQuery,
  useChallengeNameQuery,
  useChallengeOpportunitiesQuery,
  useEcoverseChallengesListQuery,
  useRemoveOpportunityMutation,
} from '../../generated/graphql';
import { ListPage } from '../../components/Admin/ListPage';
import OppChallPage, { ProfileSubmitMode } from '../../components/Admin/OppChallPage';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import { managementData } from '../../components/Admin/managementData';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import { GroupPage } from '../../components/Admin/Group/GroupPage';
import Button from '../../components/core/Button';
import { AdminParameters } from './admin';
import { OpportunitiesRoutes } from './opportunity';
import { SearchableListItem } from '../../components/Admin/SearchableList';

export const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data: challengesListQuery } = useEcoverseChallengesListQuery();

  const challengesList = challengesListQuery?.challenges?.map(c => ({
    id: c.id,
    value: c.name,
    url: `${url}/${c.id}`,
  }));

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [
    paths,
    challengesListQuery?.challenges,
  ]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage paths={currentPaths} data={challengesList || []} newLink={`${url}/new`} />
      </Route>
      <Route path={`${path}/new`}>
        <OppChallPage mode={ProfileSubmitMode.createChallenge} paths={currentPaths} title="New challenge" />
      </Route>
      <Route exact path={`${path}/:challengeId/edit`}>
        <OppChallPage mode={ProfileSubmitMode.updateChallenge} paths={currentPaths} title="Edit challenge" />
      </Route>
      <Route path={`${path}/:challengeId`}>
        <ChallengeRoutes paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const ChallengeRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { challengeId } = useParams<AdminParameters>();

  const { data } = useChallengeNameQuery({ variables: { id: Number(challengeId) } });

  const currentPaths = useMemo(() => [...paths, { value: url, name: data?.challenge?.name || '', real: true }], [
    paths,
    data?.challenge?.name,
  ]);

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.challengeLvl} paths={currentPaths} />
      </Route>
      <Route path={`${path}/groups`}>
        <ChallengeGroupRoutes paths={currentPaths} />
      </Route>
      <Route path={`${path}/opportunities`}>
        <OpportunitiesRoutes paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const ChallengeGroupRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ChallengeGroups paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateGroupPage action={'createChallengeGroup'} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
    </Switch>
  );
};

const ChallengeGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<AdminParameters>();
  const { data } = useChallengeGroupsQuery({ variables: { id: Number(challengeId) } });

  const groups = data?.challenge?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} newLink={`${url}/new`} />;
};

export const ChallengeOpportunities: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<AdminParameters>();

  const { data } = useChallengeOpportunitiesQuery({ variables: { id: Number(challengeId) } });

  const opportunities = data?.challenge?.opportunities?.map(o => ({
    id: o.id,
    value: o.name,
    url: `${url}/${o.id}`,
  }));

  const [remove] = useRemoveOpportunityMutation({
    refetchQueries: ['challengeOpportunities'],
    awaitRefetchQueries: true,

    onError: e => console.error('User remove error---> ', e),
  });
  const handleDelete = (item: SearchableListItem) => {
    remove({
      variables: {
        ID: Number(item.id),
      },
    });
  };

  return (
    <>
      <div className={'d-flex'}>
        <Button className={'mb-4 ml-auto'} as={Link} to={`${url}/new`}>
          New
        </Button>
      </div>
      <ListPage paths={paths} data={opportunities || []} onDelete={handleDelete} />
    </>
  );
};
