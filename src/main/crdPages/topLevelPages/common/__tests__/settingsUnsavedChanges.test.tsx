import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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

// Like a real tab, Discard empties the buffer, so the page sees the tab go clean.
const Tab = ({ changes }: { changes: TabUnsavedChanges }) => {
  const [count, setCount] = useState(changes.count);
  useSettingsTabUnsavedChanges({
    ...changes,
    count,
    reset: () => {
      changes.reset();
      setCount(0);
    },
  });
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

  it('stays on the tab when saving before leaving fails, and shows the error with a way to refresh', async () => {
    const changes = unsaved({ saveAll: vi.fn().mockResolvedValue(false), error: 'Classification entry not found' });
    const onTabSelect = renderPage(changes);

    await userEvent.click(screen.getByRole('button', { name: 'Account tab' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(changes.saveAll).toHaveBeenCalled();
    expect(onTabSelect).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog', { name: "Your changes couldn't be saved" });
    expect(dialog).toHaveTextContent('Classification entry not found');
    expect(screen.getByRole('button', { name: 'Refresh page' })).toBeInTheDocument();
  });

  it('disables Save in the leave dialog while the changes are invalid, as the bar does', async () => {
    const changes = unsaved({ canSave: false });
    const onTabSelect = renderPage(changes);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Account tab' }));
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    await userEvent.click(save);
    expect(changes.saveAll).not.toHaveBeenCalled();
    expect(onTabSelect).not.toHaveBeenCalled();
    // Leaving without the invalid edits is still possible.
    expect(screen.getByRole('button', { name: 'Discard & leave' })).toBeEnabled();
  });

  describe('after a failed Save from the bar', () => {
    const originalLocation = window.location;
    const reload = vi.fn();
    beforeEach(() => {
      reload.mockReset();
      Object.defineProperty(window, 'location', { value: { ...originalLocation, reload }, writable: true });
    });
    afterEach(() => {
      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });

    it('Refresh page drops the changes before reloading, so the browser does not ask again', async () => {
      const changes = unsaved({ saveAll: vi.fn().mockResolvedValue(false), error: 'Network error' });
      renderPage(changes);
      const beforeUnload = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(beforeUnload);
      expect(beforeUnload.defaultPrevented).toBe(true);

      await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
      expect(mockNotify).not.toHaveBeenCalled();
      await userEvent.click(await screen.findByRole('button', { name: 'Refresh page' }));

      expect(changes.reset).toHaveBeenCalled();
      expect(reload).toHaveBeenCalledTimes(1);
      const afterReset = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(afterReset);
      expect(afterReset.defaultPrevented).toBe(false);
    });

    it('Close keeps the changes buffered', async () => {
      const changes = unsaved({ saveAll: vi.fn().mockResolvedValue(false), error: 'Network error' });
      renderPage(changes);

      await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Close' }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(changes.reset).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
      expect(screen.getByText('2 unsaved changes')).toBeInTheDocument();
    });
  });
});
