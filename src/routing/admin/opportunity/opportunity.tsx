import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplate from '../../../components/Admin/ManagementPageTemplate';
import Loading from '../../../components/core/Loading';
import { useChallengeCommunityQuery, useOpportunityCommunityQuery } from '../../../components/generated/graphql';
import { useEcoverse } from '../../../hooks';
import { FourOuFour, PageProps } from '../../../pages';
import OpportunityList from '../../../pages/Admin/Opportunity/OpportunityList';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { AdminParameters } from '../admin';
import { CommunityRoute } from '../community';
import EditOpportunity from '../../../components/Admin/EditOpportunity';
import FormMode from '../../../components/Admin/FormMode';
import OpportunityLifecycleRoute from './OpportunityLifecycleRoute';

export const OpportunitiesRoutes: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OpportunityList paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <EditOpportunity title={t('navigation.admin.opportunity.create')} mode={FormMode.create} paths={currentPaths} />
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
  const { t } = useTranslation();
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
  const opportunityUUID = data?.ecoverse.opportunity.id || '';
  if (loadingOpportunity || loadingChallenge) return <Loading text={'Loading'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.opportunityLvl} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/edit`}>
        <EditOpportunity title={t('navigation.admin.opportunity.edit')} mode={FormMode.update} paths={currentPaths} />
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
