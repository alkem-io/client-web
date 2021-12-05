import React, { FC } from 'react';
import { SectionSpacer } from '../../../../core/Section/Section';
import { Activities, ActivityItem } from '../../ActivityPanel/Activities';
import ContributionCardV2, { ContributionCardV2Props } from './ContributionCardV2';

export interface HubContributionCardProps extends ContributionCardV2Props {
  activities: ActivityItem[];
}

const HubContributionCard: FC<HubContributionCardProps> = ({ details, loading, activities, children }) => {
  return (
    <ContributionCardV2 details={details} loading={loading}>
      <SectionSpacer double />
      <Activities items={activities} />
      <SectionSpacer />
      {children}
    </ContributionCardV2>
  );
};

export default HubContributionCard;
