import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';

const { hookOptions, updateInnovationHub, toastError } = vi.hoisted(() => ({
  hookOptions: [] as unknown[],
  updateInnovationHub: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: toastError } }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateInnovationHubMutation: (options: unknown) => {
    hookOptions.push(options);
    return [updateInnovationHub, { loading: false }];
  },
}));

import { useHubPacksTabData } from '../hooks/useHubPacksTabData';
import { useHubSpacesTabData } from '../hooks/useHubSpacesTabData';
import { useHubVirtualContributorsTabData } from '../hooks/useHubVirtualContributorsTabData';

const hub = {
  id: 'hub-1',
  spaceListFilter: [],
  innovationPackListFilter: [],
  virtualContributorListFilter: [],
} as unknown as InnovationHubSettingsFragment;

describe('Innovation Hub Spaces / Virtual Contributors / Packs tabs', () => {
  beforeEach(() => {
    hookOptions.length = 0;
    vi.clearAllMocks();
  });

  it.each([
    ['Spaces', useHubSpacesTabData],
    ['Virtual Contributors', useHubVirtualContributorsTabData],
    ['Packs', useHubPacksTabData],
  ])("the %s tab leaves a failed update to the global error handler, so the server's reason is the one message", async (_tab, useTabData) => {
    updateInnovationHub.mockRejectedValueOnce(
      new ApolloError({ graphQLErrors: [{ message: 'Refused', extensions: { code: 'OPERATION_NOT_ALLOWED' } }] })
    );
    const { result } = renderHook(() => useTabData(hub, () => Promise.resolve()));

    await act(async () => {
      await result.current.add('item-1');
    });

    expect(hookOptions[hookOptions.length - 1]).toBeUndefined();
    expect(toastError).not.toHaveBeenCalled();
  });
});
