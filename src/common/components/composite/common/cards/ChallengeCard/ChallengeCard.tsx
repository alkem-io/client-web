import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Challenge, Nvp, VisualUriFragment } from '../../../../../../core/apollo/generated/graphql-schema';
import EntityContributionCard, { EntityContributionCardLabel } from '../ContributionCard/EntityContributionCard';
import { buildChallengeUrl } from '../../../../../utils/urlBuilders';
import getMetricCount from '../../../../../../domain/platform/metrics/utils/getMetricCount';
import { useUserContext } from '../../../../../../domain/community/contributor/user';
import { getVisualBannerNarrow } from '../../../../../../domain/common/visual/utils/visuals.utils';
import { MetricType } from '../../../../../../domain/platform/metrics/MetricType';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';

type ChallengeAttributes = Pick<Challenge, NeededFields> & { metrics?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
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

  const { id, nameID, metrics = [], context } = challenge ?? {};
  const bannerNarrow = getVisualBannerNarrow(context?.visuals);
  const url = hubNameId && nameID && buildChallengeUrl(hubNameId, nameID);
  const metricItems = loading
    ? []
    : [
        {
          name: t('common.opportunities'),
          count: getMetricCount(metrics, MetricType.Opportunity),
        },
        {
          name: t('common.members'),
          count: getMetricCount(metrics, MetricType.Member),
        },
      ];

  return (
    <EntityContributionCard
      details={{
        headerText: challenge?.displayName,
        descriptionText: challenge?.context?.tagline,
        mediaUrl: bannerNarrow,
        tags: challenge?.tagset?.tags || [],
        url,
      }}
      label={isMember(id) ? EntityContributionCardLabel.Member : undefined}
      loading={loading}
      metrics={metricItems}
    />
  );
};

export default ChallengeCard;
