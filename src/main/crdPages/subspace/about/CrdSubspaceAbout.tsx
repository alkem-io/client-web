import { Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCommunityGuidelinesQuery, useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { CommunityGuidelinesBlock } from '@/crd/components/space/CommunityGuidelinesBlock';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { SpaceAboutDialog } from '@/crd/components/space/SpaceAboutDialog';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import { useSpaceApplyFlow } from '../../space/useSpaceApplyFlow';

type CrdSubspaceAboutProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Single subspace (L1/L2) About implementation, shared by both entry points:
 * the `/about` route (`CrdSubspaceAboutPage`, always open) and the sidebar
 * "About" trigger (controlled via `open`). Keeping it in one place guarantees
 * the apply flow — including the parent-community-first logic — behaves
 * identically regardless of how the About is opened.
 *
 * The apply flow is the same `useSpaceApplyFlow` hook the dashboard/banner
 * button uses; we pass `parentSpaceId` so `useApplicationButton` correctly
 * recognises this as a subspace and routes the user to apply to the parent
 * community first when required (instead of opening the apply form directly).
 *
 * No `StorageConfigContextProvider` is needed here: both call sites already
 * sit inside the provider mounted in `CrdSubspacePageLayout`.
 */
export function CrdSubspaceAbout({ open, onClose }: CrdSubspaceAboutProps) {
  const { subspace, permissions, parentSpaceId } = useSubSpace();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useSpaceAboutDetailsQuery({
    variables: { spaceId: subspace.id },
    skip: !open || !subspace.id,
  });

  const profileUrl = data?.lookup.space?.about.profile.url ?? subspace.about.profile.url;

  const {
    loading: applyLoading,
    isMember,
    buttonProps,
    dialogs,
  } = useSpaceApplyFlow({
    spaceId: subspace.id,
    spaceProfileUrl: profileUrl,
    communityName: subspace.about.profile.displayName,
    parentSpaceId,
    // Joining from the About dialog closes it via the normal close path instead
    // of letting the default navigate yank the open modal (which froze the page).
    onJoined: onClose,
  });

  const guidelinesId = data?.lookup.space?.about.guidelines.id;
  const { data: guidelinesData, loading: guidelinesLoading } = useCommunityGuidelinesQuery({
    variables: { communityGuidelinesId: guidelinesId ?? '' },
    skip: !open || !guidelinesId,
  });

  const about = data?.lookup.space?.about;
  const profile = about?.profile;

  const leadUsers = (about?.membership?.leadUsers ?? [])
    .filter((u): u is typeof u & { profile: NonNullable<typeof u.profile> } => !!u.profile)
    .map(u => ({
      name: u.profile.displayName,
      avatarUrl: u.profile.avatar?.uri,
      type: 'person' as const,
      location: [u.profile.location?.city, u.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: u.profile.url,
    }));

  const leadOrgs = (about?.membership?.leadOrganizations ?? [])
    .filter((o): o is typeof o & { profile: NonNullable<typeof o.profile> } => !!o.profile)
    .map(o => ({
      name: o.profile.displayName,
      avatarUrl: o.profile.avatar?.uri,
      type: 'organization' as const,
      location: [o.profile.location?.city, o.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: o.profile.url,
    }));

  const provider = about?.provider?.profile
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
    name: profile?.displayName ?? subspace.about.profile.displayName,
    tagline: profile?.tagline ?? subspace.about.profile.tagline ?? undefined,
    description: profile?.description ?? undefined,
    location: [profile?.location?.city, profile?.location?.country].filter(Boolean).join(', ') || undefined,
    metrics: (about?.metrics ?? []).map(m => ({ name: m.name, value: m.value })),
    who: about?.who ?? undefined,
    why: about?.why ?? undefined,
    provider,
    leadUsers,
    leadOrganizations: leadOrgs,
    references: (profile?.references ?? []).map(r => ({
      name: r.name,
      uri: r.uri,
      description: r.description ?? undefined,
    })),
  };

  const whyTitle = t(`about.context.${subspace.level}.why` as const, { ns: 'crd-space' });
  const whoTitle = t(`about.context.${subspace.level}.who` as const, { ns: 'crd-space' });

  const lockTooltipSlot = !permissions.canRead ? (
    <span
      role="img"
      aria-label={t('about.lockTooltip', { ns: 'crd-space' })}
      className="inline-flex items-center justify-center text-primary"
    >
      <Lock className="w-4 h-4" aria-hidden="true" />
    </span>
  ) : undefined;

  const showApplyButton = !isMember && !applyLoading;
  const joinSlot = showApplyButton ? <SpaceAboutApplyButton {...buttonProps} /> : undefined;

  const memberCount = aboutData.metrics.find(m => m.name === 'members')?.value;

  const contactHostSlot = provider ? (
    <a
      href={provider.href}
      className="inline-flex items-center gap-2 text-body-emphasis text-primary hover:underline underline-offset-4"
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
      onEditClick={() => navigate(buildSettingsTabUrl(profileUrl, 'community', 'guidelines'))}
    />
  ) : undefined;

  return (
    <>
      <SpaceAboutDialog
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) {
            onClose();
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
        memberCount={memberCount}
        isMember={isMember}
        onEditDescription={() => navigate(buildSettingsTabUrl(profileUrl, 'about', 'description'))}
        onEditWhy={() => navigate(buildSettingsTabUrl(profileUrl, 'about', 'why'))}
        onEditWho={() => navigate(buildSettingsTabUrl(profileUrl, 'about', 'who'))}
        onEditReferences={() => navigate(buildSettingsTabUrl(profileUrl, 'about', 'references'))}
        onEditMembers={() => navigate(buildSettingsTabUrl(profileUrl, 'community', 'members'))}
      />
      {dialogs}
    </>
  );
}
