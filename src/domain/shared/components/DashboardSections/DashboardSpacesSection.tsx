import React, { PropsWithChildren, ReactNode } from 'react';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SpaceCard, { SpaceCardProps } from '../../../journey/space/SpaceCard/SpaceCard';
import { buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Nvp, SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { Visual } from '../../../common/visual/Visual';
import { Identifiable } from '../../../../core/utils/Identifiable';

export interface SpaceAttrs extends Identifiable {
  nameID: string;
  context?: { vision?: string };
  profile: {
    displayName: string;
    tagline: string;
    tagset?: {
      id: string;
      tags?: string[];
    };
    cardBanner?: Visual;
  };
  // TODO inline types derived from generated GraphQL definitions
  visibility?: SpaceVisibility;
  metrics?: Pick<Nvp, 'name' | 'value'>[];
}

export interface DashboardSpaceSectionProps<ExtraAttrs extends {}> {
  spaces: (SpaceAttrs & ExtraAttrs)[];
  getSpaceCardProps?: (space: SpaceAttrs & ExtraAttrs) => Partial<SpaceCardProps>;
  headerText: ReactNode;
  primaryAction?: ReactNode;
}

const DashboardSpacesSection = <ExtraAttrs extends {}>({
  headerText,
  primaryAction,
  spaces,
  getSpaceCardProps,
  children,
  ...props
}: PropsWithChildren<DashboardSpaceSectionProps<ExtraAttrs>>) => {
  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeader title={headerText} actions={primaryAction} />
      {children}
      <ScrollableCardsLayoutContainer>
        {spaces.map(space => (
          <SpaceCard
            key={space.id}
            banner={space.profile.cardBanner}
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
