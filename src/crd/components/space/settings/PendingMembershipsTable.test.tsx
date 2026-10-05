import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import spaceSettingsEn from '@/crd/i18n/spaceSettings/spaceSettings.en.json';
import { TooltipProvider } from '@/crd/primitives/tooltip';
import { type PendingMembership, PendingMembershipsTable } from './PendingMembershipsTable';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-spaceSettings': spaceSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const row = (
  overrides: Partial<PendingMembership> & Pick<PendingMembership, 'id' | 'displayName'>
): PendingMembership => ({
  type: 'application',
  state: 'new',
  contributorType: 'user',
  createdDate: '2026-09-01T00:00:00.000Z',
  canApprove: false,
  canReject: false,
  canDelete: false,
  canResend: false,
  ...overrides,
});

const renderTable = (
  items: PendingMembership[],
  extra: { onResend?: (id: string) => void; resendingIds?: ReadonlySet<string> } = {}
) =>
  render(
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <PendingMembershipsTable
          items={items}
          onView={vi.fn()}
          onApprove={vi.fn()}
          onReject={vi.fn()}
          onDelete={vi.fn()}
          {...extra}
        />
      </TooltipProvider>
    </I18nextProvider>
  );

// Every action control carries an aria-label; the relative-date tooltip trigger is also a
// <button> but is not an action.
const actionButtons = (tr: HTMLElement) =>
  within(tr)
    .getAllByRole('button')
    .filter(b => b.hasAttribute('aria-label'));

const rowOf = (name: string) => {
  const tr = screen.getByText(name).closest('tr');
  if (!tr) throw new Error(`no row for ${name}`);
  return tr;
};

describe('PendingMembershipsTable — transient rows', () => {
  it('lists an approving application and an accepting invitation, labelled as in flight, with every action disabled', () => {
    renderTable([
      row({ id: 'app-1', displayName: 'Grace Hopper', state: 'approving' }),
      row({ id: 'inv-1', displayName: 'Alan Turing', type: 'invitation', state: 'accepting' }),
      row({ id: 'app-2', displayName: 'Ada Lovelace', state: 'new', canApprove: true, canReject: true }),
    ]);

    const approving = rowOf('Grace Hopper');
    expect(within(approving).getByText('Approving…')).toBeInTheDocument();
    const approvingButtons = actionButtons(approving);
    expect(approvingButtons).toHaveLength(1);
    expect(approvingButtons[0]).toBeDisabled();

    const accepting = rowOf('Alan Turing');
    expect(within(accepting).getByText('Accepting…')).toBeInTheDocument();
    const acceptingButtons = actionButtons(accepting);
    expect(acceptingButtons).toHaveLength(1);
    expect(acceptingButtons[0]).toBeDisabled();

    // A regular pending row keeps its enabled actions.
    const pending = rowOf('Ada Lovelace');
    expect(within(pending).getByText('Application received')).toBeInTheDocument();
    const enabled = actionButtons(pending).filter(b => !(b as HTMLButtonElement).disabled);
    expect(enabled).toHaveLength(3);
  });

  it('counts a transient row under the pending chip it is leaving', () => {
    renderTable([row({ id: 'app-1', displayName: 'Grace Hopper', state: 'approving' })]);

    expect(screen.getByRole('button', { name: 'Application received (1)' })).toBeInTheDocument();
  });
});

describe('PendingMembershipsTable — resend', () => {
  const externalRow = (overrides: Partial<PendingMembership> = {}) =>
    row({
      id: 'pi-1',
      displayName: 'new@example.com',
      email: 'new@example.com',
      type: 'platformInvitation',
      state: 'invited',
      canDelete: true,
      canResend: true,
      ...overrides,
    });

  it('renders the resend control only for rows that can be resent', () => {
    renderTable([externalRow(), row({ id: 'app-1', displayName: 'Grace Hopper', canDelete: true })], {
      onResend: vi.fn(),
    });
    expect(
      within(rowOf('new@example.com')).getByRole('button', { name: 'Resend invitation email' })
    ).toBeInTheDocument();
    expect(
      within(rowOf('Grace Hopper')).queryByRole('button', { name: 'Resend invitation email' })
    ).not.toBeInTheDocument();
  });

  it('hides the control when no handler is supplied', () => {
    renderTable([externalRow()]);
    expect(screen.queryByRole('button', { name: 'Resend invitation email' })).not.toBeInTheDocument();
  });

  it('calls onResend with the row id', async () => {
    const onResend = vi.fn();
    renderTable([externalRow()], { onResend });
    await userEvent.click(screen.getByRole('button', { name: 'Resend invitation email' }));
    expect(onResend).toHaveBeenCalledWith('pi-1');
  });

  it('disables the control while that row is in flight', () => {
    renderTable([externalRow()], { onResend: vi.fn(), resendingIds: new Set(['pi-1']) });
    expect(screen.getByRole('button', { name: 'Resend invitation email' })).toBeDisabled();
  });
});
