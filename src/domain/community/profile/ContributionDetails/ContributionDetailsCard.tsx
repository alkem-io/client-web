import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import JourneyCard, { JourneyCardProps } from '../../../challenge/common/JourneyCard/JourneyCard';
import { BlockTitle } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardTagline from '../../../challenge/common/JourneyCard/JourneyCardTagline';
import { DialogActions, DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';

interface ContributionDetailsCardProps extends Omit<JourneyCardProps, 'iconComponent' | 'header'> {
  journeyTypeName: JourneyTypeName;
  displayName: string;
  enableLeave?: boolean;
  leavingCommunityDialogOpen?: boolean;
  leavingCommunity?: boolean;
  onLeaveCommunityDialogOpen?: (isOpen: boolean) => void;
  handleLeaveCommunity?: () => void;
  loading?: boolean;
}

const ContributionDetailsCard = ({
  bannerUri,
  displayName,
  tagline,
  journeyTypeName,
  enableLeave,
  leavingCommunityDialogOpen = false,
  leavingCommunity,
  onLeaveCommunityDialogOpen,
  handleLeaveCommunity,
  loading,
  ...props
}: ContributionDetailsCardProps) => {
  const { t } = useTranslation();

  return (
    <>
      <JourneyCard
        {...props}
        bannerUri={bannerUri}
        tagline={tagline}
        iconComponent={journeyIcon[journeyTypeName]}
        header={
          <BlockTitle component="div" sx={webkitLineClamp(2)}>
            {displayName}
          </BlockTitle>
        }
        actions={
          enableLeave && (
            <CardActions justifyContent="end" flexBasis="100%">
              <LoadingButton
                variant="outlined"
                startIcon={<Close />}
                onClick={event => {
                  onLeaveCommunityDialogOpen?.(true);
                  event.stopPropagation();
                }}
                loading={leavingCommunity}
              >
                {t('buttons.leave')}
              </LoadingButton>
            </CardActions>
          )
        }
      >
        <JourneyCardTagline>{tagline}</JourneyCardTagline>
      </JourneyCard>
      {enableLeave && (
        <Dialog open={leavingCommunityDialogOpen} maxWidth="xs" aria-labelledby="confirm-leave-organization">
          <DialogTitle id="confirm-innovation-flow">
            {t('components.associated-organization.confirmation-dialog.title', {
              organization: displayName,
            })}
          </DialogTitle>
          <DialogContent sx={{ paddingX: 2 }}>
            {t('components.associated-organization.confirmation-dialog.text')}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'end' }}>
            <Button
              onClick={event => {
                onLeaveCommunityDialogOpen?.(false);
                event.stopPropagation();
              }}
            >
              {t('buttons.cancel')}
            </Button>

            <Button
              onClick={event => {
                handleLeaveCommunity?.();
                onLeaveCommunityDialogOpen?.(false);
                event.stopPropagation();
              }}
              disabled={loading}
            >
              {t('buttons.leave')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ContributionDetailsCard;
