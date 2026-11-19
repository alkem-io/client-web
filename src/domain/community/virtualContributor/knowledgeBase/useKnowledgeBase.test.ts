import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { mutationOptions } = vi.hoisted(() => ({ mutationOptions: {} as Record<string, unknown> }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet', () => ({
  default: () => ({
    callouts: undefined,
    canCreateCallout: false,
    loading: false,
    refetchCallouts: vi.fn(),
    refetchCallout: vi.fn(),
    onCalloutsSortOrderUpdate: vi.fn(),
  }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorKnowledgePrivilegesQuery: () => ({ data: undefined, loading: false }),
  useVirtualContributorKnowledgeBaseQuery: () => ({ data: undefined, loading: false }),
  useUpdateVirtualContributorMutation: (options: unknown) => {
    mutationOptions.updateVC = options;
    return [vi.fn(), { loading: false }];
  },
  useRefreshBodyOfKnowledgeMutation: () => [vi.fn(), { loading: false }],
}));

import useKnowledgeBase from './useKnowledgeBase';

describe('useKnowledgeBase', () => {
  it('leaves a failed description save to its caller, which shows its own message, so it opts out of the global error handler', () => {
    renderHook(() => useKnowledgeBase({ id: 'vc-1' }));
    expect(mutationOptions.updateVC).toEqual(expect.objectContaining({ context: { skipGlobalErrorHandler: true } }));
  });
});
