import { Box } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CardFilter from '../../../../../common/components/core/card-filter/CardFilter';
import { buildChallengeUrl, buildHubUrl } from '../../../../../common/utils/urlBuilders';
import CheckboxesFilter from '../../../../shared/components/CheckboxesFilter/CheckboxesFilter';
import {
  SimpleChallenge,
  simpleChallengeHubDataGetter,
  simpleChallengeTagsValueGetter,
  simpleChallengeValueGetter,
} from '../../containers/ChallengeExplorerContainer';
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
  enableFilterByHub?: boolean;
}

const ChallengeExplorerListView: FC<ChallengeExplorerListViewProps> = ({
  headerText,
  headerCounter,
  challenges,
  enableFilterByHub = false,
}) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <CheckboxesFilter
        caption={t('pages.challenge-explorer.other.filter-by-hub')}
        enable={enableFilterByHub}
        items={challenges}
        filterableDataGetter={simpleChallengeHubDataGetter}
      >
        {(filterMenu, filteredByHubChallenges) => (
          <>
            <PageContentBlockHeader title={withOptionalCount(headerText, headerCounter)} actions={filterMenu} />
            <CardFilter
              data={filteredByHubChallenges}
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
                          bannerUri={challenge.imageUrl}
                          displayName={challenge.displayName}
                          tags={challenge.tags}
                          tagline={challenge.tagline}
                          vision={challenge.vision}
                          journeyUri={buildChallengeUrl(challenge.hubNameId, challenge.nameID)}
                          hubDisplayName={challenge.hubDisplayName}
                          hubUri={buildHubUrl(challenge.hubNameId)}
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
