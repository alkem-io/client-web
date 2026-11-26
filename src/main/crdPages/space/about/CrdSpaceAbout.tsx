import { Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { CommunityGuidelinesBlock } from '@/crd/components/space/CommunityGuidelinesBlock';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { SpaceAboutDialog } from '@/crd/components/space/SpaceAboutDialog';
import { pageSpace } from '@/domain/space/context/spacePageShellMapper';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSpacePageData } from '@/domain/space/hooks/useSpacePage';
import { isApplyUnavailable } from '@/main/crdPages/space/isApplyUnavailable';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import { mapNativeSpaceAbout, nativeGuidelines } from '../dataMappers/spacePageDataMapper';
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

  // 021 FR-003: About reads the page's D2 Space document from the cache — opening it sends no request.
  const doc = pageSpace(useSpacePageData(space.id || undefined, 'space')?.node, space.id);
  const profileUrl = space.about.profile.url;

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
    skip: !open,
  });

  const aboutData = mapNativeSpaceAbout(doc, t('tabs.unavailable', { ns: 'crd-space' }));

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

  const showApplyButton = !isMember && !applyLoading && !isApplyUnavailable(buttonProps);
  const joinSlot = showApplyButton ? <SpaceAboutApplyButton {...buttonProps} /> : undefined;
  const memberCount = aboutData.metrics.find(m => m.name === 'members')?.value;

  const contactHostSlot = aboutData.provider ? (
    <a
      href={aboutData.provider.href}
      className="inline-flex items-center gap-2 text-body-emphasis text-primary hover:underline underline-offset-4"
    >
      <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
      {t('about.contactHost', { ns: 'crd-space' })}
    </a>
  ) : undefined;

  const guidelines = nativeGuidelines(doc);
  const guidelinesSlot = (
    <CommunityGuidelinesBlock
      displayName={guidelines?.displayName}
      description={guidelines?.description}
      canEdit={permissions.canUpdate}
      onEditClick={() => navigate(buildSettingsTabUrl(profileUrl, 'community', 'guidelines'))}
    />
  );

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
        onEditClassifications={() => navigate(buildSettingsTabUrl(profileUrl, 'about', 'classifications'))}
      />
      {dialogs}
    </>
  );
}
