import { Grid, Skeleton } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ContributionDetailsContainer from '../../ContributionDetailsContainer/ContributionDetailsContainer';
import { ContributionItem } from '../../../contributor/contribution';
import JourneyCard from '../../../../challenge/common/JourneyCard/JourneyCard';
import { OpportunityIcon } from '../../../../challenge/opportunity/icon/OpportunityIcon';
import { ChallengeIcon } from '../../../../challenge/challenge/icon/ChallengeIcon';
import { HubIcon } from '../../../../challenge/hub/icon/HubIcon';
import { BlockTitle, Caption } from '../../../../../core/ui/typography';
import webkitLineClamp from '../../../../../core/ui/utils/webkitLineClamp';
import PageContentBlockGrid from '../../../../../core/ui/content/PageContentBlockGrid';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';

export interface ContributionViewProps {
  title: string;
  subtitle?: string;
  helpText?: string; // TODO it's unused: either find a way to use or remove
  contributions: ContributionItem[];
  loading?: boolean;
}

const getContributionItemKey = ({ hubId, challengeId, opportunityId }: ContributionItem) =>
  [hubId, challengeId, opportunityId].filter(id => id).join('/');

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

const getIcon = ({ challengeId, opportunityId }: ContributionItem) => {
  if (opportunityId) {
    return OpportunityIcon;
  }
  if (challengeId) {
    return ChallengeIcon;
  }
  return HubIcon;
};

export const ContributionsView = ({ title, subtitle, contributions, loading }: ContributionViewProps) => {
  const { t } = useTranslation();
  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      {subtitle && <Caption>{subtitle}</Caption>}
      <PageContentBlockGrid disablePadding>
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}
        {!loading &&
          contributions.map(contributionItem => (
            <ContributionDetailsContainer key={getContributionItemKey(contributionItem)} entities={contributionItem}>
              {({ details }, { loading }) => {
                const Icon = getIcon(contributionItem);
                if (loading) {
                  return null;
                }
                return (
                  <JourneyCard
                    bannerUri={details?.mediaUrl!}
                    iconComponent={Icon}
                    header={
                      <BlockTitle component="div" sx={webkitLineClamp(2)}>
                        {details?.headerText}
                      </BlockTitle>
                    }
                    tagline={details?.descriptionText!}
                    tags={details?.tags ?? []}
                    journeyUri={details?.url!}
                  />
                );
              }}
            </ContributionDetailsContainer>
          ))}
        {!contributions.length && (
          <Grid item flexGrow={1} flexBasis={'50%'}>
            {t('contributions-view.no-data', { name: title })}
          </Grid>
        )}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default ContributionsView;
