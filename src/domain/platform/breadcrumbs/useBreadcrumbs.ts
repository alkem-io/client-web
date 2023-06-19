import { ComponentType, useMemo } from 'react';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { buildChallengeUrl, buildHubUrl, buildOpportunityUrl } from '../../../common/utils/urlBuilders';
import {
  useChallengeNameQuery,
  useHubNameQuery,
  useOpportunityNameQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { HubIcon } from '../../challenge/hub/icon/HubIcon';
import { ChallengeIcon } from '../../challenge/challenge/icon/ChallengeIcon';
import { EntityTypeName } from '../constants/EntityTypeName';

export interface BreadcrumbsItem {
  title: string;
  icon: ComponentType;
  url: string;
  entity: EntityTypeName;
}

export const useBreadcrumbs = () => {
  const { hubNameId, challengeNameId, opportunityNameId, postNameId } = useUrlParams();

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
      // Hub breadcrumb - if we are watching a challenge or an post
      if (hubNameId && (challengeNameId || postNameId)) {
        items.push({
          title: _hub?.hub.profile.displayName || '',
          icon: HubIcon,
          url: buildHubUrl(hubNameId),
          entity: 'hub',
        });
      }
      // Challenge breadcrumb - if we are watching an opportunity or an post in a challenge
      if (hubNameId && challengeNameId && (opportunityNameId || postNameId)) {
        items.push({
          title: _challenge?.hub.challenge.profile.displayName || '',
          icon: ChallengeIcon,
          url: buildChallengeUrl(hubNameId, challengeNameId),
          entity: 'challenge',
        });
      }
      // Opportunity breadcrumb - if we are inside an opportunity and showOpportunity is true
      if (hubNameId && challengeNameId && opportunityNameId && showOpportunity) {
        items.push({
          title: _opportunity?.hub.opportunity.profile.displayName || '',
          icon: ChallengeIcon, // TODO: We'll need an opportunity Icon if we want to show opportunity breadcrumb
          url: buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId),
          entity: 'opportunity',
        });
      }
    }
    return items;
  }, [
    loading,
    hubNameId,
    challengeNameId,
    opportunityNameId,
    showOpportunity,
    postNameId,
    _challenge?.hub.challenge.profile.displayName,
    _hub?.hub.profile.displayName,
    _opportunity?.hub.opportunity.profile.displayName,
  ]);

  return {
    loading,
    breadcrumbs,
  };
};
