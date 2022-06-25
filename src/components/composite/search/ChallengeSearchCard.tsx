import React, { FC, memo } from 'react';
import { ChallengeSearchResultFragment } from '../../../models/graphql-schema';
import { useHubNameQuery } from '../../../hooks/generated/graphql';
import { SearchCard } from './SearchCard';
import ChallengePopUp from '../entities/Challenge/ChallengePopUp';
import getActivityCount from '../../../domain/activity/utils/getActivityCount';
import { ActivityItem } from '../common/ActivityPanel/Activities';
import EntitySearchCardProps from './EntitySearchCardProps';
import { getVisualBannerNarrow } from '../../../utils/visuals.utils';

const ChallengeSearchCardInner: FC<EntitySearchCardProps<ChallengeSearchResultFragment>> = ({
  terms,
  entity: challenge,
}) => {
  // todo: can we avoid this query?
  const { data } = useHubNameQuery({
    variables: {
      hubId: challenge.hubID,
    },
  });
  const hub = data?.hub;
  const tag = hub?.displayName || '';

  const backgroundImg = getVisualBannerNarrow(challenge.context?.visuals) ?? '';
  const displayName = challenge.displayName || '';

  const _activity = challenge?.activity || [];
  const activity: ActivityItem[] = [
    { name: 'Opportunities', count: getActivityCount(_activity, 'opportunities'), color: 'primary' },
    { name: 'Members', count: getActivityCount(_activity, 'members'), color: 'positive' },
  ];

  return (
    <SearchCard
      title={displayName}
      terms={terms}
      activity={activity}
      backgroundImg={backgroundImg}
      tag={tag}
      dialog={<ChallengePopUp entity={challenge} hub={hub} />}
    />
  );
};

export const ChallengeSearchCard = memo(ChallengeSearchCardInner);
