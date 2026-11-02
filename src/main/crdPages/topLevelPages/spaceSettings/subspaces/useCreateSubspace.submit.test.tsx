import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Only the network boundary is mocked here: the real `useSubspaceCreation` and
// `useUploadVisualsOnCreate` run underneath `useCreateSubspace`, so the submit
// guard, the dialog close and the navigation are exercised over the same
// create → visual upload sequence the app runs.

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void; reject: (reason: unknown) => void };
const deferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const NEW_SUBSPACE_URL = 'https://alkem.io/parent/challenges/new-subspace';

const mutationResult = {
  data: {
    createSubspace: {
      id: 'subspace-new',
      about: {
        profile: {
          id: 'profile-new',
          url: NEW_SUBSPACE_URL,
          avatar: { id: 'visual-avatar' },
          cardBanner: { id: 'visual-card' },
        },
      },
    },
  },
};

const mockCreateSubspaceMutation = vi.fn();
const mockUploadVisual = vi.fn();
const mockNavigate = vi.fn();
const mockNotify = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchSubspacesInSpaceQuery: (variables: unknown) => ({ query: 'SubspacesInSpace', variables }),
  refetchCurrentUserLightQuery: () => ({ query: 'CurrentUserLight' }),
  SubspaceCardFragmentDoc: {},
  useCreateSubspaceMutation: () => [mockCreateSubspaceMutation, { loading: false }],
  useUploadVisualMutation: () => [mockUploadVisual],
  useDefaultVisualTypeConstraintsQuery: () => ({ data: undefined }),
  useTemplateContentLazyQuery: () => [vi.fn()],
}));

vi.mock('@/core/routing/useNavigate', () => ({ default: () => mockNavigate }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => mockNotify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ isFeatureEnabled: () => false }) }));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ spaceId: 'space-1' }) }));
vi.mock('@/main/crdPages/templates/useTemplatePicker', () => ({
  useTemplatePicker: () => ({
    pickerProps: {},
    selectedTemplateId: null,
    openPicker: vi.fn(),
    clearSelection: vi.fn(),
  }),
}));
vi.mock('@/main/crdPages/templates/templateContentMapper', () => ({ mapTemplateContent: vi.fn() }));

import { type UseCreateSubspaceOptions, useCreateSubspace } from './useCreateSubspace';

/** Opens the dialog and fills a valid form; with an avatar, the create is followed by a visual upload. */
const renderFilledForm = (
  options: UseCreateSubspaceOptions = {},
  { withAvatar = false, withCardBanner = false } = {}
) => {
  const hook = renderHook(() => useCreateSubspace('space-1', options));
  act(() => hook.result.current.openDialog());
  act(() => hook.result.current.onChange({ displayName: 'New subspace' }));
  if (withAvatar) {
    // No visual constraints are loaded, so the pick goes straight into form state.
    act(() => hook.result.current.onChange({ avatarFile: new File(['x'], 'avatar.png', { type: 'image/png' }) }));
  }
  if (withCardBanner) {
    act(() => hook.result.current.onChange({ cardBannerFile: new File(['y'], 'card.png', { type: 'image/png' }) }));
  }
  return hook;
};

beforeEach(() => {
  mockCreateSubspaceMutation.mockReset().mockResolvedValue(mutationResult);
  mockUploadVisual.mockReset().mockResolvedValue({});
  mockNavigate.mockReset();
  mockNotify.mockReset();
});

describe('useCreateSubspace submit', () => {
  it('creates exactly one subspace when the button is clicked twice before the first click re-renders', async () => {
    const mutation = deferred<typeof mutationResult>();
    mockCreateSubspaceMutation.mockReturnValueOnce(mutation.promise);
    const { result } = renderFilledForm();

    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      // Same handler instance, same tick — nothing has re-rendered between the two clicks.
      const { onSubmit } = result.current;
      first = onSubmit();
      second = onSubmit();
    });
    await act(async () => {
      mutation.resolve(mutationResult);
      await Promise.all([first, second]);
    });

    expect(mockCreateSubspaceMutation).toHaveBeenCalledTimes(1);
  });

  it('keeps the submit disabled while the visual upload runs, so a click during it creates nothing', async () => {
    const upload = deferred<unknown>();
    mockUploadVisual.mockReturnValueOnce(upload.promise);
    const { result } = renderFilledForm({}, { withAvatar: true });

    let first!: Promise<void>;
    await act(async () => {
      first = result.current.onSubmit();
      // Let the mutation resolve; the upload stays pending.
      await Promise.resolve();
    });

    expect(mockCreateSubspaceMutation).toHaveBeenCalledTimes(1);
    expect(mockUploadVisual).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(true);
    expect(result.current.submitting).toBe(true);
    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      await result.current.onSubmit();
    });
    expect(mockCreateSubspaceMutation).toHaveBeenCalledTimes(1);

    await act(async () => {
      upload.resolve({});
      await first;
    });
    expect(result.current.open).toBe(false);
    expect(result.current.submitting).toBe(false);
  });

  it('closes the dialog and still lands on the new subspace when the visual upload fails', async () => {
    mockUploadVisual.mockRejectedValueOnce(new Error('upload failed'));
    const { result } = renderFilledForm({ navigateOnCreate: true }, { withAvatar: true });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockCreateSubspaceMutation).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(result.current.open).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith(NEW_SUBSPACE_URL);
  });

  it('waits for every visual upload to settle before closing when one upload fails first', async () => {
    const cardUpload = deferred<unknown>();
    mockUploadVisual.mockRejectedValueOnce(new Error('avatar upload failed')).mockReturnValueOnce(cardUpload.promise);
    const { result } = renderFilledForm({ navigateOnCreate: true }, { withAvatar: true, withCardBanner: true });

    let first!: Promise<void>;
    await act(async () => {
      first = result.current.onSubmit();
      // Let the mutation resolve and the avatar upload reject; the card upload stays pending.
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });

    expect(mockUploadVisual).toHaveBeenCalledTimes(2);
    expect(result.current.open).toBe(true);
    expect(result.current.submitting).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();

    await act(async () => {
      cardUpload.resolve({});
      await first;
    });
    expect(mockNotify).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(result.current.open).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith(NEW_SUBSPACE_URL);
  });

  it.each([
    ['the Space tab sidebar (member UI)', { navigateOnCreate: true }],
    ['the subspace page (member UI)', { navigateOnCreate: true }],
  ])('navigates to the new subspace from %s', async (_caller, options: UseCreateSubspaceOptions) => {
    const { result } = renderFilledForm(options);

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.open).toBe(false);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(NEW_SUBSPACE_URL);
  });

  it('stays on the page when creating from Settings → Subspaces (the default)', async () => {
    const { result } = renderFilledForm();

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.open).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and allows a retry when the create itself fails', async () => {
    mockCreateSubspaceMutation.mockRejectedValueOnce(new Error('create failed'));
    const { result } = renderFilledForm();

    await act(async () => {
      await expect(result.current.onSubmit()).rejects.toThrow('create failed');
    });

    expect(result.current.open).toBe(true);
    expect(result.current.canSubmit).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onSubmit();
    });
    expect(mockCreateSubspaceMutation).toHaveBeenCalledTimes(2);
    expect(result.current.open).toBe(false);
  });
});
