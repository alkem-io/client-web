import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const useCurrentUserContextMock = vi.fn();
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => useCurrentUserContextMock(),
}));

const useCrdEnabledMock = vi.fn();
const writeDesignVersionToStorageMock = vi.fn();
vi.mock('./useCrdEnabled', () => ({
  DESIGN_VERSION_OLD: 1,
  DESIGN_VERSION_NEW: 2,
  useCrdEnabled: () => useCrdEnabledMock(),
  writeDesignVersionToStorage: (version: 1 | 2) => writeDesignVersionToStorageMock(version),
}));

const updateUserSettingsMock = vi.fn();
const useUpdateUserSettingsMutationMock = vi.fn(() => [updateUserSettingsMock, { loading: false }]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => useUpdateUserSettingsMutationMock(),
}));

const logInfoMock = vi.fn();
vi.mock('@/core/logging/sentry/log', () => ({
  info: (message: string, tags?: unknown) => logInfoMock(message, tags),
  TagCategoryValues: { UI: 'UI' },
}));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notifyMock,
}));

const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { reload: reloadMock },
});

import { useDesignVersionToggle } from './useDesignVersionToggle';

describe('useDesignVersionToggle', () => {
  beforeEach(() => {
    useCurrentUserContextMock.mockReset();
    useCrdEnabledMock.mockReset();
    writeDesignVersionToStorageMock.mockReset();
    updateUserSettingsMock.mockReset();
    useUpdateUserSettingsMutationMock.mockReset();
    useUpdateUserSettingsMutationMock.mockReturnValue([updateUserSettingsMock, { loading: false }]);
    logInfoMock.mockReset();
    notifyMock.mockReset();
    reloadMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('isVisible is false for anonymous user', () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: undefined,
      isAuthenticated: false,
      loadingMe: false,
    });
    useCrdEnabledMock.mockReturnValue(false);

    const { result } = renderHook(() => useDesignVersionToggle());

    expect(result.current).toEqual({ isVisible: false });
  });

  test('isVisible is false while the current user is still loading', () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: undefined,
      isAuthenticated: true,
      loadingMe: true,
    });
    useCrdEnabledMock.mockReturnValue(false);

    const { result } = renderHook(() => useDesignVersionToggle());

    expect(result.current).toEqual({ isVisible: false });
  });

  test('isVisible is false when the userID is missing', () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: {},
      isAuthenticated: true,
      loadingMe: false,
    });
    useCrdEnabledMock.mockReturnValue(false);

    const { result } = renderHook(() => useDesignVersionToggle());

    expect(result.current).toEqual({ isVisible: false });
  });

  test('isVisible is true for a fully loaded authenticated user; enabled mirrors useCrdEnabled', () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: { id: 'user-1' },
      isAuthenticated: true,
      loadingMe: false,
    });
    useCrdEnabledMock.mockReturnValue(true);

    const { result } = renderHook(() => useDesignVersionToggle());
    const state = result.current;

    if (!state.isVisible) throw new Error('expected isVisible true');
    expect(state.enabled).toBe(true);
    expect(state.isPending).toBe(false);
    expect(typeof state.onChange).toBe('function');
  });

  test('isPending reflects the mutation loading state', () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: { id: 'user-1' },
      isAuthenticated: true,
      loadingMe: false,
    });
    useCrdEnabledMock.mockReturnValue(false);
    useUpdateUserSettingsMutationMock.mockReturnValue([updateUserSettingsMock, { loading: true }]);

    const { result } = renderHook(() => useDesignVersionToggle());
    const state = result.current;

    if (!state.isVisible) throw new Error('expected isVisible true');
    expect(state.isPending).toBe(true);
  });

  test('on successful onChange(true): mutation called with designVersion=2, LS written with 2, Sentry info emitted, reload triggered', async () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: { id: 'user-1' },
      isAuthenticated: true,
      loadingMe: false,
    });
    useCrdEnabledMock.mockReturnValue(false);
    updateUserSettingsMock.mockResolvedValue({});

    const { result } = renderHook(() => useDesignVersionToggle());
    const state = result.current;
    if (!state.isVisible) throw new Error('expected isVisible true');

    await act(async () => {
      await state.onChange(true);
    });

    expect(updateUserSettingsMock).toHaveBeenCalledWith({
      variables: { settingsData: { userID: 'user-1', settings: { designVersion: 2 } } },
    });
    expect(writeDesignVersionToStorageMock).toHaveBeenCalledWith(2);
    expect(logInfoMock).toHaveBeenCalledWith(
      'Design version changed to 2',
      expect.objectContaining({ label: 'DESIGN_VERSION_SWITCH', category: 'UI' })
    );
    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).not.toHaveBeenCalled();
  });

  test('on successful onChange(false): mutation called with designVersion=1, LS written with 1', async () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: { id: 'user-2' },
      isAuthenticated: true,
      loadingMe: false,
    });
    useCrdEnabledMock.mockReturnValue(true);
    updateUserSettingsMock.mockResolvedValue({});

    const { result } = renderHook(() => useDesignVersionToggle());
    const state = result.current;
    if (!state.isVisible) throw new Error('expected isVisible true');

    await act(async () => {
      await state.onChange(false);
    });

    expect(updateUserSettingsMock).toHaveBeenCalledWith({
      variables: { settingsData: { userID: 'user-2', settings: { designVersion: 1 } } },
    });
    expect(writeDesignVersionToStorageMock).toHaveBeenCalledWith(1);
    expect(logInfoMock).toHaveBeenCalledWith('Design version changed to 1', expect.any(Object));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  test('on mutation rejection: notify shown with error severity, LS not touched, reload not called', async () => {
    useCurrentUserContextMock.mockReturnValue({
      userModel: { id: 'user-1' },
      isAuthenticated: true,
      loadingMe: false,
    });
    useCrdEnabledMock.mockReturnValue(false);
    updateUserSettingsMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDesignVersionToggle());
    const state = result.current;
    if (!state.isVisible) throw new Error('expected isVisible true');

    await act(async () => {
      await state.onChange(true);
    });

    expect(notifyMock).toHaveBeenCalledWith('topBar.designVersion.errorSaving', 'error');
    expect(writeDesignVersionToStorageMock).not.toHaveBeenCalled();
    expect(logInfoMock).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });
});
