import React, { FC } from 'react';
import { SectionSpacer } from '../../../../core/Section/Section';
import ActivitiesV2 from '../../Activities/ActivitiesV2';
import { ActivityItem } from '../../ActivityPanel/Activities';
import ContributionCardV2, { ContributionCardV2Props } from './ContributionCardV2';

export interface EntityContributionCardProps extends ContributionCardV2Props {
  activities: ActivityItem[];
}

const EntityContributionCard: FC<EntityContributionCardProps> = ({
  details,
  classes,
  loading,
  activities,
  children,
}) => {
  return (
    <ContributionCardV2 details={details} classes={classes} loading={loading}>
      <SectionSpacer double />
      <ActivitiesV2 activity={activities} />
      <SectionSpacer />
      {children}
    </ContributionCardV2>
  );
};

export default EntityContributionCard;
