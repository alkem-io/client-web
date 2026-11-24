import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { VcProfileFormValues } from '@/crd/components/virtualContributor/settings/VCProfileTabView.types';

const savedValues: VcProfileFormValues = {
  profileId: 'profile-1',
  displayName: 'Helper',
  tagline: 'Answers questions',
  description: '',
  keywords: { id: 'tagset-keywords', tags: [] },
  avatar: { id: 'visual-avatar', uri: null, altText: null },
  references: [],
};

const mutationOptions: Record<string, unknown> = {};

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorQuery: () => ({
    data: { lookup: { virtualContributor: { id: 'vc-1' } } },
    loading: false,
    error: undefined,
    refetch: vi.fn(),
  }),
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

vi.mock('../vcProfileMapper', () => ({
  mapVirtualContributorToProfileFormValues: () => savedValues,
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

describe('useVcProfileTabData — reset', () => {
  it('puts the buffer back to the saved values and increments resetGeneration', () => {
    const { result } = renderHook(() => useVcProfileTabData('vc-1'));
    const before = result.current.resetGeneration;

    act(() => result.current.onChange({ tagline: 'Changed' }));
    act(() => result.current.unsaved.reset());

    expect(result.current.values?.tagline).toBe('Answers questions');
    expect(result.current.resetGeneration).toBe(before + 1);
  });
});
