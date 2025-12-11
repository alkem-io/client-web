import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import useContributionProvider, {
  ContributionDetails,
} from '../../profile/useContributionProvider/useContributionProvider';
import { useState } from 'react';
import { collectSubspaceAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { Close } from '@mui/icons-material';
import CardActions from '@/core/ui/card/CardActions';
import { Trans, useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Caption } from '@/core/ui/typography';
import { CommunityMembershipStatus, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useParentSpaceInfo } from '@/domain/space/components/cards/utils/useParentSpaceInfo';

export type ContributionCardProps = {
  onLeave?: () => Promise<unknown>;
  enableLeave?: boolean;
  onContributionClick?: (event: React.MouseEvent<Element, MouseEvent>, contribution: ContributionDetails) => void;
  contributionItem: SpaceHostedItem;
};

const ContributionCard = ({ contributionItem, onLeave, enableLeave, onContributionClick }: ContributionCardProps) => {
  const [leavingRoleSetId, setLeavingRoleSetId] = useState<string>();
  const { isAuthenticated } = useCurrentUserContext();
  const { t } = useTranslation();

  const { details, loading, isLeavingCommunity, leaveCommunity } = useContributionProvider({
    spaceHostedItem: contributionItem,
  });

  // Fetch parent space info if this is a subspace
  const { parentInfo, parentAvatarUri, parentDisplayName } = useParentSpaceInfo(contributionItem.parentSpaceId);

  if (loading || !details) {
    return null;
  }

  const handleLeaveCommunity = async () => {
    await leaveCommunity();
    onLeave?.();
  };

  const leavingCommunityDialogOpen = !!leavingRoleSetId && leavingRoleSetId === details.roleSetId;

  const leaveCommunityDialogTitle =
    details.level === SpaceLevel.L0
      ? t('pages.user-profile.membership.space.confirmation-dialog.title', {
          space: details.about.profile.displayName,
        })
      : t('pages.user-profile.membership.subspace.confirmation-dialog.title', {
          space: details.about.profile.displayName,
        });

  const leaveCommunityDialogTextKey =
    details.level === SpaceLevel.L0
      ? 'pages.user-profile.membership.space.confirmation-dialog.text'
      : 'pages.user-profile.membership.subspace.confirmation-dialog.text';

  return (
    <>
      <SpaceCard
        spaceId={details.id}
        displayName={details.about.profile.displayName}
        tagline={details.about.profile.tagline ?? ''}
        banner={details.about.profile.cardBanner}
        tags={details.about.profile.tagset?.tags}
        spaceUri={details.about.profile.url}
        spaceVisibility={undefined}
        level={details.level}
        member={details.about.membership?.myMembershipStatus === CommunityMembershipStatus.Member}
        isPrivate={!details.about.isContentPublic}
        avatarUris={collectSubspaceAvatars(details, parentAvatarUri, parentDisplayName)}
        parentInfo={parentInfo}
        leadUsers={details.about.membership?.leadUsers}
        leadOrganizations={details.about.membership?.leadOrganizations}
        showLeads={isAuthenticated}
        actions={
          enableLeave && (
            <CardActions justifyContent="end" flexBasis="100%">
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={event => {
                  setLeavingRoleSetId(details.roleSetId);
                  event.stopPropagation();
                  event.preventDefault();
                }}
                loading={isLeavingCommunity}
              >
                {t('buttons.leave')}
              </Button>
            </CardActions>
          )
        }
        {...(onContributionClick
          ? { onClick: event => onContributionClick(event, details) }
          : details.about.profile.url
            ? { to: details.about.profile.url }
            : {})}
      />
      {enableLeave && (
        <Dialog open={leavingCommunityDialogOpen} maxWidth="xs" aria-label="confirm-leave-space">
          <DialogHeader onClose={() => setLeavingRoleSetId(undefined)}>{leaveCommunityDialogTitle}</DialogHeader>
          <DialogContent sx={{ paddingX: 2 }}>
            <Caption>
              <Trans
                i18nKey={leaveCommunityDialogTextKey}
                components={{
                  b: <strong />,
                  br: <br />,
                }}
                values={{ space: details.about.profile.displayName }}
              />
            </Caption>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={event => {
                setLeavingRoleSetId(undefined);
                event.stopPropagation();
              }}
            >
              {t('buttons.cancel')}
            </Button>
            <Button
              onClick={event => {
                handleLeaveCommunity();
                setLeavingRoleSetId(undefined);
                event.stopPropagation();
              }}
            >
              {t('buttons.leave')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ContributionCard;
