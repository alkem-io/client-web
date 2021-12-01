import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ChallengesOverviewSectionView } from './ChallengesOverviewSectionView';
import { Box } from '@mui/material';

export interface HubOverview {
  displayName: string;
  challenges: any[];
}

export interface ChallengesOverviewViewProps {
  my: any[];
  hubs: HubOverview[];
}

export const ChallengesOverviewView: FC<ChallengesOverviewViewProps> = ({ my, hubs }) => {
  const { t } = useTranslation();
  return (
    <Box paddingY={2}>
      <ChallengesOverviewSectionView
        title={t('pages.challenges-overview.my.title', { count: my.length })}
        subtitle={t('pages.challenges-overview.my.subtitle')}
        helpText={t('pages.challenges-overview.my.help-text')}
        ariaKey="my"
        challenges={my}
      />
      {hubs.map(({ challenges, displayName: name }, i) => {
        const count = challenges.length;
        return (
          <ChallengesOverviewSectionView
            key={i}
            title={t('pages.challenges-overview.my.title', { count, name })}
            subtitle={t('pages.challenges-overview.my.subtitle', { name })}
            helpText={t('pages.challenges-overview.my.help-text')}
            ariaKey={name}
            challenges={challenges}
          />
        );
      })}
    </Box>
  );
};
