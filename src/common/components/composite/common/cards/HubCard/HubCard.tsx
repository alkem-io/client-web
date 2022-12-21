import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { buildHubUrl } from '../../../../../utils/urlBuilders';
import getMetricCount from '../../../../../../domain/platform/metrics/utils/getMetricCount';
import { Hub, Nvp, VisualUriFragment } from '../../../../../../core/apollo/generated/graphql-schema';
import EntityContributionCard, { EntityContributionCardLabel } from '../ContributionCard/EntityContributionCard';
import { getVisualBannerNarrow } from '../../../../../../domain/common/visual/utils/visuals.utils';
import { MetricType } from '../../../../../../domain/platform/metrics/MetricType';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';

type HubAttrs = Pick<Hub, NeededFields> & { metrics?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
  context?: { tagline?: string; vision?: string; visuals?: VisualUriFragment[] };
};

export interface HubCardProps {
  hub: HubAttrs;
  loading?: boolean;
  getLabel?: (hub: HubAttrs) => EntityContributionCardLabel | undefined;
}

const HubCard: FC<HubCardProps> = ({ hub, loading = false, getLabel }) => {
  const { t } = useTranslation();

  const bannerNarrow = getVisualBannerNarrow(hub?.context?.visuals);

  const { metrics = [] } = hub;

  return (
    <EntityContributionCard
      details={{
        headerText: hub.displayName,
        descriptionText: hub?.context?.tagline,
        mediaUrl: bannerNarrow,
        tags: hub.tagset?.tags || [],
        url: buildHubUrl(hub.nameID),
      }}
      label={getLabel?.(hub)}
      loading={loading}
      metrics={[
        {
          name: t('common.challenges'),
          count: getMetricCount(metrics, MetricType.Challenge),
          color: 'primary',
        },
        {
          name: t('common.opportunities'),
          count: getMetricCount(metrics, MetricType.Opportunity),
          color: 'primary',
        },
        {
          name: t('common.members'),
          count: getMetricCount(metrics, MetricType.Member),
          color: 'positive',
        },
      ]}
    />
  );
};

export default HubCard;
