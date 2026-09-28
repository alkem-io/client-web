import { registerActiveSession, unregisterActiveSession } from './activeSession';
import { attemptSilentSso, type SilentSsoOutcome } from './ssoLogin';
import { type CredentialRecord, clearNamespace, findStoredUserId, loadCredentials } from './storage';

type MatrixClientLike = {
  stopClient(): void;
};

type MatrixSdkModule = {
  createClient(opts: { baseUrl: string; userId: string; deviceId: string; accessToken: string }): MatrixClientLike;
};

type EstablishmentHooks = {
  readonly loadSdk?: () => Promise<MatrixSdkModule>;
  readonly silentSso?: (expectedLocalpart: string, signal: AbortSignal) => Promise<SilentSsoOutcome>;
  /** Aborting stops establishment at any point, including mid-SSO. */
  readonly signal?: AbortSignal;
};

type SessionHandle = {
  readonly stop: () => void;
};

const defaultLoadSdk = async (): Promise<MatrixSdkModule> =>
  (await import('matrix-js-sdk')) as unknown as MatrixSdkModule;

/**
 * Creates (but does not start syncing) a Matrix client for the given actor:
 * resumes from a stored credential record, or runs one silent SSO round-trip
 * when none is usable. Registers the resulting client so an Alkemio sign-out
 * can stop it. Starting the sync loop and reacting to a dead session are a
 * later concern, once something actually reads from the client.
 */
const establishSession = async (actorId: string, hooks: EstablishmentHooks = {}): Promise<SessionHandle> => {
  const loadSdk = hooks.loadSdk ?? defaultLoadSdk;
  const silentSso =
    hooks.silentSso ??
    ((expectedLocalpart: string, signal: AbortSignal) => attemptSilentSso(expectedLocalpart, { signal }));

  let activeClient: MatrixClientLike | null = null;
  let stopped = false;
  // Cancels an in-flight silent SSO: its iframe would otherwise go on to
  // persist fresh credentials after this session has already been stopped.
  const ssoAbort = new AbortController();

  const shutdown = (): void => {
    stopped = true;
    ssoAbort.abort();
    activeClient?.stopClient();
    unregisterActiveSession(signOut);
  };
  const handle: SessionHandle = { stop: shutdown };
  const signOut = (): void => shutdown();
  registerActiveSession(signOut);
  if (hooks.signal?.aborted) {
    handle.stop();
  }
  hooks.signal?.addEventListener('abort', () => handle.stop());

  const loadRecordForActor = async (): Promise<CredentialRecord | null> => {
    const storedUserId = await findStoredUserId(actorId);
    if (!storedUserId) {
      return null;
    }
    const record = (await loadCredentials(storedUserId)).record;
    if (record && !record.userId.toLowerCase().startsWith(`@${actorId.toLowerCase()}:`)) {
      await clearNamespace(storedUserId);
      return null;
    }
    return record;
  };

  try {
    let record = await loadRecordForActor();
    if (!record) {
      const outcome = await silentSso(actorId.toLowerCase(), ssoAbort.signal);
      if (outcome === 'authenticated') {
        record = await loadRecordForActor();
      }
    }
    if (stopped || !record) {
      return handle;
    }

    const sdk = await loadSdk();
    const client = sdk.createClient({
      baseUrl: record.homeserverUrl,
      userId: record.userId,
      deviceId: record.deviceId,
      accessToken: record.accessToken,
    });
    if (stopped) {
      client.stopClient();
      return handle;
    }
    activeClient = client;
  } catch {
    // Establishment failure leaves nothing to stop; the next load retries.
  }

  return handle;
};

export { establishSession };
export type { EstablishmentHooks, SessionHandle, MatrixSdkModule, MatrixClientLike };
