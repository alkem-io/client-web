import { Grid, Skeleton } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributionDetailsContainer from '../../ContributionDetails/ContributionDetailsContainer';
import { SpaceHostedItem } from '../../../../journey/utils/SpaceHostedItem';
import { Caption } from '../../../../../core/ui/typography';
import PageContentBlockGrid, { PageContentBlockGridProps } from '../../../../../core/ui/content/PageContentBlockGrid';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ContributionDetailsCard from '../../ContributionDetails/ContributionDetailsCard';
import ScrollableCardsLayoutContainer from '../../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';

interface ContributionViewProps {
  title: string;
  subtitle?: string;
  contributions: SpaceHostedItem[] | undefined;
  loading?: boolean;
  enableLeave?: boolean;
  onLeave?: () => Promise<unknown>;
  cards?: PageContentBlockGridProps['cards'];
}

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
  onLeave,
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
          <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
            {contributions?.map(contributionItem => (
              <ContributionDetailsContainer key={contributionItem.id} entities={contributionItem}>
                {({ details }, { loading, isLeavingCommunity }, { leaveCommunity }) => {
                  if (loading || !details) {
                    return null;
                  }
                  const handleLeaveCommunity = async () => {
                    await leaveCommunity();
                    onLeave?.();
                  };

                  return (
                    <ContributionDetailsCard
                      {...details}
                      enableLeave={enableLeave}
                      leavingCommunity={isLeavingCommunity}
                      handleLeaveCommunity={handleLeaveCommunity}
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
