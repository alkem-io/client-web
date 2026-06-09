import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminTransferPage from '../CrdAdminTransferPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const hubHook = {
  hub: undefined as unknown,
  currentAccountName: undefined,
  error: undefined,
  loading: false,
  transferLoading: false,
  handleResolve: vi.fn(),
  handleTransfer: vi.fn(),
};
const packHook = {
  pack: undefined as unknown,
  currentAccountName: undefined,
  error: undefined,
  loading: false,
  transferLoading: false,
  handleResolve: vi.fn(),
  handleTransfer: vi.fn(),
};
const vcHook = {
  vc: undefined as unknown,
  currentAccountName: undefined,
  error: undefined,
  loading: false,
  transferLoading: false,
  handleResolve: vi.fn(),
  handleTransfer: vi.fn(),
};
const vcConversionHook = {
  vc: undefined as unknown,
  isSpaceBased: false,
  isAlreadyConverted: false,
  accountOwnerName: undefined,
  error: undefined,
  loading: false,
  convertLoading: false,
  handleResolve: vi.fn(),
  handleConvert: vi.fn(),
};

vi.mock('@/domain/platformAdmin/management/transfer/transferInnovationHub/useTransferInnovationHub', () => ({
  default: () => hubHook,
}));
vi.mock('@/domain/platformAdmin/management/transfer/transferInnovationPack/useTransferInnovationPack', () => ({
  default: () => packHook,
}));
vi.mock('@/domain/platformAdmin/management/transfer/transferVirtualContributor/useTransferVirtualContributor', () => ({
  default: () => vcHook,
}));
vi.mock('@/domain/platformAdmin/management/transfer/vcConversion/useVcConversion', () => ({
  default: () => vcConversionHook,
}));
const spaceTransferHook = {
  space: undefined as unknown,
  accountOwner: undefined as unknown,
  spaceError: undefined,
  ownerError: undefined,
  spaceLoading: false,
  ownerLoading: false,
  transferLoading: false,
  handleSpaceSubmit: vi.fn(),
  handleAccountOwnerSubmit: vi.fn(),
  handleTransfer: vi.fn(),
};
const calloutTransferHook = {
  callout: undefined as unknown,
  calloutsSetId: undefined as unknown,
  calloutError: undefined,
  spaceError: undefined,
  calloutLoading: false,
  spaceLoading: false,
  transferLoading: false,
  handleCalloutSubmit: vi.fn(),
  handleSpaceSubmit: vi.fn(),
  handleTransfer: vi.fn(),
};
vi.mock('@/domain/platformAdmin/management/transfer/transferSpace/useTransferSpace', () => ({
  default: () => spaceTransferHook,
}));
vi.mock('@/domain/platformAdmin/management/transfer/transferCallout/useTransferCallout', () => ({
  default: () => calloutTransferHook,
}));
vi.mock('@/domain/platformAdmin/management/transfer/shared/useAccountSearch', () => ({
  default: () => ({ searchTerm: '', results: [], loading: false, hasSearched: false, handleSearch: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  hubHook.hub = undefined;
  vcConversionHook.vc = undefined;
  vcConversionHook.isSpaceBased = false;
  vcConversionHook.isAlreadyConverted = false;
  spaceTransferHook.space = undefined;
  spaceTransferHook.accountOwner = undefined;
  calloutTransferHook.callout = undefined;
  calloutTransferHook.calloutsSetId = undefined;
});

describe('CrdAdminTransferPage', () => {
  test('shows the destructive warning and both operation areas', () => {
    render(<CrdAdminTransferPage />);
    expect(screen.getByText('transfer.warning')).toBeInTheDocument();
    expect(screen.getByText('transfer.conversionsArea')).toBeInTheDocument();
    expect(screen.getByText('transfer.transfersArea')).toBeInTheDocument();
    // Hub/Pack/VC transfer + VC conversion titles present.
    expect(screen.getByText('transfer.hub.title')).toBeInTheDocument();
    expect(screen.getByText('transfer.vcConversion.title')).toBeInTheDocument();
  });

  test('resolving an Innovation Hub URL calls the reused hook', async () => {
    render(<CrdAdminTransferPage />);
    const hubCard = screen.getByText('transfer.hub.title').closest('div')?.parentElement as HTMLElement;
    const input = within(hubCard).getByRole('textbox');
    await userEvent.type(input, 'https://example.com/hub');
    await userEvent.click(within(hubCard).getByRole('button', { name: 'transfer.resolve' }));
    expect(hubHook.handleResolve).toHaveBeenCalledWith('https://example.com/hub');
  });

  test('a resolved, eligible VC conversion confirms then converts', async () => {
    vcConversionHook.vc = { id: 'vc1' };
    vcConversionHook.isSpaceBased = true;
    render(<CrdAdminTransferPage />);
    await userEvent.click(screen.getByRole('button', { name: 'transfer.vcConversion.convert' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'transfer.vcConversion.convert' }));
    expect(vcConversionHook.handleConvert).toHaveBeenCalled();
  });

  test('space transfer resolves source + target and transfers after confirm', async () => {
    spaceTransferHook.space = { id: 's1' };
    spaceTransferHook.accountOwner = { name: 'Org A', accountId: 'a1' };
    render(<CrdAdminTransferPage />);
    const card = screen.getByText('transfer.spaceTransfer.title').closest('div')?.parentElement as HTMLElement;
    const [sourceInput, targetInput] = within(card).getAllByRole('textbox');
    await userEvent.type(sourceInput, 'https://x/space');
    await userEvent.type(targetInput, 'https://x/org');
    const resolveButtons = within(card).getAllByRole('button', { name: 'transfer.resolve' });
    await userEvent.click(resolveButtons[0]);
    await userEvent.click(resolveButtons[1]);
    expect(spaceTransferHook.handleSpaceSubmit).toHaveBeenCalledWith('https://x/space');
    expect(spaceTransferHook.handleAccountOwnerSubmit).toHaveBeenCalledWith('https://x/org');
    // Both resolved → Transfer action enabled; confirm fires handleTransfer.
    await userEvent.click(within(card).getByRole('button', { name: 'transfer.transfer' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'transfer.transfer' }));
    expect(spaceTransferHook.handleTransfer).toHaveBeenCalled();
  });
});
