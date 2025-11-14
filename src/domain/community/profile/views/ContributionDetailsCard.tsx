import { Trans, useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { Close } from '@mui/icons-material';
import SpaceCardBase, { SpaceCardProps } from '@/domain/space/components/cards/SpaceCardBase';
import { BlockTitle, Caption } from '@/core/ui/typography';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import CardActions from '@/core/ui/card/CardActions';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import CardRibbon from '@/core/ui/card/CardRibbon';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import SpaceLeads, { Lead, LeadOrganization } from '@/domain/space/components/cards/components/SpaceLeads';
import StackedAvatar from '@/domain/space/components/cards/components/StackedAvatar';
import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { ParentInfo } from '@/domain/space/components/cards/components/SpaceParentInfo';

interface ContributionDetailsCardProps extends Omit<SpaceCardProps, 'iconComponent' | 'header'> {
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
  avatarUris?: { src: string; alt: string }[];
  leadUsers?: Lead[];
  leadOrganizations?: LeadOrganization[];
  showLeads?: boolean;
  parentInfo?: ParentInfo;
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
  avatarUris,
  leadUsers,
  leadOrganizations,
  showLeads = false,
  parentInfo,
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

  // Show avatarUris as visual in BadgeCardView if provided
  const hasAvatarUris = Boolean(avatarUris && avatarUris.length > 0);
  const visualContent = hasAvatarUris ? <StackedAvatar avatarUris={avatarUris!} /> : undefined;

  // Show leads at the bottom of the card if authenticated
  const hasLeads = Boolean(showLeads && (leadUsers?.length || leadOrganizations?.length));

  return (
    <>
      <SpaceCardBase
        {...props}
        visual={visualContent}
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
                  event.preventDefault();
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
        {hasLeads && (
          <Box sx={{ display: 'flex', alignItems: 'center', paddingTop: gutters(0.5) }}>
            <Caption>Led by:</Caption>
            <SpaceLeads leadUsers={leadUsers} leadOrganizations={leadOrganizations} showLeads={showLeads} />
          </Box>
        )}
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
