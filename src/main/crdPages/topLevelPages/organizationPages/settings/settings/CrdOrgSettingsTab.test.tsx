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
  test("is left to the global error handler, so the server's reason is the one message", async () => {
    const user = userEvent.setup();
    updateOrgSettings.mockRejectedValue(new Error('refused'));
    render(<CrdOrgSettingsTab />);

    const toggle = screen.getByRole('switch', { name: 'org.settings.security.requireSecondFactorLabel' });
    await user.click(toggle);

    await waitFor(() => expect(updateOrgSettings).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'false'));
    expect(updateOrgSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          settingsData: { organizationID: 'org-1', settings: { security: { secondFactorRequired: true } } },
        },
      })
    );
    expect(updateOrgSettings.mock.calls[0][0]).not.toHaveProperty('context');
    expect(notify).not.toHaveBeenCalled();
  });
});
