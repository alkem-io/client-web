import { PanelsTopLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { type HubAboutFormValues, InnovationHubAboutTab } from '@/crd/components/innovationHub/InnovationHubAboutTab';
import { InnovationHubSettingsShell } from '@/crd/components/innovationHub/InnovationHubSettingsShell';
import { type HubSpacesTableRow, InnovationHubSpacesTab } from '@/crd/components/innovationHub/InnovationHubSpacesTab';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useEnableSpaceFullWidth } from '@/main/ui/layout/LayoutWidthContext';
import { useLayoutWidthPreference } from '@/main/ui/layout/useLayoutWidthPreference';
import type { HubAboutSectionKey, HubSettingsTabKey } from './CrdInnovationHubSettingsPage.types';
import { mapInnovationHubToSettingsHeader } from './dataMappers/mapInnovationHubToSettingsHeader';
import { CrdAddSpaceByUrlDialog } from './dialogs/CrdAddSpaceByUrlDialog';
import { useHubAboutTabData } from './hooks/useHubAboutTabData';
import { useHubAccessGuard } from './hooks/useHubAccessGuard';
import { useHubSpacesTabData } from './hooks/useHubSpacesTabData';
import { useInnovationHubSettingsData } from './hooks/useInnovationHubSettingsData';
import { buildHubHomePath, buildHubSettingsPath } from './lib/hubUrls';

type CrdInnovationHubSettingsPageProps = {
  tab: HubSettingsTabKey;
};

const CrdInnovationHubSettingsPage = ({ tab }: CrdInnovationHubSettingsPageProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const { innovationHubId } = useUrlResolver();
  const guard = useHubAccessGuard(innovationHubId);
  const { hub, loading: hubLoading, refetch } = useInnovationHubSettingsData();
  useEnableSpaceFullWidth();
  const { wide: fullWidth, toggle: toggleFullWidth } = useLayoutWidthPreference();

  const aboutData = useHubAboutTabData(hub);
  const spacesData = useHubSpacesTabData(hub, () => refetch());

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<HubSpacesTableRow | null>(null);

  // Top-bar breadcrumbs: `[PanelsTopLeft] HubName → Settings → ActiveTab`.
  // Same shape as Spaces / Org / User settings, so the topbar replaces the
  // previous "eye" link as the way back to the public hub.
  const breadcrumbItems: BreadcrumbTrailItem[] = hub
    ? [
        { label: hub.profile.displayName, href: buildHubHomePath(hub.nameID), icon: PanelsTopLeft },
        { label: t('breadcrumbs.settings'), href: buildHubSettingsPath(hub.nameID) },
        { label: t(`settings.tabs.${tab}` as 'settings.tabs.about' | 'settings.tabs.spaces') },
      ]
    : [];
  useSetBreadcrumbs(breadcrumbItems);

  if (guard.state === 'denied') {
    return <Navigate to={guard.redirectTo} replace={true} />;
  }

  if (guard.state === 'loading' || hubLoading || !hub) {
    return <Loading />;
  }

  const header = mapInnovationHubToSettingsHeader(hub);
  // Path-based routes use `nameID` (the route param the server resolves).
  // `subdomain` is for hostname URLs only.
  const settingsBase = buildSettingsUrl(`/hub/${hub.nameID}`);
  const tabHrefs: Record<HubSettingsTabKey, string> = {
    about: `${settingsBase}/about`,
    spaces: `${settingsBase}/spaces`,
  };

  const aboutTabValues: HubAboutFormValues = aboutData.values;
  const onSaveSection = (key: HubAboutSectionKey) => aboutData.onSaveSection(key);

  const handleConfirmRemove = () => {
    if (pendingRemove) {
      void spacesData.remove(pendingRemove.id);
      setPendingRemove(null);
    }
  };

  return (
    <StorageConfigContextProvider locationType="innovationHub" innovationHubId={hub.id}>
      <InnovationHubSettingsShell
        header={header}
        activeTab={tab}
        tabHrefs={tabHrefs}
        fullWidth={fullWidth}
        onToggleFullWidth={toggleFullWidth}
      >
        {tab === 'about' && (
          <InnovationHubAboutTab
            values={aboutTabValues}
            dirty={aboutData.dirty}
            saveStatus={aboutData.saveStatus}
            errors={aboutData.errors}
            onChange={aboutData.onChange}
            onSaveSection={onSaveSection}
            onBannerFileSelected={aboutData.onBannerFileSelected}
            bannerUploading={aboutData.bannerUploading}
          />
        )}
        {tab === 'spaces' && (
          <InnovationHubSpacesTab
            rows={spacesData.rows}
            busy={spacesData.busy}
            onReorder={ids => void spacesData.reorder(ids)}
            onAddClick={() => setAddDialogOpen(true)}
            onRemoveRequest={row => setPendingRemove(row)}
          />
        )}
      </InnovationHubSettingsShell>

      <CrdAddSpaceByUrlDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={spaceId => spacesData.add(spaceId)}
        existingSpaceIds={spacesData.rows.map(r => r.id)}
      />

      <ConfirmationDialog
        open={Boolean(pendingRemove)}
        onOpenChange={next => {
          if (!next) setPendingRemove(null);
        }}
        variant="destructive"
        title={t('settings.spaces.confirmRemove.title')}
        description={t('settings.spaces.confirmRemove.body', { name: pendingRemove?.name ?? '' })}
        confirmLabel={t('settings.spaces.confirmRemove.confirm')}
        cancelLabel={t('settings.spaces.confirmRemove.cancel')}
        onConfirm={handleConfirmRemove}
      />

      {/* Banner crop + resize dialog — mirrors the Space Settings flow. The
          file picked in the About tab is staged here for cropping; only after
          crop confirmation does `useUploadVisualMutation` fire, with the file
          already resized within the visual's min/max bounds (the server
          previously rejected oversized originals). */}
      <ImageCropDialog
        open={aboutData.pendingBannerCrop !== null}
        file={aboutData.pendingBannerCrop?.file}
        config={aboutData.pendingBannerCrop?.config ?? {}}
        onSave={aboutData.onBannerCropComplete}
        onCancel={aboutData.onBannerCropCancel}
        title={t('settings.about.banner.crop.title')}
        description={t('settings.about.banner.crop.description')}
        saveLabel={t('settings.about.banner.crop.save')}
        savingLabel={t('settings.about.banner.crop.saving')}
        cancelLabel={t('settings.about.banner.crop.cancel')}
        altTextLabel={t('settings.about.banner.crop.altLabel')}
        altTextPlaceholder={t('settings.about.banner.crop.altPlaceholder')}
      />
    </StorageConfigContextProvider>
  );
};

export default CrdInnovationHubSettingsPage;
