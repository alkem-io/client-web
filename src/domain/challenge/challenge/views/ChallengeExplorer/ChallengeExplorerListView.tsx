import { Box } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CardFilter from '../../../../../common/components/core/card-filter/CardFilter';
import { buildChallengeUrl, buildHubUrl } from '../../../../../common/utils/urlBuilders';
import CheckboxesFilter from '../../../../shared/components/CheckboxesFilter/CheckboxesFilter';
import CardsLayout from '../../../../../core/ui/card/CardsLayout/CardsLayout';
import CardsLayoutScroller from '../../../../../core/ui/card/CardsLayout/CardsLayoutScroller';
import {
  SimpleChallenge,
  simpleChallengeValueGetter,
  simpleChallengeTagsValueGetter,
  simpleChallengeHubDataGetter,
} from '../../containers/ChallengeExplorerContainer';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { Text } from '../../../../../core/ui/typography';
import withOptionalCount from '../../../../shared/utils/withOptionalCount';
import ChallengeExploreCard from '../../../common/ChallengeExploreCard/ChallengeExploreCard';
export interface ChallengeExplorerListViewProps {
  headerText: string;
  headerCounter?: number;
  subHeaderText: string;
  challenges: SimpleChallenge[];
  enableFilterByHub?: boolean;
}

const ChallengeExplorerListView: FC<ChallengeExplorerListViewProps> = ({
  headerText,
  headerCounter,
  subHeaderText,
  challenges,
  enableFilterByHub = false,
}) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={withOptionalCount(headerText, headerCounter)} />
      <Text>{subHeaderText}</Text>
      <CheckboxesFilter
        caption={t('pages.challenge-explorer.other.filter-by-hub')}
        enable={enableFilterByHub}
        items={challenges}
        filterableDataGetter={simpleChallengeHubDataGetter}
        sx={{ top: theme => theme.spacing(-8) }}
      >
        {filteredByHubChallenges => (
          <CardFilter
            data={filteredByHubChallenges}
            valueGetter={simpleChallengeValueGetter}
            tagsValueGetter={simpleChallengeTagsValueGetter}
            keepOpen={false}
          >
            {filteredChallenges => (
              <CardsLayoutScroller maxHeight={374} sx={{ marginRight: 0 }}>
                <CardsLayout items={filteredChallenges}>
                  {challenge =>
                    challenge && (
                      <ChallengeExploreCard
                        bannerUri={challenge.imageUrl}
                        displayName={challenge.displayName}
                        tags={challenge.matchedTerms ?? []}
                        tagline={challenge.tagline}
                        vision={''}
                        journeyUri={buildChallengeUrl(challenge.hubNameId, challenge.nameID)}
                        hubUri={buildHubUrl(challenge.hubNameId)}
                        hubDisplayName={challenge.hubDisplayName}
                        challengeId={challenge.id}
                      />
                    )
                  }
                </CardsLayout>
                {filteredChallenges.length === 0 && <Box>{t('pages.challenge-explorer.search.no-results')}</Box>}
              </CardsLayoutScroller>
            )}
          </CardFilter>
        )}
      </CheckboxesFilter>
    </PageContentBlock>
  );
};

export default ChallengeExplorerListView;
