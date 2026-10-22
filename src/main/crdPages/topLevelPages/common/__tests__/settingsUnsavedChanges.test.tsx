import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import type { TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';

const mockNotify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => mockNotify }));

import {
  SettingsUnsavedChangesContext,
  useSettingsTabUnsavedChanges,
  useSettingsUnsavedChanges,
} from '../settingsUnsavedChanges';

const unsaved = (overrides: Partial<TabUnsavedChanges> = {}): TabUnsavedChanges => ({
  count: 2,
  canSave: true,
  saving: false,
  error: null,
  saveAll: vi.fn().mockResolvedValue(true),
  reset: vi.fn(),
  ...overrides,
});

const Tab = ({ changes }: { changes: TabUnsavedChanges }) => {
  useSettingsTabUnsavedChanges(changes);
  return null;
};

const Page = ({ changes, onTabSelect }: { changes: TabUnsavedChanges; onTabSelect: (tab: string) => void }) => {
  const unsavedChanges = useSettingsUnsavedChanges<string>(onTabSelect);
  return (
    <SettingsUnsavedChangesContext value={unsavedChanges.context}>
      <button type="button" onClick={() => unsavedChanges.onTabChange('account')}>
        Account tab
      </button>
      <Tab changes={changes} />
      {unsavedChanges.element}
    </SettingsUnsavedChangesContext>
  );
};

const renderPage = (changes: TabUnsavedChanges, onTabSelect = vi.fn()) => {
  render(
    <I18nextProvider i18n={i18n}>
      <Page changes={changes} onTabSelect={onTabSelect} />
    </I18nextProvider>
  );
  return onTabSelect;
};

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces(['crd-common', 'crd-space']);
});

beforeEach(() => mockNotify.mockReset());

describe('useSettingsUnsavedChanges', () => {
  it('switches tabs straight away when the active tab has nothing to save', async () => {
    const onTabSelect = renderPage(unsaved({ count: 0 }));
    await userEvent.click(screen.getByRole('button', { name: 'Account tab' }));
    expect(onTabSelect).toHaveBeenCalledWith('account');
  });

  it("shows the tab's change count in the bar and saves from it", async () => {
    const changes = unsaved();
    renderPage(changes);
    expect(screen.getByText('2 unsaved changes')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(changes.saveAll).toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith('Changes saved', 'success');
  });

  it('asks before switching tabs with unsaved changes, and discards them on Discard & leave', async () => {
    const changes = unsaved();
    const onTabSelect = renderPage(changes);

    await userEvent.click(screen.getByRole('button', { name: 'Account tab' }));
    expect(onTabSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Discard & leave' }));
    expect(changes.reset).toHaveBeenCalled();
    expect(onTabSelect).toHaveBeenCalledWith('account');
  });

  it('stays on the tab when saving before leaving fails', async () => {
    const changes = unsaved({ saveAll: vi.fn().mockResolvedValue(false) });
    const onTabSelect = renderPage(changes);

    await userEvent.click(screen.getByRole('button', { name: 'Account tab' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(changes.saveAll).toHaveBeenCalled();
    expect(onTabSelect).not.toHaveBeenCalled();
  });
});
