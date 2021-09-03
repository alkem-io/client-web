import React, { FC, memo } from 'react';
import { ChallengeSearchResultFragment } from '../../models/graphql-schema';
import { useEcoverseNameQuery } from '../../hooks/generated/graphql';
import { SearchCard } from './SearchCard';
import ChallengePopUp from '../Challenge/ChallengePopUp';
import getActivityCount from '../../utils/get-activity-count';
import { ActivityItem } from '../ActivityPanel/Activities';
import EntitySearchCardProps from './EntitySearchCardProps';

const ChallengeSearchCardInner: FC<EntitySearchCardProps<ChallengeSearchResultFragment>> = ({
  terms,
  entity: challenge,
}) => {
  // todo: can we avoid this query?
  const { data } = useEcoverseNameQuery({
    variables: {
      ecoverseId: challenge.ecoverseID,
    },
  });
  const ecoverse = data?.ecoverse;
  const tag = ecoverse?.displayName || '';

  const backgroundImg = challenge.context?.visual?.background || '';
  const displayName = challenge.displayName || '';

  const _activity = challenge?.activity || [];
  const activity: ActivityItem[] = [
    { name: 'Opportunities', digit: getActivityCount(_activity, 'opportunities') || 0, color: 'primary' },
    { name: 'Members', digit: getActivityCount(_activity, 'members') || 0, color: 'positive' },
  ];

  return (
    <SearchCard
      title={displayName}
      terms={terms}
      activity={activity}
      backgroundImg={backgroundImg}
      tag={tag}
      dialog={<ChallengePopUp entity={challenge} ecoverse={ecoverse} />}
    />
  );
};

export const ChallengeSearchCard = memo(ChallengeSearchCardInner);
