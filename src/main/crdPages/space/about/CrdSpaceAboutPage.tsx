import { Lock, Mail } from 'lucide-react';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useCommunityGuidelinesQuery, useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import useNavigate from '@/core/routing/useNavigate';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { ApplicationSubmittedDialog } from '@/crd/components/community/ApplicationSubmittedDialog';
import { PreApplicationDialog } from '@/crd/components/community/PreApplicationDialog';
import { PreJoinParentDialog } from '@/crd/components/community/PreJoinParentDialog';
import { CommunityGuidelinesBlock } from '@/crd/components/space/CommunityGuidelinesBlock';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { SpaceAboutDialog } from '@/crd/components/space/SpaceAboutDialog';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import isApplicationPending from '@/domain/community/applicationButton/isApplicationPending';
import { useSpace } from '@/domain/space/context/useSpace';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { buildLoginUrl, buildSettingsUrl } from '@/main/routing/urlBuilders';
import { ApplyDialogConnector } from './ApplyDialogConnector';
import { InvitationDetailConnector } from './InvitationDetailConnector';

export default function CrdSpaceAboutPage() {
  const { space, permissions } = useSpace();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, loading } = useSpaceAboutDetailsQuery({
    variables: { spaceId: space.id },
    skip: !space.id,
  });

  const backToParentPage = useBackWithDefaultUrl(
    permissions.canRead ? space.about.profile.url : undefined,
    permissions.canRead ? undefined : 2
  );

  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);
  const [isPreAppDialogOpen, setIsPreAppDialogOpen] = useState(false);
  const [isPreJoinDialogOpen, setIsPreJoinDialogOpen] = useState(false);
  const [isSubmittedDialogOpen, setIsSubmittedDialogOpen] = useState(false);

  const parentSpaceId: string | undefined = undefined;

  const profileUrl = data?.lookup.space?.about.profile.url;

  const { applicationButtonProps, loading: applyLoading } = useApplicationButton({
    spaceId: space.id,
    parentSpaceId,
    onJoin: () => {
      if (profileUrl) {
        navigate(profileUrl);
      }
    },
  });

  const guidelinesId = data?.lookup.space?.about.guidelines.id;
  const { data: guidelinesData, loading: guidelinesLoading } = useCommunityGuidelinesQuery({
    variables: { communityGuidelinesId: guidelinesId ?? '' },
    skip: !guidelinesId,
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  const about = data?.lookup.space?.about;
  if (!about) {
    return null;
  }

  const profile = about.profile;

  const leadUsers = (about.membership?.leadUsers ?? [])
    .filter((u): u is typeof u & { profile: NonNullable<typeof u.profile> } => !!u.profile)
    .map(u => ({
      name: u.profile.displayName,
      avatarUrl: u.profile.avatar?.uri,
      type: 'person' as const,
      location: [u.profile.location?.city, u.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: u.profile.url,
    }));

  const leadOrgs = (about.membership?.leadOrganizations ?? [])
    .filter((o): o is typeof o & { profile: NonNullable<typeof o.profile> } => !!o.profile)
    .map(o => ({
      name: o.profile.displayName,
      avatarUrl: o.profile.avatar?.uri,
      type: 'organization' as const,
      location: [o.profile.location?.city, o.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: o.profile.url,
    }));

  const provider = about.provider?.profile
    ? {
        name: about.provider.profile.displayName,
        avatarUrl: about.provider.profile.avatar?.uri,
        type: 'organization' as const,
        location:
          [about.provider.profile.location?.city, about.provider.profile.location?.country]
            .filter(Boolean)
            .join(', ') || undefined,
        href: about.provider.profile.url,
      }
    : undefined;

  const aboutData: SpaceAboutData = {
    name: profile.displayName,
    tagline: profile.tagline ?? undefined,
    description: profile.description ?? undefined,
    location: [profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || undefined,
    metrics: (about.metrics ?? []).map(m => ({ name: m.name, value: m.value })),
    who: about.who ?? undefined,
    why: about.why ?? undefined,
    provider,
    leadUsers,
    leadOrganizations: leadOrgs,
    references: (profile.references ?? []).map(r => ({
      name: r.name,
      uri: r.uri,
      description: r.description ?? undefined,
    })),
  };

  const whyTitle = t(`about.context.${space.level}.why` as const, { ns: 'crd-space' });
  const whoTitle = t(`about.context.${space.level}.who` as const, { ns: 'crd-space' });

  const lockTooltipSlot = !permissions.canRead ? (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <button
          type="button"
          className="inline-flex items-center justify-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label={t('about.lockTooltip', { ns: 'crd-space' })}
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <Trans
          i18nKey="components.spaceUnauthorizedDialog.message"
          components={{
            apply: (
              <button
                type="button"
                className="underline text-primary-foreground bg-transparent border-0 cursor-pointer p-0"
                onClick={() => {
                  applyButtonRef.current?.click();
                }}
              />
            ),
          }}
        />
      </TooltipContent>
    </Tooltip>
  ) : undefined;

  const showApplyButton = !applicationButtonProps.isMember && !applyLoading;
  const joinSlot = showApplyButton ? (
    <SpaceAboutApplyButton
      ref={applyButtonRef}
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
      loading={applicationButtonProps.loading || applyLoading}
      onLoginClick={() => navigate(buildLoginUrl(applicationButtonProps.applyUrl))}
      onApplyClick={() => setIsApplyDialogOpen(true)}
      onJoinClick={() => setIsApplyDialogOpen(true)}
      onAcceptInvitationClick={() => setIsInvitationDialogOpen(true)}
      onApplyParentClick={() => setIsPreAppDialogOpen(true)}
      onJoinParentClick={() => setIsPreJoinDialogOpen(true)}
    />
  ) : undefined;

  // Contact host — simple link to the host's profile page (FR-013).
  // The profile page handles authorization and has its own messaging UI.
  const contactHostSlot = provider ? (
    <a
      href={provider.href}
      className="inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4"
    >
      <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
      {t('about.contactHost', { ns: 'crd-space' })}
    </a>
  ) : undefined;

  const guidelines = guidelinesData?.lookup.communityGuidelines?.profile;
  const guidelinesSlot = guidelinesId ? (
    <CommunityGuidelinesBlock
      displayName={guidelines?.displayName}
      description={guidelines?.description ?? undefined}
      references={guidelines?.references?.map(r => ({
        name: r.name,
        uri: r.uri,
        description: r.description ?? undefined,
      }))}
      loading={guidelinesLoading}
      canEdit={permissions.canUpdate}
      onEditClick={() => navigate(`${buildSettingsUrl(profileUrl ?? '')}/community`)}
    />
  ) : undefined;

  const preAppDialogVariant = isApplicationPending(applicationButtonProps.parentApplicationState)
    ? 'dialog-parent-app-pending'
    : 'dialog-apply-parent';

  return (
    <StorageConfigContextProvider locationType="space" spaceId={space.id}>
      <SpaceAboutDialog
        open={true}
        onOpenChange={open => {
          if (!open) {
            backToParentPage();
          }
        }}
        data={aboutData}
        hasEditPrivilege={permissions.canUpdate}
        whyTitle={whyTitle}
        whoTitle={whoTitle}
        lockTooltipSlot={lockTooltipSlot}
        joinSlot={joinSlot}
        guidelinesSlot={guidelinesSlot}
        contactHostSlot={contactHostSlot}
        onEditDescription={() => navigate(`${buildSettingsUrl(profileUrl ?? '')}/about#description`)}
        onEditWhy={() => navigate(`${buildSettingsUrl(profileUrl ?? '')}/about#why`)}
        onEditWho={() => navigate(`${buildSettingsUrl(profileUrl ?? '')}/about#who`)}
        onEditReferences={() => navigate(`${buildSettingsUrl(profileUrl ?? '')}/about`)}
      />

      <ApplyDialogConnector
        open={isApplyDialogOpen}
        onOpenChange={setIsApplyDialogOpen}
        spaceId={space.id}
        canJoinCommunity={applicationButtonProps.canJoinCommunity}
        onJoin={() => applicationButtonProps.onJoin()}
        onApplied={() => setIsSubmittedDialogOpen(true)}
      />
      <ApplicationSubmittedDialog
        open={isSubmittedDialogOpen}
        onOpenChange={setIsSubmittedDialogOpen}
        communityName={aboutData.name}
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
        parentCommunitySpaceLevel={applicationButtonProps.parentCommunitySpaceLevel as 'L0' | 'L1' | 'L2' | undefined}
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
        parentCommunitySpaceLevel={applicationButtonProps.parentCommunitySpaceLevel as 'L0' | 'L1' | 'L2' | undefined}
        subspaceName={applicationButtonProps.subspaceName}
        parentApplyUrl={applicationButtonProps.parentUrl}
      />
    </StorageConfigContextProvider>
  );
}
