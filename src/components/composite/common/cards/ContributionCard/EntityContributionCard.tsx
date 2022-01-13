import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material';
import { SectionSpacer } from '../../../../core/Section/Section';
import ActivitiesV2 from '../../Activities/ActivitiesV2';
import { ActivityItem } from '../../ActivityPanel/Activities';
import ContributionCardV2, { ContributionCardV2Props } from './ContributionCardV2';

const PREFIX = 'EntityContributionCard';
const cssClasses = {
  member: `${PREFIX}-member`,
};
const Root = styled('div')(({ theme }) => ({
  [`& .${cssClasses.member}`]: {
    background: theme.palette.augmentColor({ color: theme.palette.positive }).dark,
  },
}));

export interface EntityContributionCardProps extends ContributionCardV2Props {
  activities: ActivityItem[];
  isMember?: boolean;
  isAnonymous?: boolean;
}

const EntityContributionCard: FC<EntityContributionCardProps> = ({
  details,
  classes,
  loading,
  activities,
  isMember = false,
  isAnonymous = true,
  children,
}) => {
  const { t } = useTranslation();
  const getCardLabel = useCallback((isMember: boolean, isAnonymous: boolean) => {
    if (isMember) {
      return t('components.card.member');
    } else if (!isAnonymous) {
      return t('components.card.private');
    } else {
      return undefined;
    }
  }, []);

  if (details && !details.labelText) {
    details.labelText = getCardLabel(isMember, isAnonymous);
  }

  if (!classes || (!classes?.label && isMember)) {
    classes = {
      label: cssClasses.member,
    };
  }

  return (
    <Root>
      <ContributionCardV2 details={details} classes={classes} loading={loading}>
        <SectionSpacer double />
        <ActivitiesV2 activity={activities} />
        <SectionSpacer />
        {children}
      </ContributionCardV2>
    </Root>
  );
};

export default EntityContributionCard;
