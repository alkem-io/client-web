import { Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCommunityGuidelinesQuery, useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { CommunityGuidelinesBlock } from '@/crd/components/space/CommunityGuidelinesBlock';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { SpaceAboutDialog } from '@/crd/components/space/SpaceAboutDialog';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import { useSpaceApplyFlow } from '../useSpaceApplyFlow';

type CrdSpaceAboutProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Single L0 Space About implementation, shared by both entry points: the
 * `/about` route (`CrdSpaceAboutPage`, always open) and the sidebar "About
 * this Space" trigger (`CrdSpaceAboutDialogConnector`, controlled via `open`).
 * Keeping it in one place guarantees the apply flow, guidelines, host contact
 * and lock/edit affordances behave identically regardless of the entry path.
 *
 * Mirrors the subspace's `CrdSubspaceAbout`. No `StorageConfigContextProvider`
 * is mounted here: the route page wraps it explicitly, and the connector
 * mounts inside `CrdSpacePageLayout` which already provides one.
 */
export function CrdSpaceAbout({ open, onClose }: CrdSpaceAboutProps) {
  const { space, permissions } = useSpace();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useSpaceAboutDetailsQuery({
    variables: { spaceId: space.id },
    skip: !open || !space.id,
  });

  const profileUrl = data?.lookup.space?.about.profile.url ?? space.about.profile.url;

  const {
    loading: applyLoading,
    isMember,
    buttonProps,
    dialogs,
  } = useSpaceApplyFlow({
    spaceId: space.id,
    spaceProfileUrl: profileUrl,
    communityName: space.about.profile.displayName,
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
    name: profile?.displayName ?? space.about.profile.displayName,
    tagline: profile?.tagline ?? space.about.profile.tagline ?? undefined,
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

  const whyTitle = t(`about.context.${space.level}.why` as const, { ns: 'crd-space' });
  const whoTitle = t(`about.context.${space.level}.who` as const, { ns: 'crd-space' });

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
          if (!isOpen) onClose();
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
