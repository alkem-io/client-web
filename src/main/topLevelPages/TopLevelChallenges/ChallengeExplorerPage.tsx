import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChallengeExplorerContainer } from './ChallengeExplorerContainer';
import { ChallengeExplorerView } from './ChallengeExplorerView';
import TopLevelPageLayout from '../../ui/layout/topLevelPageLayout/TopLevelPageLayout';
import useInnovationHubOutsideRibbon from '../../../domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { ChallengeIcon } from '../../../domain/journey/challenge/icon/ChallengeIcon';

export interface ChallengeExplorerPageProps {}

export const ChallengeExplorerPage: FC<ChallengeExplorerPageProps> = () => {
  const { t } = useTranslation();
  const [searchTerms, setSearchTerms] = useState<string[]>([t('pages.challenge-explorer.search.default-search-term')]);

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.challenges' });

  return (
    <TopLevelPageLayout
      iconComponent={ChallengeIcon}
      title={t('pages.challenge-explorer.search.title')}
      subtitle={t('pages.challenge-explorer.search.subtitle')}
      ribbon={ribbon}
    >
      <ChallengeExplorerContainer searchTerms={searchTerms}>
        {(entities, state) => {
          return <ChallengeExplorerView {...entities} {...state} setSearchTerms={setSearchTerms} />;
        }}
      </ChallengeExplorerContainer>
    </TopLevelPageLayout>
  );
};
