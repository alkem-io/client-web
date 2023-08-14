import React, { FC, ReactNode } from 'react';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SpaceCard, { SpaceCardProps } from '../../../challenge/space/SpaceCard/SpaceCard';
import { buildSpaceUrl } from '../../../../common/utils/urlBuilders';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { Space, Nvp, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

type NeededFields = 'nameID' | 'authorization' | 'id' | 'visibility';

type SpaceAttrs = Pick<Space, NeededFields> & { metrics?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
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

export interface DashboardSpaceSectionProps {
  spaces: SpaceAttrs[];
  getSpaceCardProps?: (space: SpaceAttrs) => Partial<SpaceCardProps>;
  headerText: ReactNode;
  primaryAction?: ReactNode;
}

const DashboardSpacesSection: FC<DashboardSpaceSectionProps> = ({
  headerText,
  primaryAction,
  spaces,
  getSpaceCardProps,
  children,
  ...props
}) => {
  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeader title={headerText} actions={primaryAction} />
      {children}
      <ScrollableCardsLayoutContainer>
        {spaces.map(space => (
          <SpaceCard
            key={space.id}
            banner={getVisualByType(VisualName.BANNERNARROW, space.profile.visuals)}
            spaceId={space.id}
            displayName={space.profile.displayName}
            journeyUri={buildSpaceUrl(space.nameID)}
            vision={space.context?.vision!}
            membersCount={getMetricCount(space.metrics, MetricType.Member)}
            tagline={space.profile.tagline!}
            tags={space.profile.tagset?.tags!}
            spaceVisibility={space.visibility}
            {...getSpaceCardProps?.(space)}
          />
        ))}
      </ScrollableCardsLayoutContainer>
    </PageContentBlock>
  );
};

export default DashboardSpacesSection;
