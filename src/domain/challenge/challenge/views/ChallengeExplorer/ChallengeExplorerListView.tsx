import { Box } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CardFilter from '../../../../../common/components/core/card-filter/CardFilter';
import { buildChallengeUrl, buildSpaceUrl } from '../../../../../common/utils/urlBuilders';
import CheckboxesFilter from '../../../../shared/components/CheckboxesFilter/CheckboxesFilter';
import {
  SimpleChallenge,
  simpleChallengeSpaceDataGetter,
  simpleChallengeTagsValueGetter,
  simpleChallengeValueGetter,
} from '../../../../platform/TopLevelPages/TopLevelChallenges/ChallengeExplorerContainer';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import withOptionalCount from '../../../../shared/utils/withOptionalCount';
import ChallengeCard from '../../ChallengeCard/ChallengeCard';
import ScrollableCardsLayout from '../../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
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
            <CardFilter
              data={filteredBySpaceChallenges}
              valueGetter={simpleChallengeValueGetter}
              tagsValueGetter={simpleChallengeTagsValueGetter}
              keepOpen={false}
            >
              {filteredChallenges =>
                filteredChallenges.length === 0 ? (
                  <Box>{t('pages.challenge-explorer.search.no-results')}</Box>
                ) : (
                  <ScrollableCardsLayout items={filteredChallenges} maxHeight={gutters(30)} cards={false}>
                    {challenge =>
                      challenge && (
                        <ChallengeCard
                          challengeId={challenge.id}
                          challengeNameId={challenge.nameID}
                          banner={challenge.banner}
                          displayName={challenge.displayName}
                          tags={challenge.tags}
                          tagline={challenge.tagline}
                          vision={challenge.vision}
                          journeyUri={buildChallengeUrl(challenge.spaceNameId, challenge.nameID)}
                          spaceDisplayName={challenge.spaceDisplayName}
                          spaceUri={buildSpaceUrl(challenge.spaceNameId)}
                          spaceVisibility={challenge.spaceVisibility}
                          hideJoin
                        />
                      )
                    }
                  </ScrollableCardsLayout>
                )
              }
            </CardFilter>
          </>
        )}
      </CheckboxesFilter>
    </PageContentBlock>
  );
};

export default ChallengeExplorerListView;
