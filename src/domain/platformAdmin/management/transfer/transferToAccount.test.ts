import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const notify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));

const mutationHookOptions = vi.fn();
const transfer = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => {
  const resolved = (data: unknown) => () => ({ data, loading: false });
  const mutationHook = (name: string) => (options: unknown) => {
    mutationHookOptions(name, options);
    return [transfer, { loading: false }];
  };
  return {
    useVcTransferUrlResolveQuery: resolved({ urlResolver: { virtualContributor: { id: 'vc-1' } } }),
    useVcTransferLookupQuery: resolved({ lookup: { virtualContributor: { id: 'vc-1' } } }),
    useTransferVirtualContributorToAccountMutation: mutationHook('virtualContributor'),
    useInnovationPackTransferUrlResolveQuery: resolved({ urlResolver: { innovationPack: { id: 'pack-1' } } }),
    useInnovationPackTransferLookupQuery: resolved({ lookup: { innovationPack: { id: 'pack-1' } } }),
    useTransferInnovationPackToAccountMutation: mutationHook('innovationPack'),
    useInnovationHubTransferUrlResolveQuery: resolved({ urlResolver: { innovationHubId: 'hub-1' } }),
    useInnovationHubTransferLookupQuery: resolved({ lookup: { innovationHub: { id: 'hub-1' } } }),
    useTransferInnovationHubToAccountMutation: mutationHook('innovationHub'),
  };
});

import useTransferInnovationHub from './transferInnovationHub/useTransferInnovationHub';
import useTransferInnovationPack from './transferInnovationPack/useTransferInnovationPack';
import useTransferVirtualContributor from './transferVirtualContributor/useTransferVirtualContributor';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('transfer to account', () => {
  it.each([
    ['virtualContributor', useTransferVirtualContributor],
    ['innovationPack', useTransferInnovationPack],
    ['innovationHub', useTransferInnovationHub],
  ] as const)("leaves a failed %s transfer to the global error handler, so the server's reason is the one message", async (name, useTransfer) => {
    transfer.mockRejectedValueOnce(
      new ApolloError({ graphQLErrors: [{ message: 'Target account cannot accept', extensions: {} } as never] })
    );
    const { result } = renderHook(() => useTransfer());

    await act(() => result.current.handleTransfer('account-2'));

    expect(transfer).toHaveBeenCalledTimes(1);
    expect(mutationHookOptions).toHaveBeenCalledWith(name, undefined);
    expect(notify).not.toHaveBeenCalled();
  });
});
