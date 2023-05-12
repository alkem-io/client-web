import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { ChallengeExplorerContainer } from './ChallengeExplorerContainer';
import { ChallengeExplorerView } from './ChallengeExplorerView';
import TopLevelDesktopLayout from '../../ui/PageLayout/TopLevelDesktopLayout';

export interface ChallengeExplorerPageProps {}

export const ChallengeExplorerPage: FC<ChallengeExplorerPageProps> = () => {
  const currentPaths = useMemo(() => [{ value: '/', name: 'challenges', real: true }], []);
  const { t } = useTranslation();
  useUpdateNavigation({ currentPaths });
  const [searchTerms, setSearchTerms] = useState<string[]>([t('pages.challenge-explorer.search.default-search-term')]);

  return (
    <TopLevelDesktopLayout>
      <ChallengeExplorerContainer searchTerms={searchTerms}>
        {(entities, state) => {
          return <ChallengeExplorerView {...entities} {...state} setSearchTerms={setSearchTerms} />;
        }}
      </ChallengeExplorerContainer>
    </TopLevelDesktopLayout>
  );
};
