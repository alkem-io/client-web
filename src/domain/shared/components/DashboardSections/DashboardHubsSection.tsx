import React, { FC, ReactNode } from 'react';
import CardsLayout from '../../layout/CardsLayout/CardsLayout';
import { EntityContributionCardLabel } from '../../../../common/components/composite/common/cards/ContributionCard/EntityContributionCard';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { Caption } from '../../../../core/ui/typography';
import HubCard from '../../../challenge/hub/HubCard/HubCard';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';
import { Hub, Nvp, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';

type HubAttrs = Pick<Hub, NeededFields> & { metrics?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
  context?: { tagline?: string; vision?: string; visuals?: VisualUriFragment[] };
};

export interface HubCardProps {
  hub: HubAttrs;
  loading?: boolean;
  getLabel?: (hub: HubAttrs) => EntityContributionCardLabel | undefined;
}

export interface DashboardHubSectionProps {
  hubs: HubCardProps['hub'][];
  getHubCardLabel?: (hub: HubCardProps['hub']) => EntityContributionCardLabel | undefined; // TODO other labels for HubCard except "member"
  headerText: ReactNode;
  subHeaderText: ReactNode;
  primaryAction?: ReactNode;
}

const DashboardHubsSection: FC<DashboardHubSectionProps> = ({
  headerText,
  subHeaderText,
  primaryAction,
  hubs,
  getHubCardLabel,
  children,
  ...props
}) => {
  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeader title={headerText} actions={primaryAction} />
      <Caption>{subHeaderText}</Caption>
      {children}
      <CardsLayout items={hubs} deps={[getHubCardLabel]} disablePadding cards={false}>
        {hub => (
          <HubCard
            bannerUri={getVisualBanner(hub.context?.visuals)}
            hubId={hub.id}
            displayName={hub.displayName}
            journeyUri={buildHubUrl(hub.nameID)}
            vision={hub.context?.vision!}
            membersCount={getMetricCount(hub.metrics, MetricType.Member)}
            tagline={hub.context?.tagline!}
            tags={hub.tagset?.tags!}
          />
        )}
      </CardsLayout>
    </PageContentBlock>
  );
};

export default DashboardHubsSection;
