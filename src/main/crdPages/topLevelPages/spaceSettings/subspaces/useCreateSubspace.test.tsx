import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

/** The slice of the mutation options this suite asserts on. */
type SubspaceCreationOptions = {
  refetchQueries: unknown[];
  awaitRefetchQueries: boolean;
};

type Constraints = {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  allowedTypes: string[];
};

const mockCreateSubspace = vi.fn().mockResolvedValue(undefined);
const mockUseSubspaceCreation = vi.fn((_options: SubspaceCreationOptions) => ({
  createSubspace: mockCreateSubspace,
  loading: false,
}));

vi.mock('@/domain/space/components/CreateSpace/hooks/useSubspaceCreation/useSubspaceCreation', () => ({
  useSubspaceCreation: (options: SubspaceCreationOptions) => mockUseSubspaceCreation(options),
}));

const pickerArgs: unknown[] = [];
const mockFetchSpaceTemplate = vi.fn();
vi.mock('@/main/crdPages/templates/spaceTemplates/useSpaceTemplatePicker', () => ({
  useSpaceTemplatePicker: (args: unknown) => {
    pickerArgs.push(args);
    return {
      pickerProps: {},
      selectedTemplateId: null,
      openPicker: vi.fn(),
      clearSelection: vi.fn(),
      fetchSpaceTemplate: mockFetchSpaceTemplate,
    };
  },
}));

let mockDefault: { templateId?: string; templateName?: string; loading: boolean } = { loading: false };
const defaultArgs: unknown[][] = [];
vi.mock('@/main/crdPages/templates/spaceTemplates/useSubspaceDefaultTemplate', () => ({
  useSubspaceDefaultTemplate: (...args: unknown[]) => {
    defaultArgs.push(args);
    return mockDefault;
  },
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ levelZeroSpaceId: 'root-1' }) }));
vi.mock('@/domain/space/components/CreateSpace/hooks/useCreateDialogMarkdown', () => ({
  useCreateDialogMarkdown: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({ useApolloErrorHandler: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

const mockConstraintsFor = vi.fn((): Constraints | null => null);
vi.mock('@/domain/space/components/CreateSpace/hooks/useSpaceVisualConstraints', () => ({
  useSpaceVisualConstraints: () => ({ constraintsFor: () => mockConstraintsFor() }),
}));

vi.mock('@/core/apollo/generated-v2/apollo-hooks', () => ({
  useCreateSubspaceRootQuery: () => ({
    data: { node: { id: 'root-1', host: { id: 'org-1', account: { id: 'account-9' } } } },
  }),
}));

import { useCreateSubspace } from './useCreateSubspace';

const constraintsData: Constraints = {
  maxWidth: 410,
  maxHeight: 128,
  minWidth: 190,
  minHeight: 80,
  aspectRatio: 3.2,
  allowedTypes: ['image/png'],
};

beforeEach(() => {
  mockCreateSubspace.mockClear();
  mockUseSubspaceCreation.mockClear();
  mockConstraintsFor.mockReturnValue(null);
  pickerArgs.length = 0;
  defaultArgs.length = 0;
  mockDefault = { loading: false };
  mockFetchSpaceTemplate.mockReset();
});

describe('useCreateSubspace', () => {
  it('re-reads the parent subspace list through NativeSubspaces after the create (023 FR-020)', () => {
    renderHook(() => useCreateSubspace('space-1'));

    const options = mockUseSubspaceCreation.mock.calls[0][0];

    expect(options.refetchQueries).toEqual(['NativeSubspaces']);
    expect(options.awaitRefetchQueries).toBe(true);
  });

  it('submits under the parent with the template the picker holds', async () => {
    const { result } = renderHook(() => useCreateSubspace('space-1'));

    act(() => result.current.openDialog());
    act(() => result.current.onChange({ displayName: '  Nested space  ', tagline: ' Tag ' }));

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockCreateSubspace).toHaveBeenCalledWith({
      parentId: 'space-1',
      profile: { displayName: 'Nested space', tagline: 'Tag', description: undefined, tags: [] },
      visuals: { avatar: undefined, card: undefined },
      spaceTemplateId: undefined,
    });
  });

  it('hands a picked avatar to the crop step instead of straight into form state', () => {
    mockConstraintsFor.mockReturnValue(constraintsData);

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
    mockConstraintsFor.mockReturnValue(constraintsData);

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
        visuals: { avatar: { file: cropped, altText: 'A round logo' }, card: undefined },
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
        profile: expect.objectContaining({ tags: ['alpha', 'beta'] }),
      })
    );
  });

  it('scopes the picker to the root space and the root host account (item9 "Who sends what")', () => {
    renderHook(() => useCreateSubspace('space-1'));
    expect(pickerArgs[pickerArgs.length - 1]).toEqual({ rootSpaceId: 'root-1', accountId: 'account-9' });
    expect(defaultArgs[defaultArgs.length - 1]).toEqual(['root-1', true]);
  });

  it('preselects, previews and submits the root subspace_default when the dialog opens', async () => {
    mockDefault = { templateId: 'tpl-a', templateName: 'A', loading: false };
    mockFetchSpaceTemplate.mockResolvedValue({
      content: { type: 'space', phases: [] },
      prefill: { templateName: 'A', displayName: 'From A', tagline: 'T', description: 'D', tags: ['xy'] },
    });
    const { result } = renderHook(() => useCreateSubspace('space-1'));

    await act(async () => {
      result.current.openDialog();
      await Promise.resolve();
    });

    expect(mockFetchSpaceTemplate).toHaveBeenCalledWith('tpl-a');
    expect(result.current.values.spaceTemplateId).toBe('tpl-a');
    expect(result.current.selectedTemplateName).toBe('A');
    expect(result.current.values.displayName).toBe('From A');

    await act(async () => {
      await result.current.onSubmit();
    });
    expect(mockCreateSubspace).toHaveBeenCalledWith(expect.objectContaining({ spaceTemplateId: 'tpl-a' }));
  });

  it('preselects nothing and omits the template when the root default is absent or masked', async () => {
    mockDefault = { loading: false };
    const { result } = renderHook(() => useCreateSubspace('space-1'));

    await act(async () => {
      result.current.openDialog();
      await Promise.resolve();
    });
    act(() => result.current.onChange({ displayName: 'Plain space' }));
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockFetchSpaceTemplate).not.toHaveBeenCalled();
    expect(mockCreateSubspace).toHaveBeenCalledWith(expect.objectContaining({ spaceTemplateId: undefined }));
  });

  it('Clear empties a preselected default so the submit omits the template', async () => {
    mockDefault = { templateId: 'tpl-a', templateName: 'A', loading: false };
    mockFetchSpaceTemplate.mockResolvedValue({
      content: { type: 'space', phases: [] },
      prefill: { templateName: 'A', displayName: 'From A', tagline: '', description: '', tags: [] },
    });
    const { result } = renderHook(() => useCreateSubspace('space-1'));
    await act(async () => {
      result.current.openDialog();
      await Promise.resolve();
    });

    act(() => result.current.onClearTemplate());
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockCreateSubspace).toHaveBeenCalledWith(expect.objectContaining({ spaceTemplateId: undefined }));
  });
});
