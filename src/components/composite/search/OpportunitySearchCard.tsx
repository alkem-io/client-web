import React, { FC, memo } from 'react';
import { OpportunitySearchResultFragment } from '../../../models/graphql-schema';
import { ActivityItem } from '../common/ActivityPanel/Activities';
import getActivityCount from '../../../utils/get-activity-count';
import OpportunityPopUp from '../entities/Opportunity/OpportunityPopUp';
import { useHubNameQuery } from '../../../hooks/generated/graphql';
import { SearchCard } from './SearchCard';
import EntitySearchCardProps from './EntitySearchCardProps';
import { getVisualBannerNarrow } from '../../../utils/visuals.utils';

const OpportunitySearchCardInner: FC<EntitySearchCardProps<OpportunitySearchResultFragment>> = ({
  terms,
  entity: opportunity,
}) => {
  // todo: can we avoid this query?
  const { data } = useHubNameQuery({
    variables: {
      hubId: opportunity?.challenge?.hubID || '',
    },
  });
  const hub = data?.hub;
  const tag = opportunity.challenge?.displayName || '';

  const backgroundImg = getVisualBannerNarrow(opportunity.context?.visuals) ?? '';
  const displayName = opportunity?.displayName || '';

  const _activity = opportunity?.activity || [];
  const activity: ActivityItem[] = [
    { name: 'Projects', digit: getActivityCount(_activity, 'projects') || 0, color: 'primary' },
    { name: 'Members', digit: getActivityCount(_activity, 'members') || 0, color: 'positive' },
  ];

  return (
    <SearchCard
      title={displayName}
      terms={terms}
      activity={activity}
      backgroundImg={backgroundImg}
      tag={tag}
      dialog={<OpportunityPopUp entity={opportunity} hub={hub} />}
    />
  );
};

export const OpportunitySearchCard = memo(OpportunitySearchCardInner);
