import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mutationOptions: Record<string, unknown> = {};

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorQuery: () => ({ data: undefined, loading: false, error: undefined, refetch: vi.fn() }),
  useUpdateVirtualContributorMutation: (options: unknown) => {
    mutationOptions.updateVc = options;
    return [vi.fn(), { loading: false }];
  },
  useCreateReferenceOnProfileMutation: (options: unknown) => {
    mutationOptions.createReference = options;
    return [vi.fn(), { loading: false }];
  },
  useDeleteReferenceMutation: (options: unknown) => {
    mutationOptions.deleteReference = options;
    return [vi.fn(), { loading: false }];
  },
  useCreateTagsetOnProfileMutation: (options: unknown) => {
    mutationOptions.createTagset = options;
    return [vi.fn(), { loading: false }];
  },
  useUploadVisualMutation: () => [vi.fn(), { loading: false }],
}));

import { useVcProfileTabData } from '../useVcProfileTabData';

describe('useVcProfileTabData', () => {
  it('shows its own save failure, so its save mutations opt out of the global error handler', () => {
    renderHook(() => useVcProfileTabData('vc-1'));
    const ownErrorHandling = { context: { skipGlobalErrorHandler: true } };
    expect(mutationOptions).toEqual({
      updateVc: ownErrorHandling,
      createReference: ownErrorHandling,
      deleteReference: ownErrorHandling,
      createTagset: ownErrorHandling,
    });
  });
});
