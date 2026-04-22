import { useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { ApplicationSubmittedDialog } from '@/crd/components/community/ApplicationSubmittedDialog';
import { PreApplicationDialog } from '@/crd/components/community/PreApplicationDialog';
import { PreJoinParentDialog } from '@/crd/components/community/PreJoinParentDialog';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import isApplicationPending from '@/domain/community/applicationButton/isApplicationPending';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { ApplyDialogConnector } from './about/ApplyDialogConnector';
import { InvitationDetailConnector } from './about/InvitationDetailConnector';

type SpaceApplyButtonConnectorProps = {
  spaceId: string;
  spaceProfileUrl: string;
  className?: string;
};

export function SpaceApplyButtonConnector({ spaceId, spaceProfileUrl, className }: SpaceApplyButtonConnectorProps) {
  const { space } = useSpace();
  const navigate = useNavigate();

  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);
  const [isPreAppDialogOpen, setIsPreAppDialogOpen] = useState(false);
  const [isPreJoinDialogOpen, setIsPreJoinDialogOpen] = useState(false);
  const [isSubmittedDialogOpen, setIsSubmittedDialogOpen] = useState(false);

  const { applicationButtonProps, loading } = useApplicationButton({
    spaceId,
    onJoin: () => navigate(spaceProfileUrl),
  });

  if (loading || applicationButtonProps.isMember) {
    return null;
  }

  const preAppDialogVariant = isApplicationPending(applicationButtonProps.parentApplicationState)
    ? 'dialog-parent-app-pending'
    : 'dialog-apply-parent';

  const parentCommunitySpaceLevel = applicationButtonProps.parentCommunitySpaceLevel as 'L0' | 'L1' | 'L2' | undefined;

  return (
    <div className={className}>
      <SpaceAboutApplyButton
        isAuthenticated={applicationButtonProps.isAuthenticated}
        isMember={applicationButtonProps.isMember}
        isParentMember={applicationButtonProps.isParentMember}
        applicationState={applicationButtonProps.applicationState}
        userInvitation={applicationButtonProps.userInvitation}
        parentApplicationState={applicationButtonProps.parentApplicationState}
        canJoinCommunity={applicationButtonProps.canJoinCommunity}
        canAcceptInvitation={applicationButtonProps.canAcceptInvitation}
        canApplyToCommunity={applicationButtonProps.canApplyToCommunity}
        canJoinParentCommunity={applicationButtonProps.canJoinParentCommunity}
        canApplyToParentCommunity={applicationButtonProps.canApplyToParentCommunity}
        loading={applicationButtonProps.loading}
        onLoginClick={() => navigate(buildLoginUrl(applicationButtonProps.applyUrl ?? spaceProfileUrl))}
        onApplyClick={() => setIsApplyDialogOpen(true)}
        onJoinClick={() => setIsApplyDialogOpen(true)}
        onAcceptInvitationClick={() => setIsInvitationDialogOpen(true)}
        onApplyParentClick={() => setIsPreAppDialogOpen(true)}
        onJoinParentClick={() => setIsPreJoinDialogOpen(true)}
      />

      <ApplyDialogConnector
        open={isApplyDialogOpen}
        onOpenChange={setIsApplyDialogOpen}
        spaceId={spaceId}
        canJoinCommunity={applicationButtonProps.canJoinCommunity}
        onJoin={() => applicationButtonProps.onJoin()}
        onApplied={() => setIsSubmittedDialogOpen(true)}
      />
      <ApplicationSubmittedDialog
        open={isSubmittedDialogOpen}
        onOpenChange={setIsSubmittedDialogOpen}
        communityName={space.about.profile.displayName}
      />
      <InvitationDetailConnector
        open={isInvitationDialogOpen}
        onOpenChange={setIsInvitationDialogOpen}
        invitation={applicationButtonProps.userInvitation}
      />
      <PreApplicationDialog
        open={isPreAppDialogOpen}
        onOpenChange={setIsPreAppDialogOpen}
        dialogVariant={preAppDialogVariant}
        parentCommunitySpaceLevel={parentCommunitySpaceLevel}
        parentCommunityName={applicationButtonProps.parentCommunityName}
        subspaceName={applicationButtonProps.subspaceName}
        parentApplicationState={applicationButtonProps.parentApplicationState}
        applyUrl={applicationButtonProps.applyUrl}
        parentApplyUrl={applicationButtonProps.parentUrl}
      />
      <PreJoinParentDialog
        open={isPreJoinDialogOpen}
        onOpenChange={setIsPreJoinDialogOpen}
        parentCommunityName={applicationButtonProps.parentCommunityName}
        parentCommunitySpaceLevel={parentCommunitySpaceLevel}
        subspaceName={applicationButtonProps.subspaceName}
        parentApplyUrl={applicationButtonProps.parentUrl}
      />
    </div>
  );
}
