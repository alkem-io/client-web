import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Sound = { chatMessage?: boolean };
const harness = vi.hoisted(() => ({
  userModel: undefined as { id: string; settings?: { notification?: { sound?: Sound } } } | undefined,
  updateUserSettings: vi.fn(),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: harness.userModel }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [harness.updateUserSettings],
  refetchUserSettingsQuery: (variables: unknown) => ({ query: 'UserSettings', variables }),
}));

import { chatSoundStorageKey } from './chatSoundPreference';
import { useChatSound, useChatSoundEnabled } from './useChatSound';

const signIn = (id: string, chatMessage?: boolean) => {
  harness.userModel = { id, settings: { notification: { sound: { chatMessage } } } };
};

/** What the browser does in this tab when another tab of the same profile writes the key. */
const writeFromAnotherTab = (userId: string, value: string) => {
  localStorage.setItem(chatSoundStorageKey(userId), value);
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: chatSoundStorageKey(userId), newValue: value }));
  });
};

describe('useChatSound', () => {
  beforeEach(() => {
    localStorage.clear();
    harness.userModel = undefined;
    harness.updateUserSettings.mockReset().mockResolvedValue({});
  });

  it('is on by default and offers no way to change it to a visitor who is not signed in', () => {
    const { result } = renderHook(() => useChatSound());

    expect(result.current.enabled).toBe(true);
    expect(result.current.setEnabled).toBeUndefined();
  });

  it('copies the saved setting to storage on load, over a stale stored value', () => {
    localStorage.setItem(chatSoundStorageKey('load'), 'true');
    signIn('load', false);

    const { result } = renderHook(() => useChatSoundEnabled());

    expect(result.current).toBe(false);
    expect(localStorage.getItem(chatSoundStorageKey('load'))).toBe('false');
  });

  it('follows a change of the saved setting made elsewhere in this tab', () => {
    signIn('settings-page', true);
    const { result, rerender } = renderHook(() => useChatSoundEnabled());
    expect(result.current).toBe(true);

    signIn('settings-page', false);
    rerender();

    expect(result.current).toBe(false);
    expect(localStorage.getItem(chatSoundStorageKey('settings-page'))).toBe('false');
  });

  it('follows another tab, and a remount does not undo that with this tab’s older saved setting', () => {
    signIn('tabs', true);
    const first = renderHook(() => useChatSoundEnabled());

    writeFromAnotherTab('tabs', 'false');
    expect(first.result.current).toBe(false);

    first.unmount();
    const second = renderHook(() => useChatSoundEnabled());
    expect(second.result.current).toBe(false);
    expect(localStorage.getItem(chatSoundStorageKey('tabs'))).toBe('false');
  });

  it('ignores another user’s stored value', () => {
    localStorage.setItem(chatSoundStorageKey('someone-else'), 'false');
    signIn('own', undefined);

    const { result } = renderHook(() => useChatSoundEnabled());

    expect(result.current).toBe(true);
  });

  it('muting applies at once, is stored for the other tabs and saves the user setting', async () => {
    signIn('toggle', true);
    let save: (value: unknown) => void = () => {};
    harness.updateUserSettings.mockReturnValue(new Promise(resolve => (save = resolve)));
    const { result } = renderHook(() => useChatSound());

    let pending: Promise<void> | undefined;
    act(() => {
      pending = result.current.setEnabled?.(false);
    });

    // Before the save answers.
    expect(result.current.enabled).toBe(false);
    expect(localStorage.getItem(chatSoundStorageKey('toggle'))).toBe('false');
    expect(harness.updateUserSettings).toHaveBeenCalledOnce();
    const options = harness.updateUserSettings.mock.calls[0][0];
    expect(options.variables).toEqual({
      settingsData: { userID: 'toggle', settings: { notification: { sound: { chatMessage: false } } } },
    });
    expect(options.refetchQueries).toEqual([{ query: 'UserSettings', variables: { userID: 'toggle' } }]);
    expect(options.context).toEqual({ skipGlobalErrorHandler: true });

    await act(async () => {
      save({});
      await pending;
    });
    expect(result.current.enabled).toBe(false);
  });

  it('a failed save restores the previous value and rejects', async () => {
    signIn('failure', true);
    harness.updateUserSettings.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useChatSound());

    let failure: unknown;
    await act(async () => {
      await result.current.setEnabled?.(false).catch(error => {
        failure = error;
      });
    });

    expect(failure).toEqual(new Error('network'));
    expect(result.current.enabled).toBe(true);
    expect(localStorage.getItem(chatSoundStorageKey('failure'))).toBe('true');
  });

  it('ignores a press while a save is still running', async () => {
    signIn('double-press', true);
    let finishSave: () => void = () => {};
    harness.updateUserSettings.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finishSave = resolve;
        })
    );
    const { result } = renderHook(() => useChatSound());

    let first: Promise<void> | undefined;
    await act(async () => {
      first = result.current.setEnabled?.(false);
    });
    await act(async () => {
      await result.current.setEnabled?.(true);
    });

    expect(harness.updateUserSettings).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(chatSoundStorageKey('double-press'))).toBe('false');

    await act(async () => {
      finishSave();
      await first;
    });
    harness.updateUserSettings.mockResolvedValue({});
    await act(async () => {
      await result.current.setEnabled?.(true);
    });
    expect(harness.updateUserSettings).toHaveBeenCalledTimes(2);
  });

  it('still reads and saves the setting when storage is unavailable', async () => {
    signIn('private-mode', false);
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const { result } = renderHook(() => useChatSound());

    expect(result.current.enabled).toBe(false);
    await act(async () => {
      await result.current.setEnabled?.(true);
    });
    expect(harness.updateUserSettings).toHaveBeenCalledOnce();

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
