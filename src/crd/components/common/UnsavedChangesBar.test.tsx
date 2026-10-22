import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { UnsavedChangesBar, type UnsavedChangesBarState } from './UnsavedChangesBar';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-common');
});

const renderBar = (state: UnsavedChangesBarState, handlers = { onSave: vi.fn(), onDiscard: vi.fn() }) => {
  render(
    <I18nextProvider i18n={i18n}>
      <UnsavedChangesBar state={state} {...handlers} />
    </I18nextProvider>
  );
  return handlers;
};

describe('UnsavedChangesBar', () => {
  it('shows the count in the circle and a pluralised label', () => {
    renderBar({ kind: 'dirty', count: 1, canSave: true });
    expect(screen.getByText('1 unsaved change')).toBeInTheDocument();
  });

  it('pluralises above one', () => {
    renderBar({ kind: 'dirty', count: 3, canSave: true });
    expect(screen.getByText('3', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('3 unsaved changes')).toBeInTheDocument();
  });

  it('calls Save and Discard', async () => {
    const handlers = renderBar({ kind: 'dirty', count: 2, canSave: true });
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(handlers.onSave).toHaveBeenCalledTimes(1);
    expect(handlers.onDiscard).toHaveBeenCalledTimes(1);
  });

  it('disables Save while a change is invalid', () => {
    renderBar({ kind: 'dirty', count: 1, canSave: false });
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('disables both buttons and announces saving while saving', () => {
    renderBar({ kind: 'saving', count: 2 });
    expect(screen.getByText('Saving…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save changes/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
  });

  it('shows the error and keeps Save available to retry', () => {
    renderBar({ kind: 'saveError', count: 1, message: 'Network down' });
    expect(screen.getByRole('alert')).toHaveTextContent('Network down');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  it('is hidden and inert when there is nothing to save', () => {
    renderBar({ kind: 'clean' });
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });
});
