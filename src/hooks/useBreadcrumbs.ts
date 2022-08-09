import { useMemo } from 'react';
import { useUrlParams } from '.';
import { buildChallengeUrl, buildHubUrl, buildOpportunityUrl } from '../utils/urlBuilders';
import { useChallengeNameQuery, useHubNameQuery, useOpportunityNameQuery } from './generated/graphql';

export interface BreadcrumbsItem {
  name?: string;
  url: string;
}

export const useBreadcrumbs = () => {
  const {
    hubNameId = '',
    challengeNameId = '',
    opportunityNameId = '',
    aspectNameId = '',
    projectNameId = '',
  } = useUrlParams();

  const showOpportunity = aspectNameId || projectNameId; // Only show opportunity if we are showing an Aspect or a Project

  const { data: _hub, loading: loadingHub } = useHubNameQuery({
    variables: {
      hubId: hubNameId,
    },
    skip: !hubNameId,
  });

  const { data: _challenge, loading: loadingChallenge } = useChallengeNameQuery({
    variables: {
      hubId: _hub?.hub.id || '',
      challengeId: challengeNameId,
    },
    skip: !_hub?.hub.id || !challengeNameId,
  });

  const { data: _opportunity, loading: loadingOpportunity } = useOpportunityNameQuery({
    variables: {
      hubId: _hub?.hub.id || '',
      opportunityId: opportunityNameId,
    },
    skip: !_hub?.hub.id || !opportunityNameId || !showOpportunity,
  });

  const loading =
    (hubNameId && loadingHub) || (challengeNameId && loadingChallenge) || (showOpportunity && loadingOpportunity);

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbsItem[] = [];
    if (!loading) {
      if (challengeNameId || aspectNameId) {
        items.push({
          name: _hub?.hub.displayName,
          url: buildHubUrl(hubNameId),
        });
      }
      if (challengeNameId && (opportunityNameId || aspectNameId)) {
        items.push({
          name: _challenge?.hub.challenge.displayName,
          url: buildChallengeUrl(hubNameId, challengeNameId),
        });
      }
      if (opportunityNameId && showOpportunity) {
        items.push({
          name: _opportunity?.hub.opportunity.displayName,
          url: buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId),
        });
      }
    }
    return items;
  }, [loading, challengeNameId, opportunityNameId, aspectNameId, projectNameId]);

  return {
    loading,
    breadcrumbs,
  };
};
