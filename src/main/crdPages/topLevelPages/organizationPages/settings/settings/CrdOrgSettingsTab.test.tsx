import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const updateOrgSettings = vi.fn();
const notify = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@apollo/client', () => ({ useApolloClient: () => ({ refetchQueries: vi.fn() }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/domain/community/organization/hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => ({ organizationId: 'org-1', loading: false }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  OrganizationInfoDocument: {},
  refetchOrganizationSettingsQuery: (variables: unknown) => ({ variables }),
  useOrganizationSettingsQuery: () => ({
    data: { lookup: { organization: { settings: { security: { secondFactorRequired: false } } } } },
    loading: false,
  }),
  useUpdateOrganizationSettingsMutation: () => [updateOrgSettings],
}));

import CrdOrgSettingsTab from './CrdOrgSettingsTab';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CrdOrgSettingsTab — a failed save', () => {
  test('raises exactly one toast: its own, with the global error handler skipped', async () => {
    const user = userEvent.setup();
    updateOrgSettings.mockRejectedValue(new Error('SECOND_FACTOR_REQUIRED'));
    render(<CrdOrgSettingsTab />);

    await user.click(screen.getByRole('switch', { name: 'org.settings.security.requireSecondFactorLabel' }));

    await waitFor(() => expect(notify).toHaveBeenCalledExactlyOnceWith('org.settings.errorToast', 'error'));
    expect(updateOrgSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { settingsData: { organizationID: 'org-1', settings: { security: { secondFactorRequired: true } } } },
        context: { skipGlobalErrorHandler: true },
      })
    );
  });
});
