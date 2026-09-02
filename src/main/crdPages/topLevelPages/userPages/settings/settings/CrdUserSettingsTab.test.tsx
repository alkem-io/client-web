import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

const mockI18nInstance = {
  options: { supportedLngs: ['en', 'nl', 'de', 'fr', 'es', 'bg'] },
  language: 'en',
  t: (key: string) => key,
  changeLanguage: vi.fn(),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: mockI18nInstance }),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    userModel: { settings: { language: null, languageOfferAnswered: false } },
  }),
}));

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ language: { default: 'en', eligible: ['nl', 'de'] } }),
}));

const updateUserSettingsMock = vi.fn();
const refetchUserSettingsQueryMock = vi.fn((v: unknown) => ({ query: 'UserSettings', variables: v }));
const useUserSettingsQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [updateUserSettingsMock, { loading: false }],
  refetchUserSettingsQuery: (v: unknown) => refetchUserSettingsQueryMock(v),
  useUserSettingsQuery: (opts: unknown) => useUserSettingsQueryMock(opts),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

vi.mock('../../useUserPageRouteContext', () => ({ default: () => ({ userId: 'user-1' }) }));

// Capture the onLanguageChange prop that CrdUserSettingsTab passes down so the
// tests can invoke the real container orchestration without fighting Radix Select
// portal limitations in jsdom.
let capturedOnLanguageChange: ((code: string) => void) | null = null;
vi.mock('@/crd/components/user/settings/UserSettingsTabView', () => ({
  UserSettingsTabView: (props: { onLanguageChange: (code: string) => void; currentLanguage: string }) => {
    capturedOnLanguageChange = props.onLanguageChange;
    // Render a minimal stub that satisfies the combobox ARIA role requirements.
    // aria-expanded is required for role="combobox" (a11y/useAriaPropsForRole).
    return (
      <button type="button" role="combobox" aria-expanded={false} aria-label="user.settings.language.label">
        {props.currentLanguage}
      </button>
    );
  },
}));

// Re-import after mock setup.
import CrdUserSettingsTab from './CrdUserSettingsTab';

const settingsData = (allowMessages: boolean, allowEmail: boolean) => ({
  lookup: {
    user: {
      settings: {
        communication: {
          allowOtherUsersToSendMessages: allowMessages,
          allowOtherUsersToContactViaEmail: allowEmail,
        },
      },
    },
  },
});

// Email-contact toggle temporarily DISABLED client-side (chat-only): these
// tests are skipped while the toggle is not rendered. Re-enable them together
// with the toggle in CrdUserSettingsTab.tsx / UserSettingsTabView.tsx.
describe('CrdUserSettingsTab (US4 — email-contact toggle)', () => {
  afterEach(() => {
    vi.clearAllMocks();
    capturedOnLanguageChange = null;
  });

  test.skip('email-contact toggle defaults to off and persists via updateUserSettings', async () => {
    useUserSettingsQueryMock.mockReturnValue({ data: settingsData(true, false), loading: false });
    updateUserSettingsMock.mockResolvedValue({});

    render(<CrdUserSettingsTab />);

    const emailSwitch = screen.getByLabelText('user.settings.communication.allowEmailContactLabel');
    expect(emailSwitch.getAttribute('aria-checked')).toBe('false');
  });

  test.skip('reflects an enabled email-contact preference', () => {
    useUserSettingsQueryMock.mockReturnValue({ data: settingsData(true, true), loading: false });
    render(<CrdUserSettingsTab />);
    const emailSwitch = screen.getByLabelText('user.settings.communication.allowEmailContactLabel');
    expect(emailSwitch.getAttribute('aria-checked')).toBe('true');
  });
});

// T011 — language row write path (FR-011 / FR-017)
// These tests exercise the real CrdUserSettingsTab container orchestration:
// mutation variables, refetchQueries+awaitRefetchQueries, i18n.changeLanguage,
// and the error-rollback of the optimistic languageOverride.
describe('CrdUserSettingsTab language row (T011)', () => {
  afterEach(() => {
    vi.clearAllMocks();
    capturedOnLanguageChange = null;
  });

  test('renders language select with current account value', () => {
    useUserSettingsQueryMock.mockReturnValue({ data: settingsData(true, false), loading: false });

    render(<CrdUserSettingsTab />);

    // The Select trigger is labelled with the language label translation key.
    const trigger = screen.getByRole('combobox', { name: 'user.settings.language.label' });
    expect(trigger).toBeTruthy();
  });

  test('onLanguageChange calls updateUserSettings with correct settingsData, refetchQueries, awaitRefetchQueries, and i18n.changeLanguage', async () => {
    useUserSettingsQueryMock.mockReturnValue({ data: settingsData(true, false), loading: false });
    updateUserSettingsMock.mockResolvedValue({});

    render(<CrdUserSettingsTab />);

    // capturedOnLanguageChange is the real handler from CrdUserSettingsTab (not a vi.fn stub)
    expect(capturedOnLanguageChange).not.toBeNull();
    if (!capturedOnLanguageChange) throw new Error('onLanguageChange not captured');

    await act(async () => {
      capturedOnLanguageChange?.('nl');
    });

    // Mutation must have been called with the correct payload (FR-011 / US2-AS5)
    expect(updateUserSettingsMock).toHaveBeenCalledTimes(1);
    const callArg = updateUserSettingsMock.mock.calls[0][0];
    expect(callArg.variables.settingsData).toEqual({
      userID: 'user-1',
      settings: { language: 'nl' },
    });

    // refetchQueries must include a UserSettings refetch so cross-device sync works (US2-AS5)
    expect(callArg.refetchQueries).toBeDefined();
    expect(callArg.awaitRefetchQueries).toBe(true);

    // FR-011 "applies immediately": i18n.changeLanguage must have been called with 'nl'
    expect(mockI18nInstance.changeLanguage).toHaveBeenCalledWith('nl');
  });

  test('on rejected mutation the optimistic languageOverride is reverted and i18n.changeLanguage is NOT called', async () => {
    useUserSettingsQueryMock.mockReturnValue({ data: settingsData(true, false), loading: false });
    updateUserSettingsMock.mockRejectedValue(new Error('network error'));

    render(<CrdUserSettingsTab />);

    expect(capturedOnLanguageChange).not.toBeNull();
    if (!capturedOnLanguageChange) throw new Error('onLanguageChange not captured');

    await act(async () => {
      try {
        await capturedOnLanguageChange?.('nl');
      } catch {
        // The container catches internally; this catch is for safety
      }
    });

    // Mutation was called
    expect(updateUserSettingsMock).toHaveBeenCalledTimes(1);

    // On error the container calls notify and reverts — i18n.changeLanguage is NOT called
    // (the optimistic override is rolled back, not applied)
    expect(mockI18nInstance.changeLanguage).not.toHaveBeenCalled();

    // The stub renders currentLanguage as the button text; after rollback it should be
    // the account language (null → platform default 'en'), not 'nl'
    const trigger = screen.getByRole('combobox', { name: 'user.settings.language.label' });
    expect(trigger.textContent).toBe('en');
  });
});
