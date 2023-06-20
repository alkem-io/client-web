import React, { FC } from 'react';
import GroupBy from '../../../../../common/components/core/GroupBy/GroupBy';
import { HubIcon } from '../../../hub/icon/HubIcon';
import { SimpleChallengeWithSearchTerms } from '../../../../platform/TopLevelPages/TopLevelChallenges/ChallengeExplorerContainer';
import { buildChallengeUrl, buildHubUrl } from '../../../../../common/utils/urlBuilders';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { Text } from '../../../../../core/ui/typography/components';
import ChallengeCard from '../../ChallengeCard/ChallengeCard';
import { gutters } from '../../../../../core/ui/grid/utils';
import ScrollableCardsLayoutContainer from '../../../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import Gutters from '../../../../../core/ui/grid/Gutters';

export type ChallengeExplorerGroupByType = 'hub';

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
                        <HubIcon sx={{ verticalAlign: 'bottom' }} /> {values[0].hubDisplayName}
                      </>
                    }
                  />
                  <Text>{values[0].hubTagline}</Text>
                  <ScrollableCardsLayoutContainer maxHeight={gutters(40)}>
                    {values.map(challenge => (
                      <ChallengeCard
                        challengeId={challenge.id}
                        challengeNameId={challenge.nameID}
                        banner={challenge.banner}
                        displayName={challenge.displayName}
                        tags={challenge.tags}
                        tagline={challenge.tagline}
                        vision={challenge.vision}
                        journeyUri={buildChallengeUrl(challenge.hubNameId, challenge.nameID)}
                        hubDisplayName={challenge.hubDisplayName}
                        hubUri={buildHubUrl(challenge.hubNameId)}
                        hubVisibility={challenge.hubVisibility}
                        hideJoin
                      />
                    ))}
                  </ScrollableCardsLayoutContainer>
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
    case 'hub':
      return 'hubId';
    default:
      return undefined;
  }
};
