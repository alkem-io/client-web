import { registerActiveSession, unregisterActiveSession } from './activeSession';
import { attemptSilentSso } from './ssoLogin';
import { type CredentialRecord, findStoredUserId, loadCredentials } from './storage';

type MatrixClientLike = {
  stopClient(): void;
};

type SessionHandle = {
  readonly stop: () => void;
};

/**
 * Creates (but does not start syncing) a Matrix client for the given actor:
 * resumes from a stored credential record, or runs one silent SSO round-trip
 * when none is usable. Registers the resulting client so an Alkemio sign-out
 * can stop it. Starting the sync loop and reacting to a dead session are a
 * later concern, once something actually reads from the client.
 */
const establishSession = async (actorId: string, { signal }: { signal?: AbortSignal } = {}): Promise<SessionHandle> => {
  let activeClient: MatrixClientLike | null = null;
  // Cancels an in-flight silent SSO: its iframe would otherwise go on to
  // persist fresh credentials after this session has already been stopped.
  const abort = new AbortController();

  const stop = (): void => {
    abort.abort();
    activeClient?.stopClient();
    unregisterActiveSession(stop);
  };
  registerActiveSession(stop);
  signal?.addEventListener('abort', stop);

  const loadRecordForActor = async (): Promise<CredentialRecord | null> => {
    const id = await findStoredUserId(actorId);
    return id ? loadCredentials(id) : null;
  };

  try {
    let record = await loadRecordForActor();
    if (!record) {
      const outcome = await attemptSilentSso(actorId, { signal: abort.signal });
      if (outcome === 'authenticated') {
        record = await loadRecordForActor();
      }
    }
    if (abort.signal.aborted || !record) {
      return { stop };
    }

    const sdk = (await import('matrix-js-sdk')) as unknown as {
      createClient(opts: { baseUrl: string; userId: string; deviceId: string; accessToken: string }): MatrixClientLike;
    };
    const client = sdk.createClient({
      baseUrl: record.homeserverUrl,
      userId: record.userId,
      deviceId: record.deviceId,
      accessToken: record.accessToken,
    });
    if (abort.signal.aborted) {
      client.stopClient();
      return { stop };
    }
    activeClient = client;
  } catch {
    // Establishment failure leaves nothing to stop; the next load retries.
  }

  return { stop };
};

export { establishSession };
export type { MatrixClientLike };
