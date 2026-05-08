import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import { overrideKey } from '../userNotificationsMapper';

// ─── Apollo hook mocks ────────────────────────────────────────────────────

const mockUpdateUserSettings = vi.fn();
const mockRefetchUserSettings = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [mockUpdateUserSettings, { loading: false }],
  refetchUserSettingsQuery: (vars: unknown) => mockRefetchUserSettings(vars),
}));

import useUserNotificationsTabData from '../useUserNotificationsTabData';

// ─── Lifecycle ────────────────────────────────────────────────────────────

const baseServer: NotificationSettings = {
  space: {
    communicationUpdates: { inApp: false, email: false, push: false },
    collaborationCalloutPublished: { inApp: true, email: false, push: false },
    collaborationCalloutPostContributionComment: { inApp: false, email: false, push: false },
    collaborationCalloutContributionCreated: { inApp: false, email: false, push: false },
    collaborationCalloutComment: { inApp: false, email: false, push: false },
    communityCalendarEvents: { inApp: false, email: false, push: false },
    collaborationPollVoteCastOnOwnPoll: { inApp: false, email: false, push: false },
    collaborationPollVoteCastOnPollIVotedOn: { inApp: false, email: false, push: false },
    collaborationPollModifiedOnPollIVotedOn: { inApp: false, email: false, push: false },
    collaborationPollVoteAffectedByOptionChange: { inApp: false, email: false, push: false },
  },
  user: {
    commentReply: { inApp: false, email: false, push: false },
    mentioned: { inApp: false, email: false, push: false },
    messageReceived: { inApp: false, email: false, push: false },
  },
};

beforeEach(() => {
  mockUpdateUserSettings.mockReset().mockResolvedValue({ data: {} });
  mockRefetchUserSettings.mockReset().mockReturnValue('refetch-token');
});

afterEach(() => vi.useRealTimers());

// ─── Tests ────────────────────────────────────────────────────────────────

describe('useUserNotificationsTabData — optimistic flip', () => {
  it('writes the override immediately so the UI flips before the mutation resolves', () => {
    const { result } = renderHook(() => useUserNotificationsTabData({ userId: 'user-1', serverSettings: baseServer }));
    expect(result.current.overrides.size).toBe(0);

    let savePromise: Promise<void> = Promise.resolve();
    act(() => {
      savePromise = result.current.onToggle('space', 'communicationUpdates', 'inApp', true);
    });
    // Synchronously the override is set even though the mutation hasn't resolved.
    expect(result.current.overrides.get(overrideKey('space', 'communicationUpdates', 'inApp'))).toBe(true);
    return savePromise; // let the promise settle so the test cleans up
  });

  it('clears the specific override after a successful mutation + refetch', async () => {
    const { result } = renderHook(() => useUserNotificationsTabData({ userId: 'user-1', serverSettings: baseServer }));

    await act(async () => {
      await result.current.onToggle('space', 'communicationUpdates', 'inApp', true);
    });

    await waitFor(() => {
      expect(result.current.overrides.has(overrideKey('space', 'communicationUpdates', 'inApp'))).toBe(false);
    });
    expect(mockUpdateUserSettings).toHaveBeenCalledTimes(1);
    expect(mockRefetchUserSettings).toHaveBeenCalledWith({ userID: 'user-1' });
  });
});

describe('useUserNotificationsTabData — hard-failure revert (FR-064 / Q5)', () => {
  it('rolls back the override AND re-throws so the integration layer can show a toast', async () => {
    mockUpdateUserSettings.mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useUserNotificationsTabData({ userId: 'user-1', serverSettings: baseServer }));

    let caughtError: unknown = null;
    await act(async () => {
      try {
        await result.current.onToggle('space', 'communicationUpdates', 'inApp', true);
      } catch (e) {
        caughtError = e;
      }
    });

    // Override removed → next render snaps back to the server value (false).
    expect(result.current.overrides.has(overrideKey('space', 'communicationUpdates', 'inApp'))).toBe(false);
    // Bubbled to the caller for toast.
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as Error).message).toBe('Network down');
  });
});

describe('useUserNotificationsTabData — payload preservation', () => {
  it('sends the FULL group payload, preserving other properties channel state from the server snapshot', async () => {
    const { result } = renderHook(() => useUserNotificationsTabData({ userId: 'user-1', serverSettings: baseServer }));

    await act(async () => {
      await result.current.onToggle('space', 'communicationUpdates', 'inApp', true);
    });

    const call = mockUpdateUserSettings.mock.calls[0][0];
    expect(call.variables.settingsData.userID).toBe('user-1');
    const space = call.variables.settingsData.settings.notification.space;
    // The toggled property reflects the new value.
    expect(space.communicationUpdates).toEqual({ inApp: true, email: false, push: false });
    // Other properties keep their existing channel state (e.g., collaborationCalloutPublished.inApp was true on the server).
    expect(space.collaborationCalloutPublished).toEqual({ inApp: true, email: false, push: false });
    // And channels NOT toggled keep their server value (no leakage from the override).
    expect(space.communicationUpdates.email).toBe(false);
    expect(space.communicationUpdates.push).toBe(false);
  });
});

describe('useUserNotificationsTabData — guard clauses', () => {
  it('does not fire the mutation when userId is undefined', async () => {
    const { result } = renderHook(() => useUserNotificationsTabData({ userId: undefined, serverSettings: baseServer }));
    await act(async () => {
      await result.current.onToggle('space', 'communicationUpdates', 'inApp', true);
    });
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });
});
