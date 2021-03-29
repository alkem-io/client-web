import React, { FC, useMemo } from 'react';
import { Link, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { ListPage } from '../../components/Admin/ListPage';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import OppChallPage, { ProfileSubmitMode } from '../../components/Admin/OppChallPage';
import Button from '../../components/core/Button';
import {
  useChallengeCommunityQuery,
  useChallengeOpportunitiesQuery,
  useEcoverseChallengesListQuery,
  useEcoverseCommunityQuery,
} from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { FourOuFour, PageProps } from '../../pages';
import { AdminParameters } from './admin';
import { CommunityRoute } from './community';
import { OpportunitiesRoutes } from './opportunity';

export const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data: challengesListQuery } = useEcoverseChallengesListQuery();

  const challengesList = challengesListQuery?.ecoverse?.challenges?.map(c => ({
    id: c.id,
    value: c.name,
    url: `${url}/${c.id}`,
    communityId: c.community?.id,
  }));

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [
    paths,
    challengesListQuery?.ecoverse?.challenges,
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

  const { data } = useChallengeCommunityQuery({ variables: { id: challengeId } });
  const { data: ecoverseCommunity } = useEcoverseCommunityQuery();

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: data?.ecoverse?.challenge?.name || '', real: true }],
    [paths, data?.ecoverse?.challenge?.name]
  );

  const community = data?.ecoverse?.challenge?.community;
  const parentMembers = ecoverseCommunity?.ecoverse?.community?.groups?.find(g => g.name === 'members')?.members || [];

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.challengeLvl} paths={currentPaths} />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute paths={currentPaths} community={community} parentMembers={parentMembers} />
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
export const ChallengeOpportunities: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<AdminParameters>();

  const { data } = useChallengeOpportunitiesQuery({ variables: { id: challengeId } });

  const opportunities = data?.ecoverse?.challenge?.opportunities?.map(o => ({
    id: o.id,
    value: o.name,
    url: `${url}/${o.id}`,
  }));
  // TODO: [ATS] Hide delete button until https://github.com/cherrytwist/Server/issues/712 if resolved
  // const [remove] = useRemoveOpportunityMutation({
  //   refetchQueries: ['challengeOpportunities'],
  //   awaitRefetchQueries: true,

  //   onError: e => console.error('Opportunity remove error---> ', e),
  // });

  // const handleDelete = (item: SearchableListItem) => {
  //   remove({
  //     variables: {
  //       ID: Number(item.id),
  //     },
  //   });
  // };

  return (
    <>
      <div className={'d-flex'}>
        <Button className={'mb-4 ml-auto'} as={Link} to={`${url}/new`}>
          New
        </Button>
      </div>
      {/* Hide delete button until https://github.com/cherrytwist/Server/issues/712 if resolved */}
      {/* <ListPage paths={paths} data={opportunities || []} onDelete={handleDelete} /> */}
      <ListPage paths={paths} data={opportunities || []} />
    </>
  );
};
