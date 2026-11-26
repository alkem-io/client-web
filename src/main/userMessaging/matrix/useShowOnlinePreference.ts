import { ClientEvent, type MatrixClient, type MatrixEvent, SetPresence } from 'matrix-js-sdk';
import { useSyncExternalStore } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { writeStoredShowOnline } from '@/core/matrix/showOnlineStorage';

const SHOW_ONLINE_EVENT = 'io.alkemio.chat.presence';

declare module 'matrix-js-sdk/lib/@types/event' {
  interface AccountDataEvents {
    'io.alkemio.chat.presence': { show_online: boolean };
  }
}

const noop = () => {};

type PresenceUpdate = Parameters<MatrixClient['setPresence']>[0];

// Synapse allows one presence update per user every 10 seconds by default and
// answers 429 with the wait, so setting then clearing in quick succession is refused.
const retryAfterMs = (error: unknown): number | undefined => {
  const data = (error as { errcode?: string; data?: { retry_after_ms?: number } } | null) ?? {};
  return data.errcode === 'M_LIMIT_EXCEEDED' ? (data.data?.retry_after_ms ?? 10_000) : undefined;
};

/** Sends the presence, and once more after the wait a rate-limited homeserver asks for, unless `stillWanted` says no by then. */
export const setPresenceRetryingOnce = async (
  client: MatrixClient,
  update: PresenceUpdate,
  stillWanted: () => boolean
): Promise<void> => {
  await client.setPresence(update).catch(async error => {
    const wait = retryAfterMs(error);
    if (wait === undefined) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, wait));
    if (stillWanted()) {
      await client.setPresence(update);
    }
  });
};

/** The "Show when I'm online" setting from account data; on while absent. */
export const showOnlineOf = (client: MatrixClient | null): boolean =>
  client?.getAccountData(SHOW_ONLINE_EVENT)?.getContent().show_online !== false;

const apply = (client: MatrixClient, showOnline: boolean) => {
  void client.setSyncPresence(showOnline ? SetPresence.Online : SetPresence.Offline);
  writeStoredShowOnline(client.getSafeUserId(), showOnline);
};

// Every change, from another device or echoed back from this one, reaches the
// sync loop and the start-up copy here. Only the device that switched it off
// sends the explicit offline presence.
const subscribeToSetting = (client: MatrixClient | null) => (listener: () => void) => {
  if (!client) {
    return noop;
  }
  // Account data that arrived before anything listened, e.g. on a browser with no copy yet.
  // Absent data is left alone: before the first sync it would undo an offline start.
  if (client.getAccountData(SHOW_ONLINE_EVENT)) {
    apply(client, showOnlineOf(client));
  }
  const onAccountData = (event: MatrixEvent) => {
    if (event.getType() === SHOW_ONLINE_EVENT) {
      apply(client, event.getContent().show_online !== false);
      listener();
    }
  };
  client.on(ClientEvent.AccountData, onAccountData);
  return () => client.removeListener(ClientEvent.AccountData, onAccountData);
};

/** The signed-in user's "Show when I'm online" chat setting, live across devices, and a setter. */
export const useShowOnlinePreference = () => {
  const client = useMatrixClient();
  const readSnapshot = () => showOnlineOf(client);
  const showOnline = useSyncExternalStore(subscribeToSetting(client), readSnapshot, readSnapshot);

  // Rejects when there is no client or the homeserver refuses the change.
  const setShowOnline = async (value: boolean) => {
    if (!client) {
      throw new Error('Chat is not connected');
    }
    // Resolves once sync has echoed the change back, which applies it to this device above.
    await client.setAccountData(SHOW_ONLINE_EVENT, { show_online: value });
    if (!value) {
      // An offline sync leaves the current presence as it is, and Synapse keeps the
      // status message of a user who goes offline, so both are cleared explicitly.
      // Sending it before the offline sync would let the next sync say online again. When it
      // fails the setting goes back on, so it never reads off while the status stays published.
      await setPresenceRetryingOnce(client, { presence: 'offline', status_msg: '' }, () => !showOnlineOf(client)).catch(
        async error => {
          await client.setAccountData(SHOW_ONLINE_EVENT, { show_online: true });
          throw error;
        }
      );
    }
  };

  return { showOnline, setShowOnline };
};
