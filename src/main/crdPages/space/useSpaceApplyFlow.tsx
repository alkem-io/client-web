import { type ReactNode, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { ApplicationSubmittedDialog } from '@/crd/components/community/ApplicationSubmittedDialog';
import { PreApplicationDialog } from '@/crd/components/community/PreApplicationDialog';
import { PreJoinParentDialog } from '@/crd/components/community/PreJoinParentDialog';
import type { SpaceAboutApplyButtonProps } from '@/crd/components/space/SpaceAboutApplyButton';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import isApplicationPending from '@/domain/community/applicationButton/isApplicationPending';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { ApplyDialogConnector } from './about/ApplyDialogConnector';
import { InvitationDetailConnector } from './about/InvitationDetailConnector';

export type UseSpaceApplyFlowParams = {
  spaceId: string;
  spaceProfileUrl: string;
  communityName: string;
  parentSpaceId?: string;
  /**
   * Post-successful-join callback. When omitted (banner/dashboard button) the
   * default navigates into the space. When the button lives inside the About
   * dialog, pass the dialog's `onClose` so joining closes it via the normal
   * Radix close path — otherwise the default route-change navigate yanks the
   * still-open modal and leaves `pointer-events:none` stuck on the page.
   */
  onJoined?: () => void;
};

export type UseSpaceApplyFlowResult = {
  loading: boolean;
  isMember: boolean;
  buttonProps: Omit<SpaceAboutApplyButtonProps, 'className'>;
  dialogs: ReactNode;
};

export function useSpaceApplyFlow({
  spaceId,
  spaceProfileUrl,
  communityName,
  parentSpaceId,
  onJoined,
}: UseSpaceApplyFlowParams): UseSpaceApplyFlowResult {
  const navigate = useNavigate();

  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);
  const [isPreAppDialogOpen, setIsPreAppDialogOpen] = useState(false);
  const [isPreJoinDialogOpen, setIsPreJoinDialogOpen] = useState(false);
  const [isSubmittedDialogOpen, setIsSubmittedDialogOpen] = useState(false);

  const { applicationButtonProps, loading } = useApplicationButton({
    spaceId,
    parentSpaceId,
    // On success, either close the hosting dialog (About) or navigate into the space.
    onJoin: onJoined ?? (() => navigate(spaceProfileUrl)),
  });

  const preAppDialogVariant = isApplicationPending(applicationButtonProps.parentApplicationState)
    ? 'dialog-parent-app-pending'
    : 'dialog-apply-parent';

  const parentCommunitySpaceLevel = applicationButtonProps.parentCommunitySpaceLevel as 'L0' | 'L1' | 'L2' | undefined;

  const buttonProps: Omit<SpaceAboutApplyButtonProps, 'className'> = {
    isAuthenticated: applicationButtonProps.isAuthenticated,
    isMember: applicationButtonProps.isMember,
    isParentMember: applicationButtonProps.isParentMember,
    applicationState: applicationButtonProps.applicationState,
    userInvitation: applicationButtonProps.userInvitation,
    parentApplicationState: applicationButtonProps.parentApplicationState,
    canJoinCommunity: applicationButtonProps.canJoinCommunity,
    canAcceptInvitation: applicationButtonProps.canAcceptInvitation,
    canApplyToCommunity: applicationButtonProps.canApplyToCommunity,
    canJoinParentCommunity: applicationButtonProps.canJoinParentCommunity,
    canApplyToParentCommunity: applicationButtonProps.canApplyToParentCommunity,
    loading: applicationButtonProps.loading || loading,
    onLoginClick: () => navigate(buildLoginUrl(applicationButtonProps.applyUrl ?? spaceProfileUrl)),
    onApplyClick: () => setIsApplyDialogOpen(true),
    // Joining is a direct, non-destructive action (the user already has join
    // rights), so skip the confirmation dialog and join immediately — the empty
    // "You're about to join" step added nothing. Apply still opens its form dialog.
    onJoinClick: () => applicationButtonProps.onJoin(),
    onAcceptInvitationClick: () => setIsInvitationDialogOpen(true),
    onApplyParentClick: () => setIsPreAppDialogOpen(true),
    onJoinParentClick: () => setIsPreJoinDialogOpen(true),
  };

  const dialogs = (
    <>
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
        communityName={communityName}
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
    </>
  );

  return {
    loading,
    isMember: applicationButtonProps.isMember,
    buttonProps,
    dialogs,
  };
}
