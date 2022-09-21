import React, { FC, memo, useMemo } from 'react';
import { OpportunitySearchResultFragment } from '../../../../models/graphql-schema';
import { ActivityItem } from '../common/ActivityPanel/Activities';
import getActivityCount from '../../../../domain/platform/activity/utils/getActivityCount';
import { useHubNameQuery } from '../../../../hooks/generated/graphql';
import { getVisualBannerNarrow } from '../../../utils/visuals.utils';
import { buildOpportunityUrl } from '../../../utils/urlBuilders';
import { SearchCard } from './SearchCard';
import EntitySearchCardProps from './EntitySearchCardProps';

const OpportunitySearchCardInner: FC<EntitySearchCardProps<OpportunitySearchResultFragment>> = ({
  terms,
  entity: opportunity,
}) => {
  const hubId = opportunity?.challenge?.hubID;
  const challengeNameId = opportunity?.challenge?.nameID;
  const opportunityNameId = opportunity?.nameID;
  // todo: can we avoid this query?
  const { data } = useHubNameQuery({
    variables: {
      hubId: hubId!,
    },
    skip: !hubId,
  });
  const hubNameId = data?.hub?.nameID;

  const tag = opportunity.challenge?.displayName || '';

  const backgroundImg = getVisualBannerNarrow(opportunity.context?.visuals) ?? '';
  const displayName = opportunity?.displayName || '';

  const _activity = opportunity?.activity || [];
  const activity: ActivityItem[] = [
    { name: 'Projects', count: getActivityCount(_activity, 'projects'), color: 'primary' },
    { name: 'Members', count: getActivityCount(_activity, 'members'), color: 'positive' },
  ];

  const url = useMemo(() => {
    if (!hubNameId || !challengeNameId || !opportunityNameId) {
      return;
    }

    return buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);
  }, [hubNameId, challengeNameId, opportunityNameId]);

  return (
    <SearchCard
      title={displayName}
      terms={terms}
      activity={activity}
      backgroundImg={backgroundImg}
      tag={tag}
      url={url}
    />
  );
};
/**
 * @deprecated Use a new component instead
 */
export const OpportunitySearchCard = memo(OpportunitySearchCardInner);
