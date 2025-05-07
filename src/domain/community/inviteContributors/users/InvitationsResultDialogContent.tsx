import { useTranslation } from 'react-i18next';
import { RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import { Box, DialogContent } from '@mui/material';
import ContributorChip from '../components/ContributorChip/ContributorChip';
import { ContributorSelectorType } from '../components/FormikContributorsSelectorField/FormikContributorsSelectorField.models';
import { gutters } from '@/core/ui/grid/utils';

interface InvitationsResultDialogContentProps {
  invitationsResults: InvitationResultModel[];
}

const InvitationsResultDialogContent = ({ invitationsResults }: InvitationsResultDialogContentProps) => {
  const { t } = useTranslation();

  const { successfulInvitations, failedInvitations } = invitationsResults.reduce(
    (acc, invite) => {
      if (
        invite.type === RoleSetInvitationResultType.InvitedToRoleSet ||
        invite.type === RoleSetInvitationResultType.InvitedToPlatformAndRoleSet
      ) {
        acc.successfulInvitations.push(invite);
      } else {
        acc.failedInvitations.push(invite);
      }
      return acc;
    },
    { successfulInvitations: [] as InvitationResultModel[], failedInvitations: [] as InvitationResultModel[] }
  );

  return (
    <DialogContent>
      <Gutters disablePadding>
        <Caption>{t('community.invitations.inviteContributorsDialog.users.success')}</Caption>
        <Box display="flex" flexDirection="row" flexWrap="wrap" gap={gutters()}>
          {successfulInvitations.map(invite =>
            invite.invitation ? (
              <ContributorChip
                key={invite.invitation.id}
                contributor={{
                  type: ContributorSelectorType.User,
                  id: invite.invitation.contributor.id,
                  displayName: invite.invitation.contributor.profile.displayName,
                }}
              />
            ) : invite.platformInvitation ? (
              <ContributorChip
                key={invite.platformInvitation.id}
                contributor={{
                  type: ContributorSelectorType.Email,
                  email: invite.platformInvitation.email,
                }}
              />
            ) : undefined
          )}
        </Box>
        <Caption>{t('community.invitations.inviteContributorsDialog.users.failure')}</Caption>
        <ul>
          {failedInvitations.map(invite =>
            invite.invitation ? (
              <li key={invite.invitation.id}>
                <Caption display="inline">{invite.invitation.contributor.profile.displayName}</Caption>
                <CaptionSmall marginLeft={gutters()} display="inline">
                  {t(`community.invitations.inviteContributorsDialog.users.results.${invite.type}`)}
                </CaptionSmall>
              </li>
            ) : invite.platformInvitation ? (
              <li key={invite.platformInvitation.id}>
                <Caption display="inline">{invite.platformInvitation.email}</Caption>
                <CaptionSmall marginLeft={gutters()} display="inline">
                  {t(`community.invitations.inviteContributorsDialog.users.results.${invite.type}`)}
                </CaptionSmall>
              </li>
            ) : undefined
          )}
        </ul>
      </Gutters>
    </DialogContent>
  );
};

export default InvitationsResultDialogContent;
