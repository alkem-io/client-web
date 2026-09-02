import { useCommunityApplicationQuery, useCommunityInvitationQuery } from '@/core/apollo/generated/apollo-hooks';
import type { MembershipDetailDialogProps } from '@/crd/components/space/settings/MembershipDetailDialog';
import { MembershipDetailDialog } from '@/crd/components/space/settings/MembershipDetailDialog';
import type { PendingMembershipType } from '@/crd/components/space/settings/PendingMembershipsTable';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export type ViewingMembership = { id: string; type: PendingMembershipType };

type MembershipDetailDialogConnectorProps = {
  /** The membership whose detail to view, or `null` when the dialog is closed. */
  membership: ViewingMembership | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Fetches the application / invitation detail (questions+answers or welcome message) on demand and
 * maps it onto the presentational `MembershipDetailDialog`. Reuses the same detail queries the legacy
 * MUI dialogs use (`CommunityApplication` / `CommunityInvitation`) — the list query never carries this
 * data, so it's fetched only when the admin opens the dialog.
 */
export function MembershipDetailDialogConnector({ membership, onOpenChange }: MembershipDetailDialogConnectorProps) {
  const open = membership !== null;
  const isApplication = membership?.type === 'application';
  const isPlatform = membership?.type === 'platformInvitation';
  const isInvitationLike = membership?.type === 'invitation' || isPlatform;

  const applicationResult = useCommunityApplicationQuery({
    variables: { applicationId: membership?.id ?? '' },
    skip: !open || !isApplication,
  });
  const invitationResult = useCommunityInvitationQuery({
    variables: { invitationId: membership?.id ?? '', isPlatformInvitation: Boolean(isPlatform) },
    skip: !open || !isInvitationLike,
  });

  const detailProps = ((): Omit<MembershipDetailDialogProps, 'open' | 'onOpenChange'> => {
    if (isApplication) {
      const application = applicationResult.data?.lookup.application;
      const profile = application?.actor.profile;
      return {
        kind: 'application',
        loading: applicationResult.loading,
        displayName: profile?.displayName,
        avatarUrl: profile?.avatar?.uri,
        avatarColor: pickColorFromId(application?.actor.id ?? membership?.id ?? ''),
        city: profile?.location?.city,
        country: profile?.location?.country,
        createdDate: application?.createdDate,
        updatedDate: application?.updatedDate,
        questions: application?.questions.map(q => ({ id: q.id, question: q.name, answer: q.value })),
      };
    }
    if (isPlatform) {
      const platformInvitation = invitationResult.data?.lookup.platformInvitation;
      return {
        kind: 'invitation',
        loading: invitationResult.loading,
        email: platformInvitation?.email,
        createdDate: platformInvitation?.createdDate,
        updatedDate: platformInvitation?.updatedDate,
        welcomeMessage: platformInvitation?.welcomeMessage,
      };
    }
    const invitation = invitationResult.data?.lookup.invitation;
    const profile = invitation?.actor.profile;
    return {
      kind: 'invitation',
      loading: invitationResult.loading,
      displayName: profile?.displayName,
      avatarUrl: profile?.avatar?.uri,
      avatarColor: pickColorFromId(invitation?.actor.id ?? membership?.id ?? ''),
      city: profile?.location?.city,
      country: profile?.location?.country,
      createdDate: invitation?.createdDate,
      updatedDate: invitation?.updatedDate,
      welcomeMessage: invitation?.welcomeMessage,
    };
  })();

  return <MembershipDetailDialog open={open} onOpenChange={onOpenChange} {...detailProps} />;
}
