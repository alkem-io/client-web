import { Grid, Skeleton } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributionDetailsContainer from '../../ContributionDetails/ContributionDetailsContainer';
import { ContributionItem } from '../../../user/contribution';
import { Caption } from '../../../../../core/ui/typography';
import PageContentBlockGrid, { PageContentBlockGridProps } from '../../../../../core/ui/content/PageContentBlockGrid';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ContributionDetailsCard from '../../ContributionDetails/ContributionDetailsCard';
import ScrollableCardsLayoutContainer from '../../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';

interface ContributionViewProps {
  title: string;
  subtitle?: string;
  helpText?: string; // TODO it's unused: either find a way to use or remove
  contributions: ContributionItem[] | undefined;
  loading?: boolean;
  enableLeave?: boolean;
  cards?: PageContentBlockGridProps['cards'];
}

const getContributionItemKey = ({ spaceId, subspaceId: challengeId, subsubspaceId: opportunityId }: ContributionItem) =>
  [spaceId, challengeId, opportunityId].filter(id => id).join('/');

const SkeletonItem = () => (
  <Grid item>
    <Skeleton
      variant="rectangular"
      sx={{
        height: theme => theme.spacing(theme.cards.contributionCard.height / 2),
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
  </Grid>
);

export const ContributionsView = ({
  title,
  subtitle,
  contributions,
  loading,
  enableLeave,
  cards,
}: ContributionViewProps) => {
  const { t } = useTranslation();
  const [leavingCommunityId, setLeavingCommunityId] = useState<string>();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      {subtitle && <Caption>{subtitle}</Caption>}
      <PageContentBlockGrid disablePadding cards={cards}>
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}
        {!loading && (
          <ScrollableCardsLayoutContainer>
            {contributions?.map(contributionItem => (
              <ContributionDetailsContainer key={getContributionItemKey(contributionItem)} entities={contributionItem}>
                {({ details }, { loading, isLeavingCommunity }, { leaveCommunity }) => {
                  if (loading || !details) {
                    return null;
                  }
                  return (
                    <ContributionDetailsCard
                      {...details}
                      enableLeave={enableLeave}
                      leavingCommunity={isLeavingCommunity}
                      handleLeaveCommunity={leaveCommunity}
                      leavingCommunityDialogOpen={leavingCommunityId === details?.communityId}
                      onLeaveCommunityDialogOpen={isOpen =>
                        setLeavingCommunityId(isOpen ? details?.communityId : undefined)
                      }
                    />
                  );
                }}
              </ContributionDetailsContainer>
            ))}
          </ScrollableCardsLayoutContainer>
        )}
        {!loading && !contributions?.length && (
          <Grid item flexGrow={1} flexBasis={'50%'}>
            {t('contributions-view.no-data', { name: title })}
          </Grid>
        )}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default ContributionsView;
