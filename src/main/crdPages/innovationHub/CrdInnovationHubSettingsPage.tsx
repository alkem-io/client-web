import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { type HubAboutFormValues, InnovationHubAboutTab } from '@/crd/components/innovationHub/InnovationHubAboutTab';
import { InnovationHubSettingsShell } from '@/crd/components/innovationHub/InnovationHubSettingsShell';
import { type HubSpacesTableRow, InnovationHubSpacesTab } from '@/crd/components/innovationHub/InnovationHubSpacesTab';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useEnableSpaceFullWidth } from '@/main/ui/layout/LayoutWidthContext';
import type { HubAboutSectionKey, HubSettingsTabKey } from './CrdInnovationHubSettingsPage.types';
import { mapInnovationHubToSettingsHeader } from './dataMappers/mapInnovationHubToSettingsHeader';
import { CrdAddSpaceByUrlDialog } from './dialogs/CrdAddSpaceByUrlDialog';
import { useHubAboutTabData } from './hooks/useHubAboutTabData';
import { useHubAccessGuard } from './hooks/useHubAccessGuard';
import { useHubSpacesTabData } from './hooks/useHubSpacesTabData';
import { useHubWidthPreference } from './hooks/useHubWidthPreference';
import { useInnovationHubSettingsData } from './hooks/useInnovationHubSettingsData';

type CrdInnovationHubSettingsPageProps = {
  tab: HubSettingsTabKey;
};

const CrdInnovationHubSettingsPage = ({ tab }: CrdInnovationHubSettingsPageProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const { innovationHubId } = useUrlResolver();
  const guard = useHubAccessGuard(innovationHubId);
  const { hub, loading: hubLoading, refetch } = useInnovationHubSettingsData();
  useEnableSpaceFullWidth();
  const { wide: fullWidth, toggle: toggleFullWidth } = useHubWidthPreference(hub?.id);

  const aboutData = useHubAboutTabData(hub);
  const spacesData = useHubSpacesTabData(hub, () => refetch());

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<HubSpacesTableRow | null>(null);

  if (guard.state === 'denied') {
    return <Navigate to={guard.redirectTo} replace={true} />;
  }

  if (guard.state === 'loading' || hubLoading || !hub) {
    return <Loading />;
  }

  const header = mapInnovationHubToSettingsHeader(hub);
  const settingsBase = buildSettingsUrl(`/hub/${hub.subdomain}`);
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
    </StorageConfigContextProvider>
  );
};

export default CrdInnovationHubSettingsPage;
