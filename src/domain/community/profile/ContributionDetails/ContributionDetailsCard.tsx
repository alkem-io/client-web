import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
import JourneyCard, { JourneyCardProps } from '@/domain/journey/common/JourneyCard/JourneyCard';
import { BlockTitle } from '@/core/ui/typography';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import CardActions from '@/core/ui/card/CardActions';
import JourneyCardTagline from '@/domain/journey/common/JourneyCard/JourneyCardTagline';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';
import spaceIcon from '@/domain/shared/components/JourneyIcon/JourneyIcon';
import CardRibbon from '@/core/ui/card/CardRibbon';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

interface ContributionDetailsCardProps extends Omit<JourneyCardProps, 'iconComponent' | 'header'> {
  tagline: string;
  journeyTypeName: JourneyTypeName;
  displayName: string;
  enableLeave?: boolean;
  leavingCommunityDialogOpen?: boolean;
  leavingCommunity?: boolean;
  onLeaveCommunityDialogOpen?: (isOpen: boolean) => void;
  handleLeaveCommunity?: () => void;
  loading?: boolean;
  visibility?: SpaceVisibility;
}

const ContributionDetailsCard = ({
  displayName,
  tagline,
  journeyTypeName,
  enableLeave,
  leavingCommunityDialogOpen = false,
  leavingCommunity,
  onLeaveCommunityDialogOpen,
  handleLeaveCommunity,
  loading,
  visibility,
  ...props
}: ContributionDetailsCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    visibility && visibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${visibility}` as const)} />
    ) : undefined;

  return (
    <>
      <JourneyCard
        {...props}
        iconComponent={spaceIcon[journeyTypeName]}
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
        bannerOverlay={ribbon}
      >
        <JourneyCardTagline>{tagline}</JourneyCardTagline>
      </JourneyCard>
      {enableLeave && (
        <Dialog open={leavingCommunityDialogOpen} maxWidth="xs" aria-labelledby="confirm-leave-organization">
          <DialogHeader onClose={() => onLeaveCommunityDialogOpen?.(false)}>
            {t('components.associated-organization.confirmation-dialog.title', {
              organization: displayName,
            })}
          </DialogHeader>
          <DialogContent sx={{ paddingX: 2 }}>
            {t('components.associated-organization.confirmation-dialog.text')}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
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
