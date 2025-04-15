import { Trans, useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { Close } from '@mui/icons-material';
import SpaceCardBase, { SpaceCard2Props } from '@/domain/space/components/cards/SpaceCardBase';
import { BlockTitle, Caption } from '@/core/ui/typography';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import CardActions from '@/core/ui/card/CardActions';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import CardRibbon from '@/core/ui/card/CardRibbon';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { spaceIconByLevel } from '@/domain/space/icons/SpaceIconByLevel';

interface ContributionDetailsCardProps extends Omit<SpaceCard2Props, 'iconComponent' | 'header'> {
  tagline: string;
  displayName: string;
  enableLeave?: boolean;
  leavingCommunityDialogOpen?: boolean;
  leavingCommunity?: boolean;
  onLeaveCommunityDialogOpen?: (isOpen: boolean) => void;
  handleLeaveCommunity?: () => void;
  loading?: boolean;
  visibility?: SpaceVisibility;
  level: SpaceLevel;
}

const ContributionDetailsCard = ({
  displayName,
  tagline,
  enableLeave,
  leavingCommunityDialogOpen = false,
  leavingCommunity,
  onLeaveCommunityDialogOpen,
  handleLeaveCommunity,
  loading,
  visibility,
  level,
  ...props
}: ContributionDetailsCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    visibility && visibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${visibility}` as const)} />
    ) : undefined;

  const leaveCommunityDialogTitle =
    level === SpaceLevel.L0
      ? t('pages.user-profile.membership.space.confirmation-dialog.title', {
          space: displayName,
        })
      : t('pages.user-profile.membership.subspace.confirmation-dialog.title', {
          space: displayName,
        });
  const leaveCommunityDialogTextKey =
    level === SpaceLevel.L0
      ? 'pages.user-profile.membership.space.confirmation-dialog.text'
      : 'pages.user-profile.membership.subspace.confirmation-dialog.text';

  return (
    <>
      <SpaceCardBase
        {...props}
        iconComponent={spaceIconByLevel[level || SpaceLevel.L0]}
        header={
          <BlockTitle component="div" sx={webkitLineClamp(2)}>
            {displayName}
          </BlockTitle>
        }
        actions={
          enableLeave && (
            <CardActions justifyContent="end" flexBasis="100%">
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={event => {
                  onLeaveCommunityDialogOpen?.(true);
                  event.stopPropagation();
                }}
                loading={leavingCommunity}
              >
                {t('buttons.leave')}
              </Button>
            </CardActions>
          )
        }
        bannerOverlay={ribbon}
      >
        <SpaceCardTagline>{tagline}</SpaceCardTagline>
      </SpaceCardBase>
      {enableLeave && (
        <Dialog open={leavingCommunityDialogOpen} maxWidth="xs" aria-label="confirm-leave-space">
          <DialogHeader onClose={() => onLeaveCommunityDialogOpen?.(false)}>{leaveCommunityDialogTitle}</DialogHeader>
          <DialogContent sx={{ paddingX: 2 }}>
            <Caption>
              <Trans
                i18nKey={leaveCommunityDialogTextKey}
                components={{
                  b: <strong />,
                  br: <br />,
                }}
                values={{ space: displayName }}
              />
            </Caption>
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
