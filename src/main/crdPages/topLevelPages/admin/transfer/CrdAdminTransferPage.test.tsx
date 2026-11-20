import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import CrdAdminTransferPage from './CrdAdminTransferPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let mockSpace: { id?: string } | undefined;
let mockAccountOwner: { name?: string; accountId?: string } | undefined;

vi.mock('@/domain/platformAdmin/management/transfer/transferSpace/useTransferSpace', () => ({
  default: () => ({
    space: mockSpace,
    accountOwner: mockAccountOwner,
    isL0Space: true,
    hasSpaceTransferOffer: true,
    hasAccountTransferAccept: true,
    spaceLoading: false,
    ownerLoading: false,
    transferLoading: false,
    spaceError: undefined,
    ownerError: undefined,
    handleSpaceSubmit: vi.fn(),
    handleAccountOwnerSubmit: vi.fn(),
    handleTransfer: vi.fn(),
  }),
}));

// The other transfer/conversion panels are out of scope for this page test —
// stub them to their "nothing resolved yet" shape so they render without a
// live Apollo tree, and never contribute a `transfer.transfer` button.
vi.mock('@/domain/platformAdmin/management/transfer/spaceConversion/useSpaceConversion', () => ({
  default: () => ({}),
}));
vi.mock('@/domain/platformAdmin/management/transfer/vcConversion/useVcConversion', () => ({ default: () => ({}) }));
vi.mock('@/domain/platformAdmin/management/transfer/transferInnovationHub/useTransferInnovationHub', () => ({
  default: () => ({}),
}));
vi.mock('@/domain/platformAdmin/management/transfer/transferInnovationPack/useTransferInnovationPack', () => ({
  default: () => ({}),
}));
vi.mock('@/domain/platformAdmin/management/transfer/transferVirtualContributor/useTransferVirtualContributor', () => ({
  default: () => ({}),
}));
vi.mock('@/domain/platformAdmin/management/transfer/transferCallout/useTransferCallout', () => ({
  default: () => ({}),
}));

// AccountTargetTransfer (used by the Hub/Pack/VC panels) calls these
// unconditionally — stub them so it never reaches real Apollo hooks.
vi.mock('@/domain/platformAdmin/management/transfer/shared/useAccountSearch', () => ({
  default: () => ({ results: [], loading: false, hasSearched: false, denied: false, handleSearch: vi.fn() }),
}));
vi.mock('@/domain/platformAdmin/management/transfer/shared/useAccountOwnerByUrl', () => ({
  default: () => ({ accountOwner: undefined, ownerError: undefined, ownerLoading: false, submit: vi.fn() }),
}));

describe('CrdAdminTransferPage', () => {
  // client-1: a resolved owner with no accessible account must never enable
  // the transfer action — the head's `Boolean(space && accountOwner)` check
  // ignored a missing accountId.
  test('renders no Transfer action for the space panel when the owner has no accessible account', () => {
    mockSpace = { id: 'space-1' };
    mockAccountOwner = { name: 'Alice', accountId: undefined };
    render(<CrdAdminTransferPage />);
    expect(screen.queryByRole('button', { name: 'transfer.transfer' })).toBeNull();
  });

  test('renders the Transfer action for the space panel once both space and an accessible account resolve', () => {
    mockSpace = { id: 'space-1' };
    mockAccountOwner = { name: 'Alice', accountId: 'acc-1' };
    render(<CrdAdminTransferPage />);
    expect(screen.getByRole('button', { name: 'transfer.transfer' })).toBeInTheDocument();
  });
});
