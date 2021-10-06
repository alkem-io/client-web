import React, { FC, memo } from 'react';
import { OpportunitySearchResultFragment } from '../../models/graphql-schema';
import { ActivityItem } from '../composite/common/ActivityPanel/Activities';
import getActivityCount from '../../utils/get-activity-count';
import OpportunityPopUp from '../Opportunity/OpportunityPopUp';
import { useEcoverseNameQuery } from '../../hooks/generated/graphql';
import { SearchCard } from './SearchCard';
import EntitySearchCardProps from './EntitySearchCardProps';

const OpportunitySearchCardInner: FC<EntitySearchCardProps<OpportunitySearchResultFragment>> = ({
  terms,
  entity: opportunity,
}) => {
  // todo: can we avoid this query?
  const { data } = useEcoverseNameQuery({
    variables: {
      ecoverseId: opportunity?.challenge?.ecoverseID || '',
    },
  });
  const ecoverse = data?.ecoverse;
  const tag = opportunity.challenge?.displayName || '';

  const backgroundImg = opportunity.context?.visual?.background || '';
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
      dialog={<OpportunityPopUp entity={opportunity} ecoverse={ecoverse} />}
    />
  );
};

export const OpportunitySearchCard = memo(OpportunitySearchCardInner);
