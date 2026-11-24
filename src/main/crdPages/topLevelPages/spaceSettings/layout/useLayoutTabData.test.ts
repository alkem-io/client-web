import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { mutationOptions, recordMutation } = vi.hoisted(() => {
  const mutationOptions: Record<string, unknown> = {};
  const recordMutation = (name: string) => (options: unknown) => {
    mutationOptions[name] = options;
    return [() => Promise.resolve({}), { loading: false }];
  };
  return { mutationOptions, recordMutation };
});

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchInnovationFlowSettingsQuery: () => ({}),
  useSpaceSettingsQuery: () => ({ data: undefined, loading: false, error: undefined }),
  useInnovationFlowSettingsQuery: () => ({ data: undefined, loading: false, error: undefined }),
  useUpdateInnovationFlowStateMutation: recordMutation('updateInnovationFlowState'),
  useUpdateInnovationFlowStateSettingsMutation: recordMutation('updateInnovationFlowStateSettings'),
  useUpdateCalloutFlowStateMutation: recordMutation('updateCalloutFlowState'),
  useUpdateCalloutsSortOrderMutation: recordMutation('updateCalloutsSortOrder'),
  useUpdateInnovationFlowStatesSortOrderMutation: recordMutation('updateInnovationFlowStatesSortOrder'),
}));

vi.mock('@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings', () => ({
  default: () => ({ data: { innovationFlow: undefined }, actions: {} }),
}));

import { useLayoutTabData } from './useLayoutTabData';

describe('useLayoutTabData', () => {
  it('shows its own save failure, so the Save mutations opt out of the global error handler', () => {
    renderHook(() => useLayoutTabData('space-1', 'L0'));
    const ownErrorHandling = { context: { skipGlobalErrorHandler: true } };
    expect(mutationOptions).toEqual({
      updateInnovationFlowState: ownErrorHandling,
      // The visibility toggle shows no message of its own.
      updateInnovationFlowStateSettings: undefined,
      updateCalloutFlowState: ownErrorHandling,
      updateCalloutsSortOrder: ownErrorHandling,
      updateInnovationFlowStatesSortOrder: ownErrorHandling,
    });
  });
});
