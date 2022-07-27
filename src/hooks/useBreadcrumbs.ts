import { useMemo } from 'react';
import { useUrlParams } from '.';
import { useHub } from '../domain/hub/HubContext/useHub';
import { buildChallengeUrl, buildHubUrl } from '../utils/urlBuilders';
import { useChallenge } from './useChallenge';

export interface BreadcrumbsItem {
  name: string;
  url: string;
}

export const useBreadcrumbs = () => {
  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();

  const { displayName: hubDisplayName, loading: loadingHub } = useHub();
  const { displayName: challengeDisplayName, loading: loadingChallenge } = useChallenge();

  const loading = (hubNameId && loadingHub) || (challengeNameId && loadingChallenge);

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbsItem[] = [];
    if (!loading) {
      if (challengeNameId) {
        items.push({
          name: hubDisplayName,
          url: buildHubUrl(hubNameId),
        });
      }
      if (opportunityNameId) {
        items.push({
          name: challengeDisplayName,
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
