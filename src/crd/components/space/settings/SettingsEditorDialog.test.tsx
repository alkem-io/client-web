import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { SettingsEditorDialog } from './SettingsEditorDialog';

const renderDialog = (saving: boolean) =>
  render(
    <I18nextProvider i18n={i18n}>
      <SettingsEditorDialog
        open={true}
        title="Application form"
        isDirty={true}
        canSave={true}
        saving={saving}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onDiscard={vi.fn()}
        onClose={vi.fn()}
      >
        <textarea aria-label="Description" />
      </SettingsEditorDialog>
    </I18nextProvider>
  );

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces(['crd-spaceSettings']);
});

describe('SettingsEditorDialog', () => {
  it('freezes the editor body while saving — the buffer is cleared once the write resolves', async () => {
    renderDialog(true);
    const body = (await screen.findByLabelText('Description')).parentElement;
    expect(body).toHaveAttribute('inert');
    expect(body).toHaveAttribute('aria-busy', 'true');
  });

  it('leaves the editor body editable otherwise', async () => {
    renderDialog(false);
    expect((await screen.findByLabelText('Description')).parentElement).not.toHaveAttribute('inert');
  });
});
