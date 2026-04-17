import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle, Caption, Text } from '@/core/ui/typography';
import { InvitationDetailDialog } from '@/crd/components/dashboard/InvitationDetailDialog';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import { useInvitationHydrator } from '@/domain/community/pendingMembership/PendingMemberships';
import type { PendingInvitationItem } from '@/domain/community/user/models/PendingInvitationItem';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import References from '@/domain/shared/components/References/References';
import { mapHydratedInvitationToDetailData } from '@/main/crdPages/dashboard/pendingMembershipsDataMappers';

type InvitationDetailConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: PendingInvitationItem | undefined;
};

export function InvitationDetailConnector({ open, onOpenChange, invitation }: InvitationDetailConnectorProps) {
  const { t } = useTranslation('crd-dashboard');
  const { t: tMain } = useTranslation();

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

  const detailData = mapHydratedInvitationToDetailData(hydrated, tMain);

  const descriptionSlot = (
    <Caption>
      <DetailedActivityDescription
        i18nKey="community.pendingMembership.invitationTitle"
        spaceDisplayName={hydrated.space.about.profile.displayName}
        spaceUrl={hydrated.space.about.profile.url}
        spaceLevel={hydrated.space.level}
        createdDate={hydrated.invitation.createdDate}
        author={{ displayName: hydrated.userDisplayName }}
        type={hydrated.invitation.actor?.type}
      />
    </Caption>
  );

  const welcomeMessageSlot = hydrated.invitation.welcomeMessage ? (
    <Text>{hydrated.invitation.welcomeMessage}</Text>
  ) : undefined;

  const guidelinesSlot = communityGuidelines ? (
    <>
      <BlockSectionTitle paddingTop={gutters()}>{communityGuidelines.profile.displayName}</BlockSectionTitle>
      <Gutters disablePadding={true}>
        <div style={{ wordWrap: 'break-word' }}>
          <WrapperMarkdown disableParagraphPadding={true}>
            {communityGuidelines.profile.description ?? ''}
          </WrapperMarkdown>
        </div>
        <References compact={true} references={communityGuidelines.profile.references} />
      </Gutters>
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
