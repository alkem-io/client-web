import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { ChallengeExplorerContainer } from '../containers/ChallengeExplorerContainer';
import { ChallengeExplorerView } from '../views/ChallengeExplorerView';
import TopLevelDesktopLayout from '../../../../core/ui/layout/TopLevel/TopLevelDesktopLayout';

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
