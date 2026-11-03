import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const referenceUpload = vi.hoisted(() => ({ uploading: false }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
}));
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  useStorageConfigContext: () => undefined,
}));
vi.mock('@/main/crdPages/utils/useReferenceFileUpload', () => ({
  useReferenceFileUpload: () => ({
    onFileUpload: undefined,
    accept: undefined,
    canUpload: false,
    uploading: referenceUpload.uploading,
  }),
}));

const communityGuidelines = {
  displayName: 'Guidelines',
  description: 'Be kind',
  references: [],
};
vi.mock('@/domain/community/community/CommunityGuidelines/useCommunityGuidelines', () => ({
  default: () => ({
    communityGuidelines,
    profileId: 'profile-1',
    loading: false,
    onUpdateCommunityGuidelines: vi.fn(),
    onSelectCommunityGuidelinesTemplate: vi.fn(),
  }),
}));

import { useCommunityGuidelinesData } from './useCommunityGuidelinesData';

describe('useCommunityGuidelinesData — Save while reference files upload', () => {
  afterEach(() => {
    referenceUpload.uploading = false;
  });

  it('withholds Save and reports referenceUploading while an upload runs', () => {
    referenceUpload.uploading = true;
    const { result } = renderHook(() => useCommunityGuidelinesData('cg-1'));

    act(() => result.current.onChange({ title: 'Renamed' }));
    expect(result.current.isDirty).toBe(true);
    expect(result.current.canSave).toBe(false);
    expect(result.current.referenceUploading).toBe(true);
  });

  it('allows Save of a dirty value when no upload runs', () => {
    const { result } = renderHook(() => useCommunityGuidelinesData('cg-1'));

    act(() => result.current.onChange({ title: 'Renamed' }));
    expect(result.current.canSave).toBe(true);
    expect(result.current.referenceUploading).toBe(false);
  });
});

describe('useCommunityGuidelinesData — Discard', () => {
  it('each reset drops the local edits and increments resetGeneration', () => {
    const { result } = renderHook(() => useCommunityGuidelinesData('cg-1'));
    const before = result.current.resetGeneration;

    act(() => result.current.onChange({ title: 'Renamed' }));
    act(() => result.current.onReset());
    expect(result.current.isDirty).toBe(false);
    expect(result.current.resetGeneration).toBe(before + 1);
    act(() => result.current.onReset());
    expect(result.current.resetGeneration).toBe(before + 2);
  });
});
