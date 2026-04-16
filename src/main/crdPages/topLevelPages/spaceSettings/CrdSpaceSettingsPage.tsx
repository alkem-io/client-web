import {
  Bookmark,
  HardDrive,
  Info,
  Layers,
  LayoutGrid,
  Settings as SettingsIcon,
  UserCircle,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  type SpaceSettingsTabDescriptor,
  SpaceSettingsTabStrip,
} from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import { useDirtyTabGuard } from './useDirtyTabGuard';
import { type SpaceSettingsTabId, useSpaceSettingsTab } from './useSpaceSettingsTab';

/**
 * CrdSpaceSettingsPage — route entry for the CRD Space Settings area.
 *
 * Renders the horizontal tab strip + the active tab's panel. The CRD space
 * hero is provided by the enclosing `CrdSpacePageLayout` — we intentionally do
 * NOT render a second hero here.
 *
 * Per-tab content is stubbed in Checkpoint A; each `<TabStub />` call will be
 * replaced by the corresponding `SpaceSettings<Tab>View` in the matching
 * user-story phase (US1 About, US2 Layout, …).
 */
export default function CrdSpaceSettingsPage() {
  const { t } = useTranslation('crd-spaceSettings');
  const { activeTab, setActiveTab } = useSpaceSettingsTab();
  const guard = useDirtyTabGuard();

  const tabs: ReadonlyArray<SpaceSettingsTabDescriptor<SpaceSettingsTabId>> = [
    { id: 'about', label: t('tabs.about', { defaultValue: 'About' }), icon: Info },
    { id: 'layout', label: t('tabs.layout', { defaultValue: 'Layout' }), icon: LayoutGrid },
    { id: 'community', label: t('tabs.community', { defaultValue: 'Community' }), icon: Users },
    { id: 'subspaces', label: t('tabs.subspaces', { defaultValue: 'Subspaces' }), icon: Layers },
    { id: 'templates', label: t('tabs.templates', { defaultValue: 'Templates' }), icon: Bookmark },
    { id: 'storage', label: t('tabs.storage', { defaultValue: 'Storage' }), icon: HardDrive },
    { id: 'settings', label: t('tabs.settings', { defaultValue: 'Settings' }), icon: SettingsIcon },
    { id: 'account', label: t('tabs.account', { defaultValue: 'Account' }), icon: UserCircle },
  ];

  const onTabChange = async (next: SpaceSettingsTabId) => {
    const allowed = await guard.requestSwitch(next);
    if (allowed) {
      setActiveTab(next);
    }
  };

  const handleConfirmSwitchSave = () => {
    // Save flow is owned by the Layout tab; for Checkpoint A we treat Save as
    // "I want to save, so don't leave yet". The Layout tab will wire its own
    // Save Changes path here in US2.
    guard.resolvePendingSwitch(false);
  };
  const handleConfirmSwitchDiscard = () => {
    guard.clearDirty();
    const target = guard.pendingSwitch;
    guard.resolvePendingSwitch(true);
    if (target) {
      setActiveTab(target);
    }
  };
  const handleConfirmSwitchCancel = () => {
    guard.resolvePendingSwitch(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <SpaceSettingsTabStrip activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      <div className="pb-24">
        <TabStub activeTab={activeTab} />
      </div>

      <ConfirmationDialog
        open={guard.pendingSwitch !== null}
        onOpenChange={open => {
          if (!open) handleConfirmSwitchCancel();
        }}
        variant="discard"
        title={t('dirtyGuard.tabSwitch.title', { defaultValue: 'Unsaved changes' })}
        description={t('dirtyGuard.tabSwitch.description', {
          defaultValue: 'You have unsaved changes on this tab. Save them, discard them, or stay on this tab?',
        })}
        saveLabel={t('dirtyGuard.save', { defaultValue: 'Save' })}
        discardLabel={t('dirtyGuard.discard', { defaultValue: 'Discard & leave' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onSave={handleConfirmSwitchSave}
        onDiscard={handleConfirmSwitchDiscard}
        onCancel={handleConfirmSwitchCancel}
      />
    </div>
  );
}

function TabStub({ activeTab }: { activeTab: SpaceSettingsTabId }) {
  const { t } = useTranslation('crd-spaceSettings');
  return (
    <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
      {t('stubs.placeholder', {
        defaultValue: 'Tab content coming soon: {{tab}}',
        tab: activeTab,
      })}
    </div>
  );
}
