import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { SaveFailedDialog } from '@/crd/components/common/SaveFailedDialog';
import { UnsavedChangesBar } from '@/crd/components/common/UnsavedChangesBar';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  NO_UNSAVED_CHANGES,
  type TabUnsavedChanges,
  toUnsavedChangesBarState,
} from '@/main/crdPages/utils/tabUnsavedChanges';

type UnsavedChangesSnapshot = Pick<TabUnsavedChanges, 'count' | 'canSave' | 'saveBlockedReason' | 'saving' | 'error'>;

type SettingsUnsavedChangesContextValue = {
  publish: (unsaved: TabUnsavedChanges) => void;
};

export const SettingsUnsavedChangesContext = createContext<SettingsUnsavedChangesContextValue | null>(null);

const sameSnapshot = (a: UnsavedChangesSnapshot, b: UnsavedChangesSnapshot) =>
  a.count === b.count &&
  a.canSave === b.canSave &&
  a.saveBlockedReason === b.saveBlockedReason &&
  a.saving === b.saving &&
  a.error === b.error;

/**
 * Tab side: hands the tab's buffered changes to the settings page, which shows
 * the unsaved-changes bar and guards tab switches (spec 097 Session 2026-10-22).
 */
export const useSettingsTabUnsavedChanges = (unsaved: TabUnsavedChanges) => {
  const context = useContext(SettingsUnsavedChangesContext);
  useEffect(() => {
    context?.publish(unsaved);
  });
  useEffect(() => () => context?.publish(NO_UNSAVED_CHANGES), [context]);
};

/**
 * Page side, for the User / Organization / VC settings shells: the active tab
 * publishes its changes through `context`; `onTabChange` asks to save or discard
 * them before switching tabs; `element` renders the bar, the Discard confirmation,
 * the leave dialog and the save-failed dialog, and arms the browser's reload/close
 * confirm while dirty.
 */
export const useSettingsUnsavedChanges = <TabId,>(onTabSelect: (next: TabId) => void) => {
  const { t } = useTranslation('crd-common');
  const notify = useNotification();
  const latest = useRef<TabUnsavedChanges>(NO_UNSAVED_CHANGES);
  const [snapshot, setSnapshot] = useState<UnsavedChangesSnapshot>(NO_UNSAVED_CHANGES);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<{ id: TabId } | null>(null);
  const [savingToLeave, setSavingToLeave] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [reloadRequested, setReloadRequested] = useState(false);

  // Stable for the page's lifetime, so a tab's unmount cleanup only runs when the tab actually unmounts.
  const [context] = useState<SettingsUnsavedChangesContextValue>(() => ({
    publish: unsaved => {
      latest.current = unsaved;
      const { count, canSave, saveBlockedReason, saving, error } = unsaved;
      setSnapshot(prev => (sameSnapshot(prev, unsaved) ? prev : { count, canSave, saveBlockedReason, saving, error }));
    },
  }));

  const dirty = snapshot.count > 0;
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Reload only once the discarded buffer has disarmed the reload confirm above — the
  // user already chose to drop the changes, so the browser must not ask a second time.
  useEffect(() => {
    if (reloadRequested && !dirty) window.location.reload();
  }, [reloadRequested, dirty]);

  const onTabChange = (next: TabId) => {
    // No switch (and so no leave dialog) while the bar's Save is writing — its Save would start a
    // second, concurrent write and its Discard would drop a buffer that is still being saved.
    if (snapshot.saving) return;
    if (dirty) setPendingTab({ id: next });
    else onTabSelect(next);
  };

  const save = async () => {
    if (!latest.current.canSave) return;
    if (await latest.current.saveAll()) notify(t('unsavedChanges.saved'), 'success');
    else setSaveFailed(true);
  };

  const leave = () => {
    if (!pendingTab) return;
    setPendingTab(null);
    onTabSelect(pendingTab.id);
  };

  const saveAndLeave = async () => {
    // Invalid edits are never sent — the dialog's Save is disabled for them, as the bar's is.
    if (savingToLeave || !latest.current.canSave) return;
    setSavingToLeave(true);
    const saved = await latest.current.saveAll().finally(() => setSavingToLeave(false));
    if (saved) {
      leave();
      return;
    }
    // Stay on this tab with the changes still buffered; the save-failed dialog takes over.
    setPendingTab(null);
    setSaveFailed(true);
  };

  const element = (
    <>
      {/* Room below the last control, so the bar never covers it. */}
      {dirty && <div aria-hidden="true" className="h-20" />}
      <UnsavedChangesBar
        state={toUnsavedChangesBarState({ ...latest.current, ...snapshot })}
        onSave={() => void save()}
        onDiscard={() => setDiscardOpen(true)}
      />
      <ConfirmationDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        variant="destructive"
        title={t('unsavedChanges.discardDialog.title', { count: snapshot.count })}
        description={t('unsavedChanges.discardDialog.description')}
        confirmLabel={t('unsavedChanges.discardDialog.confirm')}
        cancelLabel={t('cancel')}
        onConfirm={() => {
          latest.current.reset();
          setDiscardOpen(false);
        }}
        onCancel={() => setDiscardOpen(false)}
      />
      <ConfirmationDialog
        open={pendingTab !== null}
        onOpenChange={open => {
          if (!open) setPendingTab(null);
        }}
        variant="discard"
        title={t('unsavedChanges.leaveDialog.title')}
        description={t('unsavedChanges.leaveDialog.description')}
        saveLabel={t('unsavedChanges.leaveDialog.save')}
        discardLabel={t('unsavedChanges.leaveDialog.discard')}
        cancelLabel={t('cancel')}
        loading={savingToLeave}
        saveDisabled={!snapshot.canSave}
        onSave={() => void saveAndLeave()}
        onDiscard={() => {
          latest.current.reset();
          leave();
        }}
        onCancel={() => setPendingTab(null)}
      />
      <SaveFailedDialog
        open={saveFailed}
        message={snapshot.error}
        onRefresh={() => {
          latest.current.reset();
          setReloadRequested(true);
        }}
        onClose={() => setSaveFailed(false)}
      />
    </>
  );

  return { context, onTabChange, element };
};
