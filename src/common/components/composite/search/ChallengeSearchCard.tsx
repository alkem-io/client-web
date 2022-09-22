import React, { FC, memo, useMemo } from 'react';
import { ChallengeSearchResultFragment } from '../../../../models/graphql-schema';
import { useHubNameQuery } from '../../../../hooks/generated/graphql';
import { SearchCard } from './SearchCard';
import getActivityCount from '../../../../domain/platform/activity/utils/getActivityCount';
import { ActivityItem } from '../common/ActivityPanel/Activities';
import EntitySearchCardProps from './EntitySearchCardProps';
import { getVisualBannerNarrow } from '../../../utils/visuals.utils';
import { buildChallengeUrl } from '../../../utils/urlBuilders';

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
  const hubNameId = hub?.nameID;
  const challengeNameId = challenge?.nameID;
  const tag = hub?.displayName || '';

  const url = useMemo(() => {
    if (!hubNameId || !challengeNameId) {
      return;
    }

    return buildChallengeUrl(hubNameId, challengeNameId);
  }, [hubNameId, challengeNameId]);

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
      url={url}
    />
  );
};
/**
 * @deprecated Use a new component instead
 */
export const ChallengeSearchCard = memo(ChallengeSearchCardInner);
