import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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

// Render the real view; expose the two switches by aria-label.
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
  afterEach(() => vi.clearAllMocks());

  test.skip('email-contact toggle defaults to off and persists via updateUserSettings', async () => {
    useUserSettingsQueryMock.mockReturnValue({ data: settingsData(true, false), loading: false });
    updateUserSettingsMock.mockResolvedValue({});

    render(<CrdUserSettingsTab />);

    const emailSwitch = screen.getByLabelText('user.settings.communication.allowEmailContactLabel');
    expect(emailSwitch.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(emailSwitch);

    await vi.waitFor(() => expect(updateUserSettingsMock).toHaveBeenCalledTimes(1));
    const callArg = updateUserSettingsMock.mock.calls[0][0];
    expect(callArg.variables.settingsData).toEqual({
      userID: 'user-1',
      settings: { communication: { allowOtherUsersToContactViaEmail: true } },
    });
  });

  test.skip('reflects an enabled email-contact preference', () => {
    useUserSettingsQueryMock.mockReturnValue({ data: settingsData(true, true), loading: false });
    render(<CrdUserSettingsTab />);
    const emailSwitch = screen.getByLabelText('user.settings.communication.allowEmailContactLabel');
    expect(emailSwitch.getAttribute('aria-checked')).toBe('true');
  });
});
