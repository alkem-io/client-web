import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Challenge, Nvp, VisualUriFragment } from '../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { buildChallengeUrl } from '../../../../../utils/urlBuilders';
import getActivityCount from '../../../../../utils/get-activity-count';
import { useUserContext } from '../../../../../hooks';
import { getVisualBannerNarrow } from '../../../../../utils/visuals.utils';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';
export interface ChallengeCardProps {
  challenge?: Pick<Challenge, NeededFields> & { activity?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
    context?: { tagline?: string; visuals?: VisualUriFragment[] };
  };
  hubNameId?: string;
  loading?: boolean;
}

const ChallengeCard: FC<ChallengeCardProps> = ({ challenge, hubNameId, loading = false }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const isMember = useCallback(
    (challengeId?: string) => {
      return !!(challengeId && user?.ofChallenge(challengeId));
    },
    [user]
  );

  const { id, nameID, activity = [], context } = challenge ?? {};
  const bannerNarrow = getVisualBannerNarrow(context?.visuals);
  const url = hubNameId && nameID && buildChallengeUrl(hubNameId, nameID);
  const activities = loading
    ? []
    : [
        {
          name: t('common.opportunities'),
          count: getActivityCount(activity, 'opportunities') ?? 0,
        },
        {
          name: t('common.members'),
          count: getActivityCount(activity, 'members') ?? 0,
        },
      ];

  return (
    <EntityContributionCard
      details={{
        headerText: challenge?.displayName,
        descriptionText: challenge?.context?.tagline,
        mediaUrl: bannerNarrow,
        tags: challenge?.tagset?.tags || [],
        tagsFor: 'challenge',
        url,
      }}
      isMember={isMember(id)}
      loading={loading}
      activities={activities}
    />
  );
};
export default ChallengeCard;
