import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Challenge, Nvp, VisualUriFragment } from '../../../../../models/graphql-schema';
import EntityContributionCard, { EntityContributionCardLabel } from '../ContributionCard/EntityContributionCard';
import { buildChallengeUrl } from '../../../../../utils/urlBuilders';
import getActivityCount from '../../../../../domain/activity/utils/getActivityCount';
import { useUserContext } from '../../../../../hooks';
import { getVisualBannerNarrow } from '../../../../../utils/visuals.utils';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';

type ChallengeAttributes = Pick<Challenge, NeededFields> & { activity?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
  context?: { tagline?: string; visuals?: VisualUriFragment[] };
};

export interface ChallengeCardProps {
  challenge: ChallengeAttributes | undefined;
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
          count: getActivityCount(activity, 'opportunities'),
        },
        {
          name: t('common.members'),
          count: getActivityCount(activity, 'members'),
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
      label={isMember(id) ? EntityContributionCardLabel.Member : undefined}
      loading={loading}
      activities={activities}
    />
  );
};
export default ChallengeCard;
