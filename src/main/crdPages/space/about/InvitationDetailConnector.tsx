import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { ReferencesAndTagsStrip } from '@/crd/components/callout/ReferencesAndTagsStrip';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { InvitationDetailDialog } from '@/crd/components/dashboard/InvitationDetailDialog';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import { useInvitationHydrator } from '@/domain/community/pendingMembership/PendingMemberships';
import type { PendingInvitationItem } from '@/domain/community/user/models/PendingInvitationItem';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import { mapHydratedInvitationToDetailData } from '@/main/crdPages/dashboard/pendingMembershipsDataMappers';

type InvitationDetailConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: PendingInvitationItem | undefined;
};

export function InvitationDetailConnector({ open, onOpenChange, invitation }: InvitationDetailConnectorProps) {
  const { t } = useTranslation('crd-dashboard');
  const { t: tMain, i18n } = useTranslation();

  const close = () => onOpenChange(false);

  const { invitation: hydrated, communityGuidelines } = useInvitationHydrator(invitation, {
    withCommunityGuidelines: true,
  });

  const props = useInvitationActions({
    onAccept: close,
    onReject: close,
    spaceId: invitation?.spacePendingMembershipInfo.id,
  });

  if (!hydrated) {
    return null;
  }

  const isVC = hydrated.invitation.actor?.type === ActorType.VirtualContributor;

  const title = isVC
    ? tMain('community.pendingMembership.invitationDialog.vc.title', {
        space: hydrated.space.about.profile.displayName,
      })
    : tMain('community.pendingMembership.invitationDialog.title', {
        space: hydrated.space.about.profile.displayName,
      });

  const acceptLabel = isVC ? t('pendingMemberships.detail.accept') : t('pendingMemberships.detail.join');
  const rejectLabel = t('pendingMemberships.detail.reject');

  const detailData = mapHydratedInvitationToDetailData(hydrated, i18n.language);

  const descriptionSlot = (
    <div className="text-caption text-muted-foreground">
      <DetailedActivityDescription
        i18nKey="community.pendingMembership.invitationCardTitle"
        spaceDisplayName={hydrated.space.about.profile.displayName}
        spaceUrl={hydrated.space.about.profile.url}
        spaceLevel={hydrated.space.level}
        createdDate={hydrated.invitation.createdDate}
        author={{ displayName: hydrated.userDisplayName }}
        type={hydrated.invitation.actor?.type}
      />
    </div>
  );

  const welcomeMessageSlot = hydrated.invitation.welcomeMessage ? (
    <p className="text-body">{hydrated.invitation.welcomeMessage}</p>
  ) : undefined;

  const guidelinesSlot = communityGuidelines ? (
    <>
      <h3 className="text-card-title pt-2">{communityGuidelines.profile.displayName}</h3>
      <div className="flex flex-col gap-2">
        <div className="break-words">
          <MarkdownContent content={communityGuidelines.profile.description ?? ''} />
        </div>
        <ReferencesAndTagsStrip references={communityGuidelines.profile.references} />
      </div>
    </>
  ) : undefined;

  return (
    <InvitationDetailDialog
      open={open}
      onClose={close}
      onBack={close}
      invitation={detailData}
      title={title}
      acceptLabel={acceptLabel}
      rejectLabel={rejectLabel}
      descriptionSlot={descriptionSlot}
      welcomeMessageSlot={welcomeMessageSlot}
      guidelinesSlot={guidelinesSlot}
      onAccept={() => props.acceptInvitation(hydrated.invitation.id, hydrated.space.about.profile.url)}
      accepting={props.accepting}
      onReject={() => props.rejectInvitation(hydrated.invitation.id)}
      rejecting={props.rejecting}
      updating={props.updating}
    />
  );
}
