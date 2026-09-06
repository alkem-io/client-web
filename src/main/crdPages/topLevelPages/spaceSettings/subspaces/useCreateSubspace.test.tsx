import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

/** The slice of the mutation options this suite asserts on. */
type SubspaceCreationOptions = {
  refetchQueries: unknown[];
  awaitRefetchQueries: boolean;
};

/** Shape the hook reads off the DefaultVisualTypeConstraints query. */
type VisualConstraintsQueryResult = {
  data?: {
    platform: {
      configuration: {
        defaultVisualTypeConstraints: {
          maxWidth: number;
          maxHeight: number;
          minWidth: number;
          minHeight: number;
          aspectRatio: number;
          allowedTypes: string[];
        };
      };
    };
  };
};

const mockCreateSubspace = vi.fn().mockResolvedValue(undefined);
const mockUseSubspaceCreation = vi.fn((_options: SubspaceCreationOptions) => ({
  createSubspace: mockCreateSubspace,
  loading: false,
}));

vi.mock('@/domain/space/components/CreateSpace/hooks/useSubspaceCreation/useSubspaceCreation', () => ({
  useSubspaceCreation: (options: SubspaceCreationOptions) => mockUseSubspaceCreation(options),
}));

vi.mock('@/main/crdPages/templates/useTemplatePicker', () => ({
  useTemplatePicker: () => ({
    pickerProps: {},
    selectedTemplateId: null,
    openPicker: vi.fn(),
    clearSelection: vi.fn(),
  }),
}));

vi.mock('@/main/crdPages/templates/templateContentMapper', () => ({
  mapTemplateContent: vi.fn(() => undefined),
}));

const mockVisualConstraintsQuery = vi.fn((): VisualConstraintsQueryResult => ({ data: undefined }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchSubspacesInSpaceQuery: (variables: unknown) => ({ query: 'SubspacesInSpace', variables }),
  useDefaultVisualTypeConstraintsQuery: () => mockVisualConstraintsQuery(),
  useTemplateContentLazyQuery: () => [vi.fn()],
}));

import { useCreateSubspace } from './useCreateSubspace';

const constraintsData: NonNullable<VisualConstraintsQueryResult['data']> = {
  platform: {
    configuration: {
      defaultVisualTypeConstraints: {
        maxWidth: 410,
        maxHeight: 128,
        minWidth: 190,
        minHeight: 80,
        aspectRatio: 3.2,
        allowedTypes: ['image/png'],
      },
    },
  },
};

beforeEach(() => {
  mockCreateSubspace.mockClear();
  mockUseSubspaceCreation.mockClear();
  mockVisualConstraintsQuery.mockReturnValue({ data: undefined });
});

describe('useCreateSubspace', () => {
  it('refetches the spaces-collection query so the Subspaces tab updates without a reload', () => {
    renderHook(() => useCreateSubspace('space-1'));

    const options = mockUseSubspaceCreation.mock.calls[0][0];

    // The Subspaces tab and the subspace page render the subspaces through a
    // spaces-collection callout, whose `SpaceCollectionSubspaces` query is not
    // reached by the settings-tab refetch or by the mutation's cache update.
    expect(options.refetchQueries).toContain('SpaceCollectionSubspaces');
    expect(options.refetchQueries).toContainEqual({
      query: 'SubspacesInSpace',
      variables: { spaceId: 'space-1' },
    });
    expect(options.awaitRefetchQueries).toBe(true);
  });

  it('hands a picked avatar to the crop step instead of straight into form state', () => {
    mockVisualConstraintsQuery.mockReturnValue({ data: constraintsData });

    const { result } = renderHook(() => useCreateSubspace('space-1'));

    act(() => result.current.openDialog());
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    act(() => result.current.onChange({ avatarFile: file }));

    // Nothing is a form value yet — the file is pending a crop, which is why a
    // caller that does not mount the crop dialog loses the pick silently.
    expect(result.current.values.avatarFile).toBeNull();
    expect(result.current.pendingCrop).toEqual({
      key: 'avatarFile',
      file,
      config: expect.objectContaining({ aspectRatio: 3.2, maxWidth: 410 }),
    });
  });

  it('submits the cropped avatar and its alt text', async () => {
    mockVisualConstraintsQuery.mockReturnValue({ data: constraintsData });

    const { result } = renderHook(() => useCreateSubspace('space-1'));

    act(() => result.current.openDialog());
    act(() => result.current.onChange({ displayName: 'Nested space' }));
    const picked = new File(['x'], 'avatar.png', { type: 'image/png' });
    act(() => result.current.onChange({ avatarFile: picked }));

    const cropped = new File(['y'], 'avatar-cropped.png', { type: 'image/png' });
    act(() => result.current.onCropComplete(cropped, 'A round logo'));

    expect(result.current.values.avatarFile).toBe(cropped);
    expect(result.current.pendingCrop).toBeNull();

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockCreateSubspace).toHaveBeenCalledWith(
      expect.objectContaining({
        about: expect.objectContaining({
          profile: expect.objectContaining({
            visuals: { avatar: { file: cropped, altText: 'A round logo' }, cardBanner: undefined },
          }),
        }),
      })
    );
  });

  it('carries the tags entered on the creation form into the mutation input', async () => {
    const { result } = renderHook(() => useCreateSubspace('space-1'));

    act(() => result.current.openDialog());
    act(() => result.current.onChange({ displayName: 'Nested space', tags: ['alpha', 'beta'] }));

    expect(result.current.values.tags).toEqual(['alpha', 'beta']);

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockCreateSubspace).toHaveBeenCalledWith(
      expect.objectContaining({
        about: expect.objectContaining({
          profile: expect.objectContaining({ tags: ['alpha', 'beta'] }),
        }),
      })
    );
  });
});
