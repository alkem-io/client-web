import { useMemo } from 'react';
import { useUrlParams } from '.';
import { buildChallengeUrl, buildHubUrl } from '../utils/urlBuilders';
import { useChallengeNameQuery, useHubNameQuery } from './generated/graphql';

export interface BreadcrumbsItem {
  name?: string;
  url: string;
}

export const useBreadcrumbs = () => {
  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();

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
    skip: !hubNameId || !_hub?.hub.id || !challengeNameId,
  });

  const loading = (hubNameId && loadingHub) || (challengeNameId && loadingChallenge);

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbsItem[] = [];
    if (!loading) {
      if (challengeNameId) {
        items.push({
          name: _hub?.hub.displayName,
          url: buildHubUrl(hubNameId),
        });
      }
      if (opportunityNameId) {
        items.push({
          name: _challenge?.hub.challenge.displayName,
          url: buildChallengeUrl(hubNameId, challengeNameId),
        });
      }
    }
    return items;
  }, [loading, challengeNameId, opportunityNameId]);

  return {
    loading,
    breadcrumbs,
  };
};
