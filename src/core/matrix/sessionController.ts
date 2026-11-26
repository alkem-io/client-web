import { getActiveClient, setActiveClient, setSessionEstablishing } from './activeClient';
import { registerActiveSession, unregisterActiveSession } from './activeSession';
import { matrixSessionFetch, sessionEndpoint, withTabInstance } from './nativeMatrixSessionFetch';
import { quietSdkLogging } from './sdkLogging';

type MatrixAccess = { userId: string; sessionBaseUrl: string; expiresAt: string };

export async function establishSession(
  configEndpoint: string,
  access: MatrixAccess,
  lifetime: AbortSignal
): Promise<void> {
  if (lifetime.aborted) return;
  const baseUrl = sessionEndpoint(configEndpoint);
  if (sessionEndpoint(access.sessionBaseUrl) !== baseUrl || !(Date.parse(access.expiresAt) > Date.now())) {
    throw new Error('Matrix session metadata is invalid or expired');
  }

  const controller = new AbortController();
  const stop = () => controller.abort();
  const signal = AbortSignal.any([lifetime, controller.signal]);
  registerActiveSession(stop);
  setSessionEstablishing(true);
  try {
    await quietSdkLogging();
    const { ClientEvent, HttpApiEvent, SyncState, createClient } = await import('matrix-js-sdk');
    await withTabInstance(signal, async instance => {
      const fetchFn = matrixSessionFetch(baseUrl, instance, signal);
      const probe = createClient({ baseUrl, fetchFn, disableVoip: true });
      const identity = await probe.whoami();
      if (signal.aborted) return;
      if (identity.user_id !== access.userId || !identity.device_id) {
        throw new Error('Matrix session identity mismatch');
      }
      const client = createClient({
        baseUrl,
        fetchFn,
        userId: identity.user_id,
        deviceId: identity.device_id,
        disableVoip: true,
      });
      // This text-only session already has its homeserver URL. SDK 42 starts
      // both discovery caches even with VoIP disabled and no polling period.
      client.cachedRtcTransports.start = () => undefined;
      // biome-ignore lint/complexity/useLiteralKeys: SDK 42 declares the cache protected.
      client['cachedWellKnown'].start = () => undefined;
      const ended = new Promise<void>(resolve => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });
      client.on(HttpApiEvent.SessionLoggedOut, stop);
      client.on(ClientEvent.Sync, state => {
        if (state === SyncState.Prepared && !signal.aborted) {
          setActiveClient(client);
          setSessionEstablishing(false);
        }
      });
      try {
        await client.startClient({ initialSyncLimit: 20, lazyLoadMembers: true, threadSupport: false });
        await ended;
      } finally {
        stop();
        client.stopClient();
        if (getActiveClient() === client) setActiveClient(null);
      }
    });
  } finally {
    stop();
    unregisterActiveSession(stop);
    if (!lifetime.aborted) setSessionEstablishing(false);
  }
}
