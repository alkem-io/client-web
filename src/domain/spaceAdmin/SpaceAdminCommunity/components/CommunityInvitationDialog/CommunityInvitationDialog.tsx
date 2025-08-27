import { useCommunityInvitationQuery } from '@/core/apollo/generated/apollo-hooks';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, Text } from '@/core/ui/typography';
import { Identifiable } from '@/core/utils/Identifiable';
import { formatDateTime } from '@/core/utils/time/utils';
import { MembershipType } from '@/domain/access/model/MembershipType';
import { ProfileChip } from '@/domain/community/contributor/ProfileChip/ProfileChip';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface CommunityInvitationDialogProps {
  invitation: Identifiable & { type: MembershipType }; // This dialog handles both normal invitations and platform invitations
  onClose: () => void;
}

export const CommunityInvitationDialog = ({
  invitation: { id: invitationId, type },
  onClose,
}: CommunityInvitationDialogProps) => {
  const { t } = useTranslation();

  const isPlatformInvitation = type === MembershipType.PlatformInvitation;

  const { data, loading } = useCommunityInvitationQuery({
    variables: {
      invitationId,
      isPlatformInvitation,
    },
    skip: !invitationId,
  });
  const invitation = isPlatformInvitation ? data?.lookup.platformInvitation : data?.lookup.invitation;
  const contributor = data?.lookup.invitation?.contributor;

  return (
    <DialogWithGrid open maxWidth="md" fullWidth aria-labelledby="community-invitation-dialog" onClose={onClose}>
      <DialogHeader id="community-invitation-dialog" onClose={onClose}>
        {isPlatformInvitation ? (
          data?.lookup.platformInvitation?.email
        ) : (
          <ProfileChip
            displayName={contributor?.profile.displayName}
            avatarUrl={contributor?.profile.avatar?.uri}
            city={contributor?.profile.location?.city}
            country={contributor?.profile.location?.country}
          />
        )}
      </DialogHeader>
      {!loading && invitation && (
        <Gutters>
          <Text>{t('community.invitations.inviteContributorsDialog.welcomeMessage')}:</Text>
          <Caption>{invitation.welcomeMessage}</Caption>
          {(invitation.createdDate || invitation.updatedDate) && (
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              {invitation.createdDate && (
                <Caption color="neutralMedium" aria-label="Date created">
                  {t('components.application-dialog.created', { date: formatDateTime(invitation.createdDate) })}
                </Caption>
              )}
              {invitation.updatedDate && (
                <Caption color="neutralMedium" aria-label="Date updated">
                  {t('components.application-dialog.updated', { date: formatDateTime(invitation.updatedDate) })}
                </Caption>
              )}
            </Box>
          )}
        </Gutters>
      )}
    </DialogWithGrid>
  );
};
