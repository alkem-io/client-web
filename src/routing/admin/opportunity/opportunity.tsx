import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplate from '../../../components/Admin/ManagementPageTemplate';
import Loading from '../../../components/core/Loading/Loading';
import { useChallengeCommunityQuery, useOpportunityCommunityQuery } from '../../../hooks/generated/graphql';
import { useEcoverse, useUrlParams } from '../../../hooks';
import { FourOuFour, PageProps } from '../../../pages';
import OpportunityList from '../../../pages/Admin/Opportunity/OpportunityList';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { CommunityRoute } from '../community';
import EditOpportunity from '../../../components/Admin/EditOpportunity';
import FormMode from '../../../components/Admin/FormMode';
import OpportunityLifecycleRoute from './OpportunityLifecycleRoute';
import { buildOpportunityUrl } from '../../../utils/urlBuilders';
import { OpportunityProvider } from '../../../context/OpportunityProvider';
import { nameOfUrl } from '../../ulr-params';

interface Props extends PageProps {
  challengeId: string;
}

export const OpportunitiesRoutes: FC<Props> = ({ paths, challengeId }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OpportunityList paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <EditOpportunity
          title={t('navigation.admin.opportunity.create')}
          challengeId={challengeId}
          mode={FormMode.create}
          paths={currentPaths}
        />
      </Route>
      <Route path={`${path}/:${nameOfUrl.opportunityId}`}>
        <OpportunityProvider>
          <OpportunityRoutes paths={currentPaths} challengeId={challengeId} />
        </OpportunityProvider>
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

export const OpportunityRoutes: FC<Props> = ({ paths, challengeId: challengeUUID }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();
  const { opportunityId, challengeId } = useUrlParams();
  const { ecoverseId } = useEcoverse();

  const { data, loading: loadingOpportunity } = useOpportunityCommunityQuery({
    variables: { ecoverseId, opportunityId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });
  const { data: challengeData, loading: loadingChallenge } = useChallengeCommunityQuery({
    variables: { ecoverseId, challengeId },
    fetchPolicy: 'cache-and-network',
  });

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: data?.ecoverse?.opportunity?.displayName || '', real: true }],
    [paths, data?.ecoverse?.opportunity?.displayName, url]
  );

  const community = data?.ecoverse?.opportunity?.community;
  const parentMembers = challengeData?.ecoverse?.challenge.community?.members || [];
  const opportunityUUID = data?.ecoverse.opportunity.id || '';
  if (loadingOpportunity || loadingChallenge) return <Loading text={'Loading'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate
          data={managementData.opportunityLvl}
          paths={currentPaths}
          title={data?.ecoverse.opportunity.displayName}
          entityUrl={buildOpportunityUrl(ecoverseId, challengeId, opportunityId)}
        />
      </Route>
      <Route exact path={`${path}/edit`}>
        <EditOpportunity
          title={t('navigation.admin.opportunity.edit')}
          challengeId={challengeUUID}
          mode={FormMode.update}
          paths={currentPaths}
        />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute
          paths={currentPaths}
          community={community}
          parentMembers={parentMembers}
          credential={AuthorizationCredential.OpportunityMember}
          resourceId={opportunityUUID}
          accessedFrom="opportunity"
        />
      </Route>
      <Route path={`${path}/lifecycle`}>
        <OpportunityLifecycleRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
