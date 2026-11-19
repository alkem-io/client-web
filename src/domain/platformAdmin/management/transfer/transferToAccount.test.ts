import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

const mutationHookOptions = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => {
  const idleQuery = () => ({ data: undefined, loading: false });
  const mutationHook = (name: string) => (options: unknown) => {
    mutationHookOptions(name, options);
    return [vi.fn(), { loading: false }];
  };
  return {
    useVcTransferUrlResolveQuery: idleQuery,
    useVcTransferLookupQuery: idleQuery,
    useTransferVirtualContributorToAccountMutation: mutationHook('virtualContributor'),
    useInnovationPackTransferUrlResolveQuery: idleQuery,
    useInnovationPackTransferLookupQuery: idleQuery,
    useTransferInnovationPackToAccountMutation: mutationHook('innovationPack'),
    useInnovationHubTransferUrlResolveQuery: idleQuery,
    useInnovationHubTransferLookupQuery: idleQuery,
    useTransferInnovationHubToAccountMutation: mutationHook('innovationHub'),
  };
});

import useTransferInnovationHub from './transferInnovationHub/useTransferInnovationHub';
import useTransferInnovationPack from './transferInnovationPack/useTransferInnovationPack';
import useTransferVirtualContributor from './transferVirtualContributor/useTransferVirtualContributor';

describe('transfer to account', () => {
  it('runs each transfer without the global error handler, so a failure toasts once', () => {
    renderHook(() => {
      useTransferVirtualContributor();
      useTransferInnovationPack();
      useTransferInnovationHub();
    });

    const own = { context: { skipGlobalErrorHandler: true } };
    expect(mutationHookOptions).toHaveBeenCalledWith('virtualContributor', own);
    expect(mutationHookOptions).toHaveBeenCalledWith('innovationPack', own);
    expect(mutationHookOptions).toHaveBeenCalledWith('innovationHub', own);
  });
});
