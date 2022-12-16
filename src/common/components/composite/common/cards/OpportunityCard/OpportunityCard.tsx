import React, { FC, useCallback } from 'react';
import { Nvp, Opportunity, VisualUriFragment } from '../../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import EntityContributionCard, { EntityContributionCardLabel } from '../ContributionCard/EntityContributionCard';
import { buildOpportunityUrl } from '../../../../../utils/urlBuilders';
import getMetricCount from '../../../../../../domain/platform/metrics/utils/getMetricCount';
import { useUserContext } from '../../../../../../domain/community/contributor/user';
import { getVisualBannerNarrow } from '../../../../../../domain/common/visual/utils/visuals.utils';
import { MetricType } from '../../../../../../domain/platform/metrics/MetricType';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';
export interface OpportunityCardProps {
  opportunity: Pick<Opportunity, NeededFields> & { metrics?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
    context?: { tagline?: string; visuals?: VisualUriFragment[] };
  };
  hubNameId: string;
  challengeNameId: string;
  loading?: boolean;
}

const OpportunityCard: FC<OpportunityCardProps> = ({ opportunity, hubNameId, challengeNameId, loading = false }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const isMember = useCallback(
    (opportunityId: string) => {
      return user?.ofOpportunity(opportunityId) ?? false;
    },
    [user]
  );

  const bannerNarrow = getVisualBannerNarrow(opportunity?.context?.visuals);
  const { metrics } = opportunity;

  return (
    <EntityContributionCard
      details={{
        headerText: opportunity.displayName,
        descriptionText: opportunity?.context?.tagline,
        mediaUrl: bannerNarrow,
        tags: opportunity.tagset?.tags || [],
        url: buildOpportunityUrl(hubNameId, challengeNameId, opportunity.nameID),
      }}
      label={isMember(opportunity.id) ? EntityContributionCardLabel.Member : undefined}
      loading={loading}
      metrics={[{ name: t('common.members'), count: getMetricCount(metrics, MetricType.Member) }]}
    />
  );
};

export default OpportunityCard;
