import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material';
import { SectionSpacer } from '../../../../../../domain/shared/components/Section/Section';
import ActivitiesV2 from '../../Activities/ActivitiesV2';
import { ActivityItem } from '../../ActivityPanel/Activities';
import ContributionCardV2, {
  ContributionCardV2Props,
} from '../../../../../../domain/shared/components/ContributionCard/ContributionCardV2';

const PREFIX = 'EntityContributionCard';
const cssClasses = {
  member: `${PREFIX}-member`,
};
const Card = styled(ContributionCardV2)(({ theme }) => ({
  [`& .${cssClasses.member}`]: {
    background: theme.palette.augmentColor({ color: theme.palette.positive }).dark,
  },
}));

export interface EntityContributionCardProps extends ContributionCardV2Props {
  activities?: ActivityItem[];
  label?: EntityContributionCardLabel;
}

export enum EntityContributionCardLabel {
  Member = 'member',
  Anonymous = 'private',
  Lead = 'lead',
}

const EntityContributionCard: FC<EntityContributionCardProps> = ({
  details,
  classes,
  loading,
  activities,
  label,
  children,
}) => {
  const { t } = useTranslation();

  if (details && !details.labelText && label) {
    details.labelText = t(`components.card.${label}` as const);
  }

  if (!classes || (!classes?.label && label === EntityContributionCardLabel.Member)) {
    classes = {
      label: cssClasses.member,
    };
  }

  return (
    <Card details={details} classes={classes} loading={loading}>
      <SectionSpacer double />
      {activities && (
        <>
          <ActivitiesV2 activity={activities} />
          <SectionSpacer />
        </>
      )}
      {children}
    </Card>
  );
};

export default EntityContributionCard;
