import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { createState, updateStatesSortOrder, otherMutation } = vi.hoisted(() => ({
  createState: vi.fn((_options: unknown) =>
    Promise.resolve({ data: { createStateOnInnovationFlow: { id: 'state-new' } } })
  ),
  updateStatesSortOrder: vi.fn((_options: unknown) => Promise.resolve({})),
  otherMutation: () => [() => Promise.resolve({}), { loading: false }],
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchInnovationFlowSettingsQuery: () => ({}),
  useInnovationFlowSettingsQuery: () => ({
    data: {
      lookup: {
        collaboration: {
          id: 'collab-1',
          calloutsSet: { id: 'set-1', callouts: [] },
          innovationFlow: { id: 'flow-1', states: [{ id: 'state-1', sortOrder: 1 }] },
        },
      },
    },
    loading: false,
    refetch: vi.fn(),
  }),
  useCreateStateOnInnovationFlowMutation: () => [createState, { loading: false }],
  useUpdateInnovationFlowStatesSortOrderMutation: () => [updateStatesSortOrder, { loading: false }],
  useDeleteStateOnInnovationFlowMutation: otherMutation,
  useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation: otherMutation,
  useSetDefaultCalloutTemplateOnInnovationFlowStateMutation: otherMutation,
  useUpdateCalloutFlowStateMutation: otherMutation,
  useUpdateCalloutsSortOrderMutation: otherMutation,
  useUpdateCollaborationFromSpaceTemplateMutation: otherMutation,
  useUpdateInnovationFlowCurrentStateMutation: otherMutation,
  useUpdateInnovationFlowMutation: otherMutation,
  useUpdateInnovationFlowStateMutation: otherMutation,
}));

vi.mock('@/core/utils/ensurePresence', () => ({ default: () => (value: unknown) => value }));

import useInnovationFlowSettings from './useInnovationFlowSettings';

describe('useInnovationFlowSettings — createState', () => {
  it('is reported by the Add phase dialog itself, so its mutations opt out of the global error handler', async () => {
    const { result } = renderHook(() => useInnovationFlowSettings({ collaborationId: 'collab-1' }));

    await act(async () => {
      await result.current.actions.createState({
        displayName: 'New phase',
        description: '',
        sortOrder: 0,
        settings: { allowNewCallouts: true },
      });
    });

    const ownErrorHandling = expect.objectContaining({ context: { skipGlobalErrorHandler: true } });
    expect(createState).toHaveBeenCalledWith(ownErrorHandling);
    expect(updateStatesSortOrder).toHaveBeenCalledWith(ownErrorHandling);
  });
});
