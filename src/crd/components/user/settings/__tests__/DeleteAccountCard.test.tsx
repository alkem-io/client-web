import { fireEvent, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import type { DeleteAccountDialogState } from '../DeleteAccount.types';
import { DeleteAccountCard } from '../DeleteAccountCard';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const DISPLAY_NAME = 'Ada Lovelace';

const renderCard = (props: Partial<Parameters<typeof DeleteAccountCard>[0]> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <DeleteAccountCard
        displayName={DISPLAY_NAME}
        dialog={{ kind: 'closed' }}
        onOpen={vi.fn()}
        onTypedNameChange={vi.fn()}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        onDialogOpenChange={vi.fn()}
        accountResourcesUrl="/user/ada/settings/account"
        {...props}
      />
    </I18nextProvider>
  );

describe('DeleteAccountCard', () => {
  it('renders irreversibility copy and a destructive trigger', () => {
    renderCard();

    // Scoped to <p> so an ancestor wrapper (whose concatenated text also
    // contains this substring) can never produce an ambiguous match.
    expect(screen.getByText(/immediate and permanent/i, { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument();
  });

  it('clicking the trigger runs the pre-flight (onOpen) — it does not open a dialog by itself', () => {
    const onOpen = vi.fn();
    renderCard({ onOpen });

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    // The trigger itself never opens a dialog directly — only the connector's
    // preflight result (via the `dialog` prop) does, so a stale session never
    // reaches a dialog here at all.
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('mismatched typed name keeps the destructive confirm disabled', () => {
    const dialog: DeleteAccountDialogState = {
      kind: 'confirm',
      typedName: 'not the right name',
      deleting: false,
      error: false,
      externalSubscriptionLinked: false,
    };
    renderCard({ dialog });

    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeDisabled();
  });

  it('exact typed name enables the destructive confirm', () => {
    const dialog: DeleteAccountDialogState = {
      kind: 'confirm',
      typedName: DISPLAY_NAME,
      deleting: false,
      error: false,
      externalSubscriptionLinked: false,
    };
    renderCard({ dialog });

    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeEnabled();
  });

  it('confirming with the exact name calls onConfirm', () => {
    const onConfirm = vi.fn();
    const dialog: DeleteAccountDialogState = {
      kind: 'confirm',
      typedName: DISPLAY_NAME,
      deleting: false,
      error: false,
      externalSubscriptionLinked: false,
    };
    renderCard({ dialog, onConfirm });

    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('is locked while a deletion is in flight — no double-submit', () => {
    const dialog: DeleteAccountDialogState = {
      kind: 'confirm',
      typedName: DISPLAY_NAME,
      deleting: true,
      error: false,
      externalSubscriptionLinked: false,
    };
    renderCard({ dialog });

    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
  });

  it('surfaces the stored subscription linkage as an information line, never as a blocker', () => {
    const dialog: DeleteAccountDialogState = {
      kind: 'confirm',
      typedName: '',
      deleting: false,
      error: false,
      externalSubscriptionLinked: true,
    };
    renderCard({ dialog });

    expect(screen.getByText(/active subscription linked/i, { selector: 'p' })).toBeInTheDocument();
    // The confirm action stays available — the subscription never blocks deletion.
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeInTheDocument();
  });

  it('renders the blocked dialog itemizing what blocks deletion, not the confirm dialog', () => {
    const dialog: DeleteAccountDialogState = {
      kind: 'blocked',
      blockers: [
        {
          kind: 'ACCOUNT_SPACE',
          resourceID: 'space-1',
          displayName: 'My Space',
          url: '/my-space',
          selfResolvable: true,
        },
      ],
      totals: [{ kind: 'ACCOUNT_SPACE', total: 1 }],
      truncated: false,
    };
    renderCard({ dialog });

    expect(screen.getByText('My Space')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows a preflight error without opening any dialog', () => {
    renderCard({ dialog: { kind: 'preflight-error' } });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables the trigger while the pre-flight is loading', () => {
    renderCard({ dialog: { kind: 'preflight-loading' } });

    expect(screen.getByRole('button', { name: 'Delete account' })).toBeDisabled();
  });
});
