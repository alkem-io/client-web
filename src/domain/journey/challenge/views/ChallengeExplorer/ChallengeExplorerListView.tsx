import { Box } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ChallengeExplorerCardFilter from './ChallengeExplorerCardFilter';
import CheckboxesFilter from '../../../../shared/components/CheckboxesFilter/CheckboxesFilter';
import {
  SimpleChallenge,
  simpleChallengeSpaceDataGetter,
  simpleChallengeTagsValueGetter,
  simpleChallengeValueGetter,
} from '../../../../../main/topLevelPages/TopLevelChallenges/ChallengeExplorerContainer';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import withOptionalCount from '../../../../shared/utils/withOptionalCount';
import ChallengeCard from '../../ChallengeCard/ChallengeCard';
import ScrollableCardsLayoutContainer from '../../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { gutters } from '../../../../../core/ui/grid/utils';

export interface ChallengeExplorerListViewProps {
  headerText: string;
  headerCounter?: number;
  challenges: SimpleChallenge[];
  enableFilterBySpace?: boolean;
}

const ChallengeExplorerListView: FC<ChallengeExplorerListViewProps> = ({
  headerText,
  headerCounter,
  challenges,
  enableFilterBySpace = false,
}) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <CheckboxesFilter
        caption={t('pages.challenge-explorer.other.filter-by-space')}
        enable={enableFilterBySpace}
        items={challenges}
        filterableDataGetter={simpleChallengeSpaceDataGetter}
      >
        {(filterMenu, filteredBySpaceChallenges) => (
          <>
            <PageContentBlockHeader title={withOptionalCount(headerText, headerCounter)} actions={filterMenu} />
            <ChallengeExplorerCardFilter
              data={filteredBySpaceChallenges}
              valueGetter={simpleChallengeValueGetter}
              tagsValueGetter={simpleChallengeTagsValueGetter}
              keepOpen={false}
            >
              {filteredChallenges =>
                filteredChallenges.length === 0 ? (
                  <Box>{t('pages.challenge-explorer.search.no-results')}</Box>
                ) : (
                  <ScrollableCardsLayoutContainer maxHeight={gutters(30)}>
                    {filteredChallenges.map(challenge => (
                      <ChallengeCard
                        key={challenge.id}
                        challengeId={challenge.id}
                        banner={challenge.banner}
                        displayName={challenge.displayName}
                        tags={challenge.tags}
                        tagline={challenge.tagline}
                        vision={challenge.vision}
                        journeyUri={challenge.profile.url}
                        spaceDisplayName={challenge.spaceDisplayName}
                        spaceUri={challenge.spaceUrl}
                        spaceVisibility={challenge.spaceVisibility}
                        member={challenge.member}
                        hideJoin
                      />
                    ))}
                  </ScrollableCardsLayoutContainer>
                )
              }
            </ChallengeExplorerCardFilter>
          </>
        )}
      </CheckboxesFilter>
    </PageContentBlock>
  );
};

export default ChallengeExplorerListView;
