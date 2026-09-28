import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import useTransferSpace from './useTransferSpace';

let mockSpaceResolveData: Record<string, unknown> | undefined;
let mockSpaceData: Record<string, unknown> | undefined;
const mockTransferMutation = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceTransferUrlResolveQuery: () => ({ data: mockSpaceResolveData, loading: false }),
  useSpaceTransferLookupQuery: () => ({ data: mockSpaceData, loading: false }),
  useTransferSpaceToAccountMutation: () => [mockTransferMutation, { loading: false }],
}));

let mockAccountOwner: { name?: string; accountId?: string } | undefined;
const mockOwnerSubmit = vi.fn();

vi.mock('../shared/useAccountOwnerByUrl', () => ({
  default: () => ({
    accountOwner: mockAccountOwner,
    ownerError: undefined,
    ownerLoading: false,
    submit: mockOwnerSubmit,
  }),
}));

const mockNotify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mockNotify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('useTransferSpace', () => {
  test('handleTransfer does nothing without a resolved space and a target account', async () => {
    mockSpaceResolveData = undefined;
    mockSpaceData = undefined;
    mockAccountOwner = undefined;
    const { result } = renderHook(() => useTransferSpace());
    await act(async () => {
      await result.current.handleTransfer();
    });
    expect(mockTransferMutation).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
  });

  test('a successful transfer calls notify with the success message', async () => {
    mockSpaceResolveData = { urlResolver: { state: 'Resolved', space: { id: 'space-1', level: 'L0' } } };
    mockSpaceData = { lookup: { space: { id: 'space-1', account: { authorization: { myPrivileges: [] } } } } };
    mockAccountOwner = { name: 'Alice', accountId: 'acc-1' };
    mockTransferMutation.mockResolvedValueOnce({ data: { transferSpaceToAccount: { id: 'space-1' } } });

    const { result } = renderHook(() => useTransferSpace());
    await act(async () => {
      await result.current.handleTransfer();
    });

    expect(mockTransferMutation).toHaveBeenCalledWith({
      variables: { spaceId: 'space-1', targetAccountId: 'acc-1' },
    });
    expect(mockNotify).toHaveBeenCalledWith('pages.admin.transferSpace.successMessage', 'success');
  });

  // client-1: a rejected mutation (e.g. FORBIDDEN_POLICY) must resolve, not
  // reject — the caller has nowhere to catch a thrown error.
  test('a rejected transfer (FORBIDDEN_POLICY) resolves and notifies the error', async () => {
    mockSpaceResolveData = { urlResolver: { state: 'Resolved', space: { id: 'space-1', level: 'L0' } } };
    mockSpaceData = { lookup: { space: { id: 'space-1', account: { authorization: { myPrivileges: [] } } } } };
    mockAccountOwner = { name: 'Alice', accountId: 'acc-1' };
    mockTransferMutation.mockRejectedValueOnce(
      new ApolloError({ graphQLErrors: [{ message: 'Not authorized', extensions: { code: 'FORBIDDEN_POLICY' } }] })
    );

    const { result } = renderHook(() => useTransferSpace());
    await expect(
      act(async () => {
        await result.current.handleTransfer();
      })
    ).resolves.not.toThrow();

    expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
  });
});
