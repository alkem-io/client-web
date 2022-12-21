import { Box, Grid, Skeleton, Button, Dialog } from '@mui/material';
import React, { useState } from 'react';
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
import JourneyCardTagline from '../../../../challenge/common/JourneyCard/JourneyCardTagline';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import { DialogTitle, DialogActions, DialogContent } from '../../../../../common/components/core/dialog';

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
  const [leavingCommunityId, setLeavingCommunityId] = useState<string>();

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
              {({ details }, { loading, isLeavingCommunity }, { leaveCommunity }) => {
                const Icon = getIcon(contributionItem);
                if (loading) {
                  return null;
                }
                return (
                  <>
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
                    >
                      <JourneyCardTagline>{details?.descriptionText || ''}</JourneyCardTagline>

                      <Box display="flex" justifyContent="flex-end">
                        <LoadingButton
                          variant="outlined"
                          startIcon={<CloseIcon />}
                          onClick={event => {
                            setLeavingCommunityId(details?.domain?.communityID);
                            event.stopPropagation();
                          }}
                          loading={isLeavingCommunity}
                        >
                          {t('buttons.leave')}
                        </LoadingButton>
                      </Box>
                    </JourneyCard>
                    <Dialog
                      open={leavingCommunityId === details?.domain?.communityID}
                      maxWidth="xs"
                      aria-labelledby="confirm-leave-organization"
                    >
                      <DialogTitle id="confirm-innovation-flow">
                        {t('components.associated-organization.confirmation-dialog.title', {
                          organization: details?.headerText,
                        })}
                      </DialogTitle>
                      <DialogContent sx={{ paddingX: 2 }}>
                        {t('components.associated-organization.confirmation-dialog.text')}
                      </DialogContent>
                      <DialogActions sx={{ justifyContent: 'end' }}>
                        <Button
                          onClick={event => {
                            setLeavingCommunityId(undefined);
                            event.stopPropagation();
                          }}
                        >
                          {t('buttons.cancel')}
                        </Button>

                        <Button
                          onClick={event => {
                            leaveCommunity();
                            setLeavingCommunityId(undefined);
                            event.stopPropagation();
                          }}
                          disabled={loading}
                        >
                          {t('buttons.leave')}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
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
