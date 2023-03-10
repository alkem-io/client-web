import React, { FC, ReactNode } from 'react';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import HubCard, { HubCardProps } from '../../../challenge/hub/HubCard/HubCard';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { getVisualBannerNarrow } from '../../../common/visual/utils/visuals.utils';
import { Hub, Nvp, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';

type NeededFields = 'nameID' | 'authorization' | 'id' | 'visibility';

type HubAttrs = Pick<Hub, NeededFields> & { metrics?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
  context?: { tagline?: string; vision?: string; visuals?: VisualUriFragment[] };
  profile: {
    displayName: string;
    tagset?: {
      id: string;
      name: string;
      tags?: string[];
    };
  };
};

export interface DashboardHubSectionProps {
  hubs: HubAttrs[];
  getHubCardProps?: (hub: HubAttrs) => Partial<HubCardProps>;
  headerText: ReactNode;
  primaryAction?: ReactNode;
}

const DashboardHubsSection: FC<DashboardHubSectionProps> = ({
  headerText,
  primaryAction,
  hubs,
  getHubCardProps,
  children,
  ...props
}) => {
  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeader title={headerText} actions={primaryAction} />
      {children}
      <CardsLayout items={hubs} disablePadding cards={false}>
        {hub => (
          <HubCard
            bannerUri={getVisualBannerNarrow(hub.context?.visuals)}
            hubId={hub.id}
            displayName={hub.profile.displayName}
            journeyUri={buildHubUrl(hub.nameID)}
            vision={hub.context?.vision!}
            membersCount={getMetricCount(hub.metrics, MetricType.Member)}
            tagline={hub.context?.tagline!}
            tags={hub.profile.tagset?.tags!}
            {...getHubCardProps?.(hub)}
          />
        )}
      </CardsLayout>
    </PageContentBlock>
  );
};

export default DashboardHubsSection;
