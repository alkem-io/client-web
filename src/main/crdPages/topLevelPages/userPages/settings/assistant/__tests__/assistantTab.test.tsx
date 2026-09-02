/**
 * @vitest-environment jsdom
 *
 * T022 — User → Settings → Assistant tab (US4 / FR-006 / FR-018).
 *
 * Verifies the toggle list is enumerated DYNAMICALLY from `platformCapabilities`
 * (never a hardcoded enum — an injected extra capability appears), the
 * read-only defaults are shown (READ on, WRITE_* off), and a toggle calls
 * `updateUserSettings({ assistant })` with the right full-payload.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssistantCapabilityKind } from '@/core/apollo/generated/graphql-schema';
import { fireEvent, render, screen, waitFor } from '@/main/test/testUtils';

// ── Apollo + integration hook mocks ────────────────────────────────────────

const mockUpdateUserAssistantSettings = vi.fn();
const mockRefetch = vi.fn();
const mockNotify = vi.fn();

// The dynamic tool surface — note the INJECTED "moderate_content" capability
// that is NOT in any hardcoded list: it must still render a toggle.
const platformCapabilities = [
  {
    __typename: 'AssistantCapability',
    name: 'search_content',
    displayName: 'Search content',
    description: 'Find content you can access.',
    kind: AssistantCapabilityKind.Read,
  },
  {
    __typename: 'AssistantCapability',
    name: 'create_whiteboard',
    displayName: 'Create whiteboard',
    description: 'Create a new whiteboard.',
    kind: AssistantCapabilityKind.WriteAdditive,
  },
  {
    __typename: 'AssistantCapability',
    name: 'update_whiteboard_content',
    displayName: 'Update whiteboard',
    description: 'Change an existing whiteboard.',
    kind: AssistantCapabilityKind.WriteDestructive,
  },
  {
    // Injected brand-new tool — proves the list is NOT a hardcoded enum.
    __typename: 'AssistantCapability',
    name: 'moderate_content',
    displayName: 'Moderate content',
    description: 'A capability added on the server after this UI shipped.',
    kind: AssistantCapabilityKind.WriteDestructive,
  },
];

// The user has no stored toggles yet → pure kind-based defaults apply.
let storedEnabledCapabilities: { capability: string; enabled: boolean }[] = [];

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformCapabilitiesQuery: () => ({ data: { platformCapabilities }, loading: false }),
  useUserAssistantSettingsQuery: () => ({
    data: {
      user: {
        id: 'user-1',
        settings: { id: 'settings-1', assistant: { enabledCapabilities: storedEnabledCapabilities } },
      },
    },
    loading: false,
  }),
  useUpdateUserAssistantSettingsMutation: () => [mockUpdateUserAssistantSettings, { loading: false }],
  refetchUserAssistantSettingsQuery: (vars: unknown) => mockRefetch(vars),
}));

vi.mock('@/main/assistant/useAssistantEnabled', () => ({
  useAssistantEnabled: () => true,
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mockNotify,
}));

vi.mock('../../../useUserPageRouteContext', () => ({
  default: () => ({ userId: 'user-1', profileUrl: '/user/jdoe' }),
}));

import CrdUserAssistantTab from '../CrdUserAssistantTab';

beforeEach(() => {
  storedEnabledCapabilities = [];
  mockUpdateUserAssistantSettings.mockReset().mockResolvedValue({ data: {} });
  mockRefetch.mockReset().mockReturnValue('refetch-token');
  mockNotify.mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe('CrdUserAssistantTab — dynamic enumeration (FR-006/FR-018)', () => {
  it('renders one toggle per capability enumerated from platformCapabilities, incl. an injected extra', async () => {
    render(<CrdUserAssistantTab />);

    // Every server-listed capability has a toggle — including the one that no
    // hardcoded enum could know about.
    expect(await screen.findByText('Search content')).toBeInTheDocument();
    expect(screen.getByText('Create whiteboard')).toBeInTheDocument();
    expect(screen.getByText('Update whiteboard')).toBeInTheDocument();
    expect(screen.getByText('Moderate content')).toBeInTheDocument();

    // One switch per capability (4).
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(4);
  });

  it('shows read-only defaults: READ enabled, every WRITE_* disabled', async () => {
    render(<CrdUserAssistantTab />);
    await screen.findByText('Search content');

    const readSwitch = screen.getByRole('switch', { name: /Search content/i });
    const additiveSwitch = screen.getByRole('switch', { name: /Create whiteboard/i });
    const destructiveSwitch = screen.getByRole('switch', { name: /Update whiteboard/i });
    const injectedSwitch = screen.getByRole('switch', { name: /Moderate content/i });

    expect(readSwitch).toBeChecked();
    expect(additiveSwitch).not.toBeChecked();
    expect(destructiveSwitch).not.toBeChecked();
    // The unclassified/new capability is fail-safe disabled by default.
    expect(injectedSwitch).not.toBeChecked();
  });
});

describe('CrdUserAssistantTab — persist (updateUserSettings assistant)', () => {
  it('toggling a write capability calls updateUserSettings with the full enabledCapabilities payload', async () => {
    render(<CrdUserAssistantTab />);
    await screen.findByText('Create whiteboard');

    fireEvent.click(screen.getByRole('switch', { name: /Create whiteboard/i }));

    await waitFor(() => expect(mockUpdateUserAssistantSettings).toHaveBeenCalledTimes(1));

    const call = mockUpdateUserAssistantSettings.mock.calls[0][0];
    expect(call.variables.settingsData.userID).toBe('user-1');
    const enabled = call.variables.settingsData.settings.assistant.enabledCapabilities;

    // Full payload — one entry per enumerated capability.
    expect(enabled).toHaveLength(4);
    const byName = Object.fromEntries(
      enabled.map((e: { capability: string; enabled: boolean }) => [e.capability, e.enabled])
    );
    // The toggled write is now enabled; the READ default stays on; the others stay off.
    expect(byName.create_whiteboard).toBe(true);
    expect(byName.search_content).toBe(true);
    expect(byName.update_whiteboard_content).toBe(false);
    expect(byName.moderate_content).toBe(false);

    // Refetch keyed by the user id.
    expect(mockRefetch).toHaveBeenCalledWith({ userId: 'user-1' });
  });
});
