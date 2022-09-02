import { ComponentType, useMemo } from 'react';
import { useUrlParams } from '.';
import { buildChallengeUrl, buildHubUrl, buildOpportunityUrl } from '../common/utils/urlBuilders';
import { useChallengeNameQuery, useHubNameQuery, useOpportunityNameQuery } from './generated/graphql';
import { HubOutlined } from '@mui/icons-material';
import { ChallengeIcon } from '../common/icons/ChallengeIcon';

export interface BreadcrumbsItem {
  title: string;
  icon: ComponentType;
  url: string;
}

export const useBreadcrumbs = () => {
  const { hubNameId, challengeNameId, opportunityNameId, aspectNameId, projectNameId } = useUrlParams();

  const showOpportunity = false; // TODO: Never show opportunity for now.

  const { data: _hub, loading: loadingHub } = useHubNameQuery({
    variables: {
      hubId: hubNameId!,
    },
    skip: !hubNameId,
  });

  const { data: _challenge, loading: loadingChallenge } = useChallengeNameQuery({
    variables: {
      hubId: _hub?.hub.id || '',
      challengeId: challengeNameId!,
    },
    skip: !_hub?.hub.id || !challengeNameId,
  });

  const { data: _opportunity, loading: loadingOpportunity } = useOpportunityNameQuery({
    variables: {
      hubId: _hub?.hub.id || '',
      opportunityId: opportunityNameId!,
    },
    skip: !_hub?.hub.id || !opportunityNameId || !showOpportunity,
  });

  const loading =
    (hubNameId && loadingHub) || (challengeNameId && loadingChallenge) || (showOpportunity && loadingOpportunity);

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbsItem[] = [];
    if (!loading) {
      // Hub breadcrumb - if we are watching a challenge or an aspect
      if (hubNameId && (challengeNameId || aspectNameId)) {
        items.push({
          title: _hub?.hub.displayName || '',
          icon: HubOutlined,
          url: buildHubUrl(hubNameId),
        });
      }
      // Challenge breadcrumb - if we are watching an opportunity or an aspect in a challenge
      if (hubNameId && challengeNameId && (opportunityNameId || aspectNameId)) {
        items.push({
          title: _challenge?.hub.challenge.displayName || '',
          icon: ChallengeIcon,
          url: buildChallengeUrl(hubNameId, challengeNameId),
        });
      }
      // Opportunity breadcrumb - if we are inside an opportunity and showOpportunity is true
      if (hubNameId && challengeNameId && opportunityNameId && showOpportunity) {
        items.push({
          title: _opportunity?.hub.opportunity.displayName || '',
          icon: ChallengeIcon, // TODO: We'll need an opportunity Icon if we want to show opportunity breadcrumb
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
