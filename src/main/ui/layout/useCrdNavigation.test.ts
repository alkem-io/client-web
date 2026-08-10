import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

const mockI18nInstance = {
  language: 'en',
  changeLanguage: vi.fn(),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: mockI18nInstance }),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/', search: '' }),
}));

vi.mock('@/core/i18n/config', () => ({
  supportedLngs: ['en', 'nl', 'de', 'fr', 'es', 'bg'],
}));

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ locations: undefined }),
}));

const updateUserSettingsMock = vi.fn();
const refetchUserSettingsQueryMock = vi.fn((v: unknown) => ({ query: 'UserSettings', variables: v }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [updateUserSettingsMock, { loading: false }],
  refetchUserSettingsQuery: (v: unknown) => refetchUserSettingsQueryMock(v),
}));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));

let mockCurrentUserContext: { userModel?: { id: string }; isAuthenticated: boolean };
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => mockCurrentUserContext,
}));

// Re-import after mock setup.
import { useCrdNavigation } from './useCrdNavigation';

describe('useCrdNavigation — handleLanguageChange', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('guest (unauthenticated): applies the language display-only, never calls updateUserSettings', async () => {
    mockCurrentUserContext = { userModel: undefined, isAuthenticated: false };
    const { result } = renderHook(() => useCrdNavigation());

    await result.current.handleLanguageChange('bg');

    expect(updateUserSettingsMock).not.toHaveBeenCalled();
    expect(mockI18nInstance.changeLanguage).toHaveBeenCalledWith('bg');
  });

  test('authenticated user: persists via updateUserSettings before applying the language', async () => {
    mockCurrentUserContext = { userModel: { id: 'user-1' }, isAuthenticated: true };
    updateUserSettingsMock.mockResolvedValue({});
    const { result } = renderHook(() => useCrdNavigation());

    await result.current.handleLanguageChange('bg');

    expect(updateUserSettingsMock).toHaveBeenCalledWith({
      variables: {
        settingsData: {
          userID: 'user-1',
          settings: { language: 'bg' },
        },
      },
      refetchQueries: [refetchUserSettingsQueryMock({ userID: 'user-1' })],
      awaitRefetchQueries: true,
    });
    expect(mockI18nInstance.changeLanguage).toHaveBeenCalledWith('bg');
  });

  test('authenticated user, persistence fails: notifies and does not change the display language', async () => {
    mockCurrentUserContext = { userModel: { id: 'user-1' }, isAuthenticated: true };
    updateUserSettingsMock.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useCrdNavigation());

    await result.current.handleLanguageChange('bg');

    expect(notifyMock).toHaveBeenCalledWith('user.settings.language.error', 'error');
    expect(mockI18nInstance.changeLanguage).not.toHaveBeenCalled();
  });
});
