import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { AccountTargetTransfer } from './AccountTargetTransfer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const handleSearch = vi.fn();
let mockDenied = false;
const mockResults: Array<{ id: string; accountId: string; name: string }> = [];

vi.mock('@/domain/platformAdmin/management/transfer/shared/useAccountSearch', () => ({
  default: () => ({
    results: mockResults,
    loading: false,
    hasSearched: false,
    denied: mockDenied,
    handleSearch,
    searchTerm: '',
  }),
}));

let mockAccountOwner: { name?: string; accountId?: string } | undefined;
const mockOwnerSubmit = vi.fn();

vi.mock('@/domain/platformAdmin/management/transfer/shared/useAccountOwnerByUrl', () => ({
  default: () => ({
    accountOwner: mockAccountOwner,
    ownerError: undefined,
    ownerLoading: false,
    submit: mockOwnerSubmit,
  }),
}));

const baseProps = {
  title: 'Transfer Innovation Hub',
  resolved: true,
  loading: false,
  transferLoading: false,
  onResolve: vi.fn(),
  onTransfer: vi.fn(),
};

describe('AccountTargetTransfer', () => {
  test('shows the normal account picker when the search is not denied', () => {
    mockDenied = false;
    render(<AccountTargetTransfer {...baseProps} />);
    expect(screen.getByPlaceholderText('transfer.accountSearchPlaceholder')).toBeInTheDocument();
    expect(screen.queryByLabelText('transfer.targetOwnerUrlLabel')).toBeNull();
  });

  // client-1: with search denied, the picker's search box still renders (with
  // an error line instead of "no accounts"), and an owner-by-URL fallback
  // field appears alongside it.
  test('with search denied, typing into the account search reveals the owner-URL fallback field', async () => {
    mockDenied = true;
    render(<AccountTargetTransfer {...baseProps} />);
    await userEvent.type(screen.getByPlaceholderText('transfer.accountSearchPlaceholder'), 'al');
    expect(screen.getByLabelText('transfer.targetOwnerUrlLabel')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('transfer.accountSearchDenied');
  });

  test('resolving an owner via the fallback field enables transfer with that account id', async () => {
    mockDenied = true;
    mockAccountOwner = undefined;
    const onTransfer = vi.fn();
    const { rerender } = render(<AccountTargetTransfer {...baseProps} onTransfer={onTransfer} />);

    mockAccountOwner = { name: 'Alice', accountId: 'acc-9' };
    rerender(<AccountTargetTransfer {...baseProps} onTransfer={onTransfer} />);

    await userEvent.click(screen.getByRole('button', { name: 'transfer.transfer' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'transfer.transfer' }));
    expect(onTransfer).toHaveBeenCalledWith('acc-9');
  });
});
