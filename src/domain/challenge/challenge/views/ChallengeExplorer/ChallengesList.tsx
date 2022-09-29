import { Box } from '@mui/material';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CardFilter from '../../../../../common/components/core/card-filter/CardFilter';
import { buildChallengeUrl } from '../../../../../common/utils/urlBuilders';
import { useUserContext } from '../../../../../hooks';
import { RoleType } from '../../../../community/contributor/user/constants/RoleType';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { SearchChallengeCard } from '../../../../shared/components/search-cards';
import CardsLayout from '../../../../shared/layout/CardsLayout/CardsLayout';
import CardsLayoutScroller from '../../../../shared/layout/CardsLayout/CardsLayoutScroller';
import {
  SimpleChallenge,
  simpleChallengeValueGetter,
  simpleChallengeTagsValueGetter,
} from '../../containers/ChallengeExplorerContainer';

export interface ChallengesListProps {
  headerText: string;
  headerCounter?: number;
  subHeaderText: string;
  challenges: SimpleChallenge[];
  enableFilterByHub?: boolean;
}

const ChallengesList: FC<ChallengesListProps> = ({
  headerText,
  headerCounter,
  subHeaderText,
  challenges,
  enableFilterByHub = true,
}) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const getCardLabel = useCallback(
    (roles: string[]) => {
      return roles.find(r => r === RoleType.Lead) || roles.find(r => r === RoleType.Member);
    },
    [user]
  );

  return (
    <DashboardGenericSection headerText={headerText} headerCounter={headerCounter} subHeaderText={subHeaderText}>
      {enableFilterByHub && <p>TODO: Filter by hub</p>}
      <CardFilter
        data={challenges}
        valueGetter={simpleChallengeValueGetter}
        tagsValueGetter={simpleChallengeTagsValueGetter}
      >
        {filteredChallenges => (
          <CardsLayoutScroller maxHeight={43} sx={{ marginRight: 0 }}>
            <CardsLayout items={filteredChallenges}>
              {challenge =>
                challenge && (
                  <SearchChallengeCard
                    name={challenge.displayName}
                    tagline={challenge.tagline}
                    image={challenge.imageUrl}
                    matchedTerms={challenge.matchedTerms ?? []}
                    label={getCardLabel(challenge.roles)}
                    url={buildChallengeUrl(challenge.hubNameId, challenge.nameID)}
                    parentName={challenge.hubDisplayName}
                  />
                )
              }
            </CardsLayout>
            {filteredChallenges.length === 0 && <Box>{t('pages.challenge-explorer.search.no-results')}</Box>}
          </CardsLayoutScroller>
        )}
      </CardFilter>
    </DashboardGenericSection>
  );
};

export default ChallengesList;
