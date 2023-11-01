import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChallengeExplorerContainer } from './ChallengeExplorerContainer';
import { ChallengeExplorerView } from './ChallengeExplorerView';
import TopLevelPageLayout from '../../ui/layout/topLevelPageLayout/TopLevelPageLayout';
import useInnovationHubOutsideRibbon from '../../../domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { ChallengeIcon } from '../../../domain/journey/challenge/icon/ChallengeIcon';
import BreadcrumbsItem from '../../../core/ui/navigation/BreadcrumbsItem';
import TopLevelPageBreadcrumbs from '../topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';

export interface ChallengeExplorerPageProps {}

export const ChallengeExplorerPage: FC<ChallengeExplorerPageProps> = () => {
  const { t } = useTranslation();
  const [searchTerms, setSearchTerms] = useState<string[]>([t('pages.challenge-explorer.search.default-search-term')]);

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.challenges' });

  return (
    <TopLevelPageLayout
      iconComponent={ChallengeIcon}
      title={t('pages.challenge-explorer.fullName')}
      subtitle={t('pages.challenge-explorer.search.subtitle')}
      ribbon={ribbon}
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem iconComponent={ChallengeIcon} uri="/contributors">
            {t('pages.challenge-explorer.shortName')}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
    >
      <ChallengeExplorerContainer searchTerms={searchTerms}>
        {(entities, state) => {
          return <ChallengeExplorerView {...entities} {...state} setSearchTerms={setSearchTerms} />;
        }}
      </ChallengeExplorerContainer>
    </TopLevelPageLayout>
  );
};
