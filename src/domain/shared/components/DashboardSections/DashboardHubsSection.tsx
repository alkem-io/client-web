import React, { FC, ReactNode } from 'react';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import HubCard, { HubCardProps } from '../../../challenge/hub/HubCard/HubCard';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { Hub, Nvp, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

type NeededFields = 'nameID' | 'authorization' | 'id' | 'visibility';

type HubAttrs = Pick<Hub, NeededFields> & { metrics?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
  context?: { vision?: string };
  profile: {
    displayName: string;
    tagline: string;
    tagset?: {
      id: string;
      name: string;
      tags?: string[];
    };
    visuals?: VisualUriFragment[];
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
      <ScrollableCardsLayout items={hubs} cards={false}>
        {hub => {
          return (
            <HubCard
              banner={getVisualByType(VisualName.BANNERNARROW, hub.profile.visuals)}
              hubId={hub.id}
              displayName={hub.profile.displayName}
              journeyUri={buildHubUrl(hub.nameID)}
              vision={hub.context?.vision!}
              membersCount={getMetricCount(hub.metrics, MetricType.Member)}
              tagline={hub.profile.tagline!}
              tags={hub.profile.tagset?.tags!}
              hubVisibility={hub.visibility}
              {...getHubCardProps?.(hub)}
            />
          );
        }}
      </ScrollableCardsLayout>
    </PageContentBlock>
  );
};

export default DashboardHubsSection;
