import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import { TagsetReservedName, TagsetType, VisualType } from '@/core/apollo/generated/graphql-schema';

const updateInnovationHubMock = vi.fn();
const uploadVisualMock = vi.fn();
const uploadVisualLoading = { current: false };

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateInnovationHubMutation: () => [updateInnovationHubMock, { loading: false }] as const,
  useUploadVisualMutation: () => [uploadVisualMock, { loading: uploadVisualLoading.current }] as const,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const { useHubAboutTabData } = await import('../hooks/useHubAboutTabData');

const baseHub: InnovationHubSettingsFragment = {
  id: 'hub-1',
  subdomain: 'demo',
  spaceVisibilityFilter: undefined,
  profile: {
    id: 'profile-1',
    displayName: 'Demo Innovation Hub',
    description: 'Existing description',
    tagline: 'tagline',
    tagset: {
      id: 'tagset-1',
      name: TagsetReservedName.Default,
      tags: ['alpha'],
      allowedValues: [],
      type: TagsetType.Freeform,
    },
    visual: {
      id: 'banner-1',
      uri: 'https://example.com/banner.png',
      alternativeText: 'banner alt',
      name: VisualType.Banner,
      maxHeight: 800,
      maxWidth: 1200,
      minHeight: 100,
      minWidth: 200,
      aspectRatio: 1.5,
      allowedTypes: ['image/png'],
    },
    url: '/hub/demo',
  },
  spaceListFilter: [],
};

beforeEach(() => {
  updateInnovationHubMock.mockReset();
  uploadVisualMock.mockReset();
  uploadVisualLoading.current = false;
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useHubAboutTabData', () => {
  test('seeds local values from the hub on first render', () => {
    const { result } = renderHook(() => useHubAboutTabData(baseHub));
    // After the seeding effect runs, values match the mapper output.
    expect(result.current.values.subdomain).toBe('demo');
    expect(result.current.values.name).toBe('Demo Innovation Hub');
    expect(result.current.values.tags).toEqual(['alpha']);
  });

  test('onChange flips the dirty flag for the changed section only', () => {
    const { result } = renderHook(() => useHubAboutTabData(baseHub));
    act(() => result.current.onChange({ name: 'New Name' }));
    expect(result.current.dirty.name).toBe(true);
    // subdomain stays false because the field is read-only (immutable post-creation).
    expect(result.current.dirty.subdomain).toBe(false);
    expect(result.current.dirty.tagline).toBe(false);
  });

  test('onSaveSection blocks the mutation on invalid input and surfaces the error', () => {
    const { result } = renderHook(() => useHubAboutTabData(baseHub));
    act(() => result.current.onChange({ name: '' }));
    act(() => result.current.onSaveSection('name'));
    expect(updateInnovationHubMock).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe('settings.about.name.errors.required');
    expect(result.current.saveStatus.name).toBeUndefined();
  });

  test('onSaveSection fires updateInnovationHub with the matching partial profile input', async () => {
    updateInnovationHubMock.mockResolvedValue({ data: { updateInnovationHub: { id: 'hub-1' } } });
    const { result } = renderHook(() => useHubAboutTabData(baseHub));

    act(() => result.current.onChange({ name: 'New Display Name' }));
    await act(async () => {
      result.current.onSaveSection('name');
    });

    expect(updateInnovationHubMock).toHaveBeenCalledWith({
      variables: { hubData: { ID: 'hub-1', profileData: { displayName: 'New Display Name' } } },
    });
    await waitFor(() => expect(result.current.saveStatus.name).toBe('saved'));
  });

  test('saved status auto-clears to idle after the flash window', async () => {
    updateInnovationHubMock.mockResolvedValue({ data: { updateInnovationHub: { id: 'hub-1' } } });
    const { result } = renderHook(() => useHubAboutTabData(baseHub));

    act(() => result.current.onChange({ tagline: 'new tagline' }));
    await act(async () => {
      result.current.onSaveSection('tagline');
    });
    await waitFor(() => expect(result.current.saveStatus.tagline).toBe('saved'));

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    await waitFor(() => expect(result.current.saveStatus.tagline).toBe('idle'));
  });

  test('mutation rejection surfaces an error and restores idle', async () => {
    updateInnovationHubMock.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useHubAboutTabData(baseHub));

    act(() => result.current.onChange({ name: 'Different Name' }));
    await act(async () => {
      result.current.onSaveSection('name');
    });
    await waitFor(() => expect(result.current.errors.name).toContain('boom'));
    expect(result.current.saveStatus.name).toBe('idle');
  });

  test('onBannerFileSelected fires uploadVisual against the banner visual id', async () => {
    uploadVisualMock.mockResolvedValue({
      data: { uploadImageOnVisual: { uri: 'https://new.example/banner2.png', alternativeText: 'alt' } },
    });
    const { result } = renderHook(() => useHubAboutTabData(baseHub));

    const file = new File(['data'], 'banner.png', { type: 'image/png' });
    await act(async () => {
      result.current.onBannerFileSelected(file);
    });

    expect(uploadVisualMock).toHaveBeenCalledWith({
      variables: { file, uploadData: { visualID: 'banner-1' } },
    });
    await waitFor(() => expect(result.current.values.bannerImageUrl).toBe('https://new.example/banner2.png'));
  });
});
