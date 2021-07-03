import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import OppChallPage, { ProfileSubmitMode } from '../../components/Admin/OppChallPage';
import Loading from '../../components/core/Loading';
import { useChallengeCommunityQuery, useOpportunityCommunityQuery } from '../../generated/graphql';
import { useEcoverse } from '../../hooks/useEcoverse';
import { FourOuFour, PageProps } from '../../pages';
import OpportunityList from '../../pages/Admin/Opportunity/OpportunityList';
import { AdminParameters } from './admin';
import { CommunityRoute } from './community';

export const OpportunitiesRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OpportunityList paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <OppChallPage title={'Create opportunity'} mode={ProfileSubmitMode.createOpportunity} paths={currentPaths} />
      </Route>
      <Route path={`${path}/:opportunityId`}>
        <OpportunityRoutes paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

export const OpportunityRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { opportunityId, challengeId } = useParams<AdminParameters>();
  const { ecoverseId } = useEcoverse();

  const { data, loading: loadingOpportunity } = useOpportunityCommunityQuery({
    variables: { ecoverseId, opportunityId },
  });
  const { data: challengeData, loading: loadingChallenge } = useChallengeCommunityQuery({
    variables: { ecoverseId, challengeId },
  });

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: data?.ecoverse?.opportunity?.displayName || '', real: true }],
    [paths, data?.ecoverse?.opportunity?.displayName, url]
  );

  const community = data?.ecoverse?.opportunity?.community;
  const parentMembers = challengeData?.ecoverse?.challenge.community?.members || [];

  if (loadingOpportunity || loadingChallenge) return <Loading text={'Loading'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.opportunityLvl} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/edit`}>
        <OppChallPage title={'Edit opportunity'} mode={ProfileSubmitMode.updateOpportunity} paths={currentPaths} />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute paths={currentPaths} community={community} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
