import { PanelsTopLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  type HubAboutFormValues,
  InnovationHubAboutTab,
  type InnovationHubAboutTabProps,
} from '@/crd/components/innovationHub/InnovationHubAboutTab';
import { InnovationHubPacksTab } from '@/crd/components/innovationHub/InnovationHubPacksTab';
import { InnovationHubSettingsShell } from '@/crd/components/innovationHub/InnovationHubSettingsShell';
import { InnovationHubSpacesTab } from '@/crd/components/innovationHub/InnovationHubSpacesTab';
import { InnovationHubVirtualContributorsTab } from '@/crd/components/innovationHub/InnovationHubVirtualContributorsTab';
import type { HubResourceType } from '@/domain/innovationHub/InnovationHubsSettings/useResolveHubResourceUrl';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useEnableSpaceFullWidth } from '@/main/ui/layout/LayoutWidthContext';
import { useLayoutWidthPreference } from '@/main/ui/layout/useLayoutWidthPreference';
import type { HubAboutSectionKey, HubSettingsTabKey } from './CrdInnovationHubSettingsPage.types';
import { mapInnovationHubToSettingsHeader } from './dataMappers/mapInnovationHubToSettingsHeader';
import { CrdAddHubResourceDialog } from './dialogs/CrdAddHubResourceDialog';
import { useHubAboutTabData } from './hooks/useHubAboutTabData';
import { useHubAccessGuard } from './hooks/useHubAccessGuard';
import { useHubPacksTabData } from './hooks/useHubPacksTabData';
import { useHubSpacesTabData } from './hooks/useHubSpacesTabData';
import { useHubVirtualContributorsTabData } from './hooks/useHubVirtualContributorsTabData';
import { useInnovationHubSettingsData } from './hooks/useInnovationHubSettingsData';
import { buildHubHomePath, buildHubSettingsPath } from './lib/hubUrls';

type CrdInnovationHubSettingsPageProps = {
  tab: HubSettingsTabKey;
};

/**
 * Wires image upload into the About tab's description editor. Must be rendered *inside* the page's
 * `locationType="innovationHub"` `StorageConfigContextProvider` (which the page mounts in its own
 * JSX, not from an ancestor layout) so `useMarkdownEditorIntegration` resolves the hub's own bucket.
 * Editing an existing hub is an edit flow → default `temporaryLocation: false`.
 */
const InnovationHubAboutTabConnector = (
  props: Omit<InnovationHubAboutTabProps, 'onImageUpload' | 'iframeAllowedUrls' | 'onError'>
) => {
  const md = useMarkdownEditorIntegration();
  return <InnovationHubAboutTab {...props} {...md} />;
};

// A `visibility`-type hub has no curated Space list — its Spaces are every Space with the
// chosen visibility, so the Spaces tab shows an explanatory message instead of the editor.
const VISIBILITY_LABEL_KEY = {
  [SpaceVisibility.Active]: 'settings.spaces.visibility.active',
  [SpaceVisibility.Demo]: 'settings.spaces.visibility.demo',
  [SpaceVisibility.Inactive]: 'settings.spaces.visibility.inactive',
  [SpaceVisibility.Archived]: 'settings.spaces.visibility.archived',
} as const;

// Literal-key records keep `t()` fully typed for the per-type remove confirmation.
const CONFIRM_REMOVE_KEYS = {
  space: {
    title: 'settings.spaces.confirmRemove.title',
    body: 'settings.spaces.confirmRemove.body',
    confirm: 'settings.spaces.confirmRemove.confirm',
    cancel: 'settings.spaces.confirmRemove.cancel',
  },
  pack: {
    title: 'settings.packs.confirmRemove.title',
    body: 'settings.packs.confirmRemove.body',
    confirm: 'settings.packs.confirmRemove.confirm',
    cancel: 'settings.packs.confirmRemove.cancel',
  },
  virtualContributor: {
    title: 'settings.virtualContributors.confirmRemove.title',
    body: 'settings.virtualContributors.confirmRemove.body',
    confirm: 'settings.virtualContributors.confirmRemove.confirm',
    cancel: 'settings.virtualContributors.confirmRemove.cancel',
  },
} as const;

type PendingRemove = { type: HubResourceType; id: string; name: string };

