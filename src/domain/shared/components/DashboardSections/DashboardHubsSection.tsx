import React, { FC, ReactNode } from 'react';
import CardsLayout from '../../layout/CardsLayout/CardsLayout';
import HubCard, { HubCardProps } from '../../../../common/components/composite/common/cards/HubCard/HubCard';
import { EntityContributionCardLabel } from '../../../../common/components/composite/common/cards/ContributionCard/EntityContributionCard';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { Caption } from '../../../../core/ui/typography';

export interface DashboardHubSectionProps {
  hubs: HubCardProps['hub'][];
  getHubCardLabel?: (hub: HubCardProps['hub']) => EntityContributionCardLabel | undefined;
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
      <CardsLayout items={hubs} deps={[getHubCardLabel]}>
        {hub => <HubCard hub={hub} getLabel={getHubCardLabel} />}
      </CardsLayout>
    </PageContentBlock>
  );
};

export default DashboardHubsSection;
