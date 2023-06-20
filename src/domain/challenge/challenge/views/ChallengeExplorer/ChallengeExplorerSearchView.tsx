import React, { FC } from 'react';
import GroupBy from '../../../../../common/components/core/GroupBy/GroupBy';
import { SpaceIcon } from '../../../space/icon/SpaceIcon';
import { SimpleChallengeWithSearchTerms } from '../../../../platform/TopLevelPages/TopLevelChallenges/ChallengeExplorerContainer';
import { buildChallengeUrl, buildSpaceUrl } from '../../../../../common/utils/urlBuilders';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { Text } from '../../../../../core/ui/typography/components';
import ChallengeCard from '../../ChallengeCard/ChallengeCard';
import { gutters } from '../../../../../core/ui/grid/utils';
import ScrollableCardsLayout from '../../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import Gutters from '../../../../../core/ui/grid/Gutters';

export type ChallengeExplorerGroupByType = 'space';

export interface ChallengeExplorerSearchViewProps {
  challenges: SimpleChallengeWithSearchTerms[] | undefined;
  groupBy: ChallengeExplorerGroupByType;
  searchTerms: string[] | undefined;
  loading: boolean;
}

const ChallengeExplorerSearchView: FC<ChallengeExplorerSearchViewProps> = ({
  challenges,
  groupBy,
  searchTerms,
  loading,
}) => {
  const { t } = useTranslation();

  const groupKey = getGroupKey(groupBy);

  if (!groupKey) {
    return null;
  }

  return (
    <>
      {challenges && challenges.length > 0 && (
        <GroupBy data={challenges} groupKey={groupKey}>
          {groups => (
            <Gutters disablePadding>
              {groups.map(({ keyValue, values }) => (
                <PageContentBlock key={keyValue}>
                  <PageContentBlockHeader
                    title={
                      <>
                        <SpaceIcon sx={{ verticalAlign: 'bottom' }} /> {values[0].spaceDisplayName}
                      </>
                    }
                  />
                  <Text>{values[0].spaceTagline}</Text>
                  <ScrollableCardsLayout maxHeight={gutters(40)} items={values} cards={false}>
                    {challenge => (
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
                    )}
                  </ScrollableCardsLayout>
                </PageContentBlock>
              ))}
            </Gutters>
          )}
        </GroupBy>
      )}
      {!loading && searchTerms && searchTerms?.length > 0 && !challenges?.length && (
        <Box>{t('pages.challenge-explorer.search.no-results')}</Box>
      )}
      {loading && <Box textAlign="center">{t('common.loading')}</Box>}
    </>
  );
};

export default ChallengeExplorerSearchView;

const getGroupKey = (groupBy: ChallengeExplorerGroupByType): keyof SimpleChallengeWithSearchTerms | undefined => {
  switch (groupBy) {
    case 'space':
      return 'spaceId';
    default:
      return undefined;
  }
};
