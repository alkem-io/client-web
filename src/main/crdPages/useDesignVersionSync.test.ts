import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

const useCurrentUserContextMock = vi.fn();
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => useCurrentUserContextMock(),
}));

const readDesignVersionFromStorageMock = vi.fn();
const writeDesignVersionToStorageMock = vi.fn();
vi.mock('./useCrdEnabled', () => ({
  readDesignVersionFromStorage: () => readDesignVersionFromStorageMock(),
  writeDesignVersionToStorage: (version: 1 | 2) => writeDesignVersionToStorageMock(version),
}));

const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { reload: reloadMock },
});

// Module is imported after mocks so the module-level guard variable inside the
// hook is shared across tests. Each test resets the guard by first rendering
// the hook with an anonymous user (which the hook treats as "sign-out" and
// clears its lastReconciledUserID).
import { useDesignVersionSync } from './useDesignVersionSync';

function resetSyncModuleState() {
  useCurrentUserContextMock.mockReturnValueOnce({
    isAuthenticated: false,
    loadingMe: false,
    designVersion: undefined,
    userModel: undefined,
  });
  renderHook(() => useDesignVersionSync());
}

describe('useDesignVersionSync', () => {
  beforeEach(() => {
    useCurrentUserContextMock.mockReset();
    readDesignVersionFromStorageMock.mockReset();
    writeDesignVersionToStorageMock.mockReset();
    reloadMock.mockReset();
    resetSyncModuleState();
    useCurrentUserContextMock.mockReset();
    readDesignVersionFromStorageMock.mockReset();
    writeDesignVersionToStorageMock.mockReset();
    reloadMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('anonymous user → no-op', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: false,
      loadingMe: false,
      designVersion: undefined,
      userModel: undefined,
    });
    readDesignVersionFromStorageMock.mockReturnValue(null);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test('authenticated but still loading → no-op', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: true,
      designVersion: undefined,
      userModel: { id: 'u1' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(null);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test('authenticated but designVersion is undefined → no-op (e.g. 3+/unrecognized server value)', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: undefined,
      userModel: { id: 'u1' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(null);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test('designVersion=2 and LS=2 → no-op', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 2,
      userModel: { id: 'u-match-new' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(2);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test('designVersion=1 and LS=1 → no-op', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 1,
      userModel: { id: 'u-match-old' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(1);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test('designVersion=2 and LS=1 → write 2 and reload once', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 2,
      userModel: { id: 'u-flip-on' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(1);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).toHaveBeenCalledWith(2);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  test('designVersion=1 and LS=2 → write 1 and reload once', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 1,
      userModel: { id: 'u-flip-off' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(2);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).toHaveBeenCalledWith(1);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  test('designVersion=2 and LS unset → write 2 and reload once', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 2,
      userModel: { id: 'u-unset' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(null);

    renderHook(() => useDesignVersionSync());

    expect(writeDesignVersionToStorageMock).toHaveBeenCalledWith(2);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  test('re-rendering the same user after reconciliation does not reload again', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 2,
      userModel: { id: 'u-rerender' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(1);

    const { rerender } = renderHook(() => useDesignVersionSync());

    expect(reloadMock).toHaveBeenCalledTimes(1);

    rerender();
    rerender();
    rerender();

    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(writeDesignVersionToStorageMock).toHaveBeenCalledTimes(1);
  });

  test('different user signs in after sign-out → reconciliation runs again for the new user', () => {
    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 2,
      userModel: { id: 'user-A' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(1);

    const { rerender } = renderHook(() => useDesignVersionSync());
    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(writeDesignVersionToStorageMock).toHaveBeenLastCalledWith(2);

    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: false,
      loadingMe: false,
      designVersion: undefined,
      userModel: undefined,
    });
    rerender();

    useCurrentUserContextMock.mockReturnValue({
      isAuthenticated: true,
      loadingMe: false,
      designVersion: 1,
      userModel: { id: 'user-B' },
    });
    readDesignVersionFromStorageMock.mockReturnValue(2);
    rerender();

    expect(reloadMock).toHaveBeenCalledTimes(2);
    expect(writeDesignVersionToStorageMock).toHaveBeenLastCalledWith(1);
  });
});
