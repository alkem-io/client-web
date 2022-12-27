import React, { FC, ReactNode } from 'react';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import { HubCardProps } from '../../../../common/components/composite/common/cards/HubCard/HubCard';
import { EntityContributionCardLabel } from '../../../../common/components/composite/common/cards/ContributionCard/EntityContributionCard';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { Caption } from '../../../../core/ui/typography';
import HubCard from '../../../challenge/hub/HubCard/HubCard';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

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
