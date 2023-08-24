import { ComponentType, useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildChallengeUrl, buildSpaceUrl, buildOpportunityUrl } from '../../../../main/routing/urlBuilders';
import {
  useChallengeNameQuery,
  useSpaceNameQuery,
  useOpportunityNameQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { SpaceIcon } from '../../space/icon/SpaceIcon';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { EntityTypeName } from '../../../platform/constants/EntityTypeName';

export interface BreadcrumbsItem {
  title: string;
  icon: ComponentType;
  url: string;
  entity: EntityTypeName;
}

export const useBreadcrumbs = () => {
  const { spaceNameId, challengeNameId, opportunityNameId, postNameId } = useUrlParams();

  const showOpportunity = false; // TODO: Never show opportunity for now.

  const { data: _space, loading: loadingSpace } = useSpaceNameQuery({
    variables: {
      spaceId: spaceNameId!,
    },
    skip: !spaceNameId,
  });

  const { data: _challenge, loading: isLoadingChallenge } = useChallengeNameQuery({
    variables: {
      spaceId: _space?.space.id || '',
      challengeId: challengeNameId!,
    },
    skip: !_space?.space.id || !challengeNameId,
  });

  const { data: _opportunity, loading: loadingOpportunity } = useOpportunityNameQuery({
    variables: {
      spaceId: _space?.space.id || '',
      opportunityId: opportunityNameId!,
    },
    skip: !_space?.space.id || !opportunityNameId || !showOpportunity,
  });

  const loading =
    (spaceNameId && loadingSpace) || (challengeNameId && isLoadingChallenge) || (showOpportunity && loadingOpportunity);

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbsItem[] = [];
    if (!loading) {
      // Space breadcrumb - if we are watching a challenge or an post
      if (spaceNameId && (challengeNameId || postNameId)) {
        items.push({
          title: _space?.space.profile.displayName || '',
          icon: SpaceIcon,
          url: buildSpaceUrl(spaceNameId),
          entity: 'space',
        });
      }
      // Challenge breadcrumb - if we are watching an opportunity or an post in a challenge
      if (spaceNameId && challengeNameId && (opportunityNameId || postNameId)) {
        items.push({
          title: _challenge?.space.challenge.profile.displayName || '',
          icon: ChallengeIcon,
          url: buildChallengeUrl(spaceNameId, challengeNameId),
          entity: 'challenge',
        });
      }
      // Opportunity breadcrumb - if we are inside an opportunity and showOpportunity is true
      if (spaceNameId && challengeNameId && opportunityNameId && showOpportunity) {
        items.push({
          title: _opportunity?.space.opportunity.profile.displayName || '',
          icon: ChallengeIcon, // TODO: We'll need an opportunity Icon if we want to show opportunity breadcrumb
          url: buildOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId),
          entity: 'opportunity',
        });
      }
    }
    return items;
  }, [
    loading,
    spaceNameId,
    challengeNameId,
    opportunityNameId,
    showOpportunity,
    postNameId,
    _challenge?.space.challenge.profile.displayName,
    _space?.space.profile.displayName,
    _opportunity?.space.opportunity.profile.displayName,
  ]);

  return {
    loading,
    breadcrumbs,
  };
};