const CrdInnovationHubSettingsPage = ({ tab }: CrdInnovationHubSettingsPageProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const { innovationHubId } = useUrlResolver();
  const guard = useHubAccessGuard(innovationHubId);
  const { hub, loading: hubLoading, refetch } = useInnovationHubSettingsData();
  useEnableSpaceFullWidth();
  const { wide: fullWidth, toggle: toggleFullWidth } = useLayoutWidthPreference();

  const aboutData = useHubAboutTabData(hub);
  const spacesData = useHubSpacesTabData(hub, () => refetch());
  const packsData = useHubPacksTabData(hub, () => refetch());
  const virtualContributorsData = useHubVirtualContributorsTabData(hub, () => refetch());

  const [addDialogType, setAddDialogType] = useState<HubResourceType | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null);

  // Top-bar breadcrumbs: `[PanelsTopLeft] HubName → Settings → ActiveTab`.
  // Same shape as Spaces / Org / User settings, so the topbar replaces the
  // previous "eye" link as the way back to the public hub.
  const breadcrumbItems: BreadcrumbTrailItem[] = hub
    ? [
        { label: hub.profile.displayName, href: buildHubHomePath(hub.nameID), icon: PanelsTopLeft },
        { label: t('breadcrumbs.settings'), href: buildHubSettingsPath(hub.nameID) },
        {
          label: t(
            `settings.tabs.${tab}` as
              | 'settings.tabs.about'
              | 'settings.tabs.spaces'
              | 'settings.tabs.packs'
              | 'settings.tabs.virtualContributors'
          ),
        },
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
    packs: `${settingsBase}/packs`,
    virtualContributors: `${settingsBase}/virtualContributors`,
  };

  const aboutTabValues: HubAboutFormValues = aboutData.values;
  const onSaveSection = (key: HubAboutSectionKey) => aboutData.onSaveSection(key);

  // One data slice per curated resource type — the remove confirmation and the
  // shared Add dialog dispatch on the resource type.
  const tabDataByType = {
    space: spacesData,
    pack: packsData,
    virtualContributor: virtualContributorsData,
  } as const;

  const handleConfirmRemove = () => {
    if (pendingRemove) {
      void tabDataByType[pendingRemove.type].remove(pendingRemove.id);
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
          <InnovationHubAboutTabConnector
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
        {tab === 'spaces' &&
          (hub.spaceVisibilityFilter ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-body text-muted-foreground">
                {t('settings.spaces.visibilityManaged', {
                  visibility: t(VISIBILITY_LABEL_KEY[hub.spaceVisibilityFilter]),
                })}
              </p>
            </div>
          ) : (
            <InnovationHubSpacesTab
              rows={spacesData.rows}
              busy={spacesData.busy}
              onReorder={ids => void spacesData.reorder(ids)}
              onAddClick={() => setAddDialogType('space')}
              onRemoveRequest={row => setPendingRemove({ type: 'space', id: row.id, name: row.name })}
            />
          ))}
        {tab === 'packs' && (
          <InnovationHubPacksTab
            rows={packsData.rows}
            busy={packsData.busy}
            onReorder={ids => void packsData.reorder(ids)}
            onAddClick={() => setAddDialogType('pack')}
            onRemoveRequest={row => setPendingRemove({ type: 'pack', id: row.id, name: row.name })}
          />
        )}
        {tab === 'virtualContributors' && (
          <InnovationHubVirtualContributorsTab
            rows={virtualContributorsData.rows}
            busy={virtualContributorsData.busy}
            onReorder={ids => void virtualContributorsData.reorder(ids)}
            onAddClick={() => setAddDialogType('virtualContributor')}
            onRemoveRequest={row => setPendingRemove({ type: 'virtualContributor', id: row.id, name: row.name })}
          />
        )}
      </InnovationHubSettingsShell>

      {/* Uniform two-tab Add dialog (account candidates + add-by-URL) for all three
          resource types — replaces the former URL-only Add Space dialog (FR-016). */}
      {addDialogType && (
        <CrdAddHubResourceDialog
          open={true}
          onClose={() => setAddDialogType(null)}
          resourceType={addDialogType}
          accountId={hub.account.id}
          existingIds={tabDataByType[addDialogType].rows.map(row => row.id)}
          onAdd={id => tabDataByType[addDialogType].add(id)}
          busy={tabDataByType[addDialogType].busy}
        />
      )}

      <ConfirmationDialog
        open={Boolean(pendingRemove)}
        onOpenChange={next => {
          if (!next) setPendingRemove(null);
        }}
        variant="destructive"
        title={t(CONFIRM_REMOVE_KEYS[pendingRemove?.type ?? 'space'].title)}
        description={t(CONFIRM_REMOVE_KEYS[pendingRemove?.type ?? 'space'].body, {
          name: pendingRemove?.name ?? '',
        })}
        confirmLabel={t(CONFIRM_REMOVE_KEYS[pendingRemove?.type ?? 'space'].confirm)}
        cancelLabel={t(CONFIRM_REMOVE_KEYS[pendingRemove?.type ?? 'space'].cancel)}
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
