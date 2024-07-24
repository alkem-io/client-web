import React, { PropsWithChildren, ReactNode } from 'react';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SpaceCard, { SpaceCardProps } from '../../../journey/space/SpaceCard/SpaceCard';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Account, Nvp, SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { Visual } from '../../../common/visual/Visual';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { Link } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { Account } from '../../../journey/account/Account';

export interface SpaceAttrs extends Identifiable {
  context?: { vision?: string };
  profile: {
    url: string;
    displayName: string;
    tagline: string;
    tagset?: {
      id: string;
      tags?: string[];
    };
    cardBanner?: Visual;
  };
  visibility: SpaceVisibility;
  account: Account;
  metrics?: Pick<Nvp, 'name' | 'value'>[];
}

export interface DashboardSpaceSectionProps<ExtraAttrs extends {}> {
  spaces: (SpaceAttrs & ExtraAttrs)[];
  getSpaceCardProps?: (space: SpaceAttrs & ExtraAttrs) => Partial<SpaceCardProps>;
  headerText: ReactNode;
  primaryAction?: ReactNode;
  loader?: ReactNode;
  scrollable?: boolean;
}

const DashboardSpacesSection = <ExtraAttrs extends {}>({
  headerText,
  primaryAction,
  spaces,
  getSpaceCardProps,
  children,
  loader,
  scrollable = false,
  ...props
}: PropsWithChildren<DashboardSpaceSectionProps<ExtraAttrs>>) => {
  const { t } = useTranslation();
  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeader title={headerText} actions={primaryAction} />
      {children}
      <ScrollableCardsLayoutContainer maxHeight={scrollable ? theme => theme.spacing(45) : undefined}>
        {spaces.map(space => (
          <SpaceCard
            key={space.id}
            banner={space.profile.cardBanner}
            spaceId={space.id}
            displayName={space.profile.displayName}
            journeyUri={space.profile.url}
            vision={space.context?.vision!}
            membersCount={getMetricCount(space.metrics, MetricType.Member)}
            tagline={space.profile.tagline!}
            tags={space.profile.tagset?.tags!}
            spaceVisibility={space.visibility}
            {...getSpaceCardProps?.(space)}
          />
        ))}
        {loader}
      </ScrollableCardsLayoutContainer>
      <Link href="/spaces" textAlign="right">
        <Caption>{t('common.show-all')}</Caption>
      </Link>
    </PageContentBlock>
  );
};

export default DashboardSpacesSection;
