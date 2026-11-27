import type { MatrixClient } from 'matrix-js-sdk';
import { isAppMode } from '@/core/appMode/isAppMode';
import { setActiveClient, setSessionEstablishing, setSyncState } from './activeClient';
import { registerActiveSession, unregisterActiveSession } from './activeSession';
import { serverSideLogout } from './logoutCleanup';
import { mintAndStore } from './mintSession';
import { quietSdkLogging } from './sdkLogging';
import {
  announceDeviceChanged,
  askOtherTabs,
  canCoordinate,
  listenToOtherTabs,
  withCredentialLock,
} from './sharedDevice';
import { attemptSilentSso } from './ssoLogin';
import {
  type CredentialRecord,
  clearNamespace,
  loadActorCredentials,
  loadCredentials,
  storeCredentials,
} from './storage';
import { renewTokens } from './tokenRefresh';

// matrix-js-sdk's HttpApiEvent.SessionLoggedOut: emitted when the homeserver
// rejects the access token (M_UNKNOWN_TOKEN). A string here keeps the SDK a
// lazily loaded chunk.
const SESSION_LOGGED_OUT = 'Session.logged_out';
const CLIENT_SYNC = 'sync';

// Room timelines start from the sync response; history deeper than this is
// paged in when a conversation is opened.
const INITIAL_SYNC_LIMIT = 20;

const RENEW_BEFORE_MS = 60_000;

// Synapse nonrefreshable_access_token_lifetime (infra-ops/dev-orchestration synapse config): how long a
// credential without a refresh token lives. /login reports no expiry for it, so it is copied here; keep in step.
const NONREFRESHABLE_TOKEN_LIFETIME_MS = 48 * 60 * 60 * 1000;
// Rotate this long before expiry, so no call shorter than this starts on a credential that expires mid-call.
const ROTATE_MARGIN_MS = 8 * 60 * 60 * 1000;
// A record the homeserver renews in place (renewIfDue below) is never rotated.
const isRotationDue = (record: CredentialRecord, now: number): boolean =>
  !record.refreshToken &&
  (record.issuedAt === undefined || now - record.issuedAt >= NONREFRESHABLE_TOKEN_LIFETIME_MS - ROTATE_MARGIN_MS);

type MatrixClientLike = {
  stopClient(): void;
  startClient(opts?: { initialSyncLimit?: number; lazyLoadMembers?: boolean }): Promise<void>;
  on(event: string, listener: (state?: string) => void): unknown;
  setAccessToken(token: string): void;
  setSyncPresence(presence: 'offline'): Promise<void>;
};

type SessionHandle = {
  readonly stop: () => void;
};

type SessionOptions = {
  readonly signal?: AbortSignal;
  /** The platform origin the silent-SSO callback lives on. */
  readonly platformOrigin?: string;
};

/**
 * Establishes and syncs the browser's Matrix session for the given actor:
 * resumes from a stored credential record, or runs one silent SSO round-trip
 * when none is usable, then starts the sync loop and publishes the client to
 * the read hooks. Registers the session so an Alkemio sign-out can stop it.
 *
 * The access token is renewed in place before it expires. A rejected token
 * restarts on another device's stored credential when there is one; otherwise
 * it deletes the stored credential, logs that device out on the homeserver, and
 * gets one silent SSO and restart. If that
 * restart is rejected before it has synced, the session stays stopped. A
 * restart that syncs earns a fresh recovery for the next expiry.
 * A call click first rotates a non-renewable credential near its expiry, on a new device.
 *
 * All tabs of the browser share one device: every acquisition, recovery and
 * rotation runs under the user's credential lock and reuses a stored credential
 * before creating a device; a tab with nothing stored first adopts the one a
 * running tab holds. A sign-out or a replaced device in another tab reaches
 * this one at once.
 */
const establishSession = async (
  actorId: string,
  { signal, platformOrigin }: SessionOptions = {}
): Promise<SessionHandle> => {
  let activeClient: MatrixClientLike | null = null;
  // The record the active client was built from; null exactly while no client is active.
  let running: CredentialRecord | null = null;
  // The last record a rotation was attempted for: one attempt per credential.
  let tried: CredentialRecord | null = null;
  let rotation: Promise<boolean> | null = null;
  let recoveryUsed = false;
  // Cancels an in-flight silent SSO: its iframe would otherwise go on to
  // persist fresh credentials after this session has already been stopped.
  const abort = new AbortController();
  // Ends this tab's acquisition in flight. Replaced when the browser signs out
  // in another tab, so the session stays able to resume afterwards.
  let attempt = new AbortController();
  // Boot, recovery, rotation and following another tab, while in flight; a
  // device change announced meanwhile is followed once they have finished.
  let busy = 0;
  let followPending = false;

  const stopClient = (): void => {
    activeClient?.stopClient();
    activeClient = null;
    running = null;
    setActiveClient(null);
  };

  // A session that was stopped must not clear the flag a newer session has set.
  const finishEstablishing = (): void => {
    if (!abort.signal.aborted) {
      setSessionEstablishing(false);
    }
  };

  const stop = (): void => {
    abort.abort();
    attempt.abort();
    setSessionEstablishing(false);
    stopClient();
    unregisterActiveSession(stop);
    stopListening();
  };

  // Runs under the credential lock. A device it creates is announced, so the other tabs move to it.
  const loadOrAcquireRecord = async (
    attemptSignal: AbortSignal,
    replacing?: string
  ): Promise<CredentialRecord | null> => {
    const record = await loadActorCredentials(actorId);
    if (record && record.deviceId !== replacing) {
      return record;
    }
    // Nothing stored, yet another tab may still be running on a live device:
    // that device is shared rather than a second one created. Only under the
    // lock, so two tabs starting together cannot both miss it.
    if (!record && replacing === undefined && canCoordinate()) {
      const live = await askOtherTabs(actorId, attemptSignal);
      if (live && !attemptSignal.aborted && (await storeCredentials(live))) {
        return live;
      }
    }
    const acquired = await acquireRecord(attemptSignal, replacing);
    if (acquired) {
      announceDeviceChanged(acquired);
    }
    return acquired;
  };

  const acquireRecord = async (attemptSignal: AbortSignal, replacing?: string): Promise<CredentialRecord | null> => {
    // The app skips silent SSO entirely: no identity-origin cookie exists in
    // this WebView's jar, so the iframe cannot complete — and on Android the
    // attempt is actively harmful, because the shell intercepts the iframe's
    // hop through identity.<host>/login and navigates the MAIN WebView to a
    // "Sign in to continue" landing. See workspace#091 spec FR-014.
    if (!isAppMode()) {
      const outcome = await attemptSilentSso(actorId, { signal: attemptSignal, platformOrigin, replacing });
      if (outcome === 'authenticated') {
        return loadActorCredentials(actorId);
      }
    }
    // M3 mandates this leg for the app; reached in a BROWSER only after SSO
    // fails, which is the one credential-issuance path this feature adds
    // there — spec R-7(b).
    return mintAndStore(attemptSignal);
  };

  const transition = async <T>(task: () => Promise<T>): Promise<T> => {
    busy++;
    try {
      return await task();
    } finally {
      busy--;
      if (busy === 0 && followPending) {
        followPending = false;
        follow();
      }
    }
  };

  // Another tab changed the shared device (it signed in, rotated it, or
  // recovered after the homeserver rejected it): this tab's device is retired
  // or already dead, so it moves to whatever is stored now. Reading storage
  // rather than the announcement keeps it on the latest of several changes.
  const follow = (): void => {
    if (abort.signal.aborted) {
      return;
    }
    if (busy > 0) {
      followPending = true;
      return;
    }
    void transition(async () => {
      const { signal: attemptSignal } = attempt;
      const record = await withCredentialLock(actorId, () => loadActorCredentials(actorId));
      if (!abort.signal.aborted && !attemptSignal.aborted && record && record.deviceId !== running?.deviceId) {
        stopClient();
        await start(record, attemptSignal);
      }
    }).catch(() => undefined);
  };

  // `attemptSignal` is the attempt current when the caller read `record`: a
  // sign-out elsewhere since then means that record is being logged out.
  const start = async (record: CredentialRecord, attemptSignal: AbortSignal): Promise<void> => {
    await quietSdkLogging();
    const sdk = (await import('matrix-js-sdk')) as unknown as {
      createClient(opts: {
        baseUrl: string;
        userId: string;
        deviceId: string;
        accessToken: string;
        fetchFn?: typeof fetch;
      }): MatrixClientLike;
    };
    let current = record;
    let renewal: Promise<void> | undefined;

    const renewIfDue = async (): Promise<void> => {
      if (
        current.refreshToken === undefined ||
        current.expiresAt === undefined ||
        Date.now() < current.expiresAt - RENEW_BEFORE_MS
      ) {
        return;
      }
      renewal ??= renewTokens(current)
        .then(
          tokens => {
            if (activeClient !== client) {
              return;
            }
            if (tokens) {
              current = { ...current, ...tokens };
              running = current;
              client.setAccessToken(tokens.accessToken);
            } else {
              void recover(current);
            }
          },
          // Transient: a later request tries again.
          () => undefined
        )
        .finally(() => {
          renewal = undefined;
        });
      // Still valid: the renewal finishes in the background.
      if (Date.now() < current.expiresAt) {
        return;
      }
      await renewal;
      if (Date.now() >= current.expiresAt) {
        // Never send a token known to be dead; the SDK treats this as a connection error and retries.
        throw new TypeError('Matrix access token expired');
      }
    };

    const fetchFn: typeof fetch = async (input, init) => {
      // The token the SDK built this request's header with.
      const sentWith = current.accessToken;
      await renewIfDue();
      if (current.accessToken !== sentWith) {
        const headers = new Headers(init?.headers);
        if (headers.get('Authorization') === `Bearer ${sentWith}`) {
          headers.set('Authorization', `Bearer ${current.accessToken}`);
        }
        init = { ...init, headers };
      }
      return fetch(input, init);
    };

    const client = sdk.createClient({
      baseUrl: record.homeserverUrl,
      userId: record.userId,
      deviceId: record.deviceId,
      accessToken: record.accessToken,
      fetchFn,
    });
    if (abort.signal.aborted || attemptSignal.aborted) {
      client.stopClient();
      return;
    }
    client.on(SESSION_LOGGED_OUT, () => {
      if (activeClient === client) {
        void recover(current);
      }
    });
    client.on(CLIENT_SYNC, state => {
      if (activeClient === client) {
        setSyncState(state ?? null);
      }
      if (state === 'PREPARED') {
        recoveryUsed = false;
      }
    });
    activeClient = client;
    running = record;
    setActiveClient(client as unknown as MatrixClient);
    await client.startClient({ initialSyncLimit: INITIAL_SYNC_LIMIT, lazyLoadMembers: true });
    // "Show when I'm online" arrives as account data with the first sync, so that sync is
    // offline for everyone and useShowOnlinePreference applies the setting once it is done.
    // Not earlier: the sync loop that takes it is created by startClient, and its first
    // request still waits on the push rules and filter fetches.
    void client.setSyncPresence('offline');
  };

  const recover = (rejected: CredentialRecord): Promise<void> => transition(() => recoverNow(rejected));

  const recoverNow = async (rejected: CredentialRecord): Promise<void> => {
    const { signal: attemptSignal } = attempt;
    stopClient();
    let establishing = false;
    try {
      const record = await withCredentialLock(actorId, async () => {
        try {
          const stored = await loadCredentials(rejected.userId);
          if (!stored || stored.deviceId === rejected.deviceId) {
            // A refused renewal can mean a thief rotated this device's refresh
            // chain. Logging out with the last access token ends that chain only
            // if the thief has not yet refreshed again: a second rotation deletes
            // this token on Synapse, and the logout fails (accepted residual R-5).
            // Started first, so a failed local delete cannot skip it.
            void serverSideLogout(rejected);
            await clearNamespace(rejected.userId);
          }
        } catch {
          // The record is unusable either way; a failed delete must not block recovery.
        }
        if (abort.signal.aborted || recoveryUsed) {
          return null;
        }
        recoveryUsed = true;
        establishing = true;
        setSessionEstablishing(true);
        // The rejected device is never taken back, from storage or from another tab.
        return loadOrAcquireRecord(attemptSignal, rejected.deviceId);
      });
      if (!abort.signal.aborted && record) {
        await start(record, attemptSignal);
      }
    } catch {
      // Fails closed: the session stays stopped until the next page load.
    } finally {
      if (establishing) {
        finishEstablishing();
      }
    }
  };

  // Resolves true when a rotation was attempted (the caller then waits for the new session),
  // false only when nothing was due or this credential was already tried.
  const rotateIfDue = (): Promise<boolean> => {
    if (rotation) {
      return rotation;
    }
    const old = running;
    if (!old || tried === old || !isRotationDue(old, Date.now())) {
      return Promise.resolve(false);
    }
    tried = old;
    rotation = transition(async () => {
      const { signal: attemptSignal } = attempt;
      let swapped = false;
      try {
        // A stored record of another device means another tab already rotated: it is taken over, not re-acquired.
        const fresh = await withCredentialLock(actorId, () => loadOrAcquireRecord(attemptSignal, old.deviceId));
        // Overtaken by stop() or recover(), or nothing acquired: leave the session as it is.
        if (running === old && fresh) {
          swapped = true;
          setSessionEstablishing(true);
          stopClient();
          // Best effort, so the replaced device is gone early rather than at its expiry.
          void serverSideLogout(old);
          await start(fresh, attemptSignal);
        }
      } catch {
        // Before the swap nothing changed. After stopClient() chat fails closed until reload, like recover().
      } finally {
        if (swapped) {
          finishEstablishing();
        }
        rotation = null;
      }
      return true;
    });
    return rotation;
  };

  // The browser signed out in another tab: this tab drops its credential and
  // ends any acquisition in flight, but stays able to follow the next sign-in.
  // The device that tab logged out is this tab's own, unless the two had
  // diverged; then this one is logged out here.
  const signedOutElsewhere = (deviceIds: readonly string[]): void => {
    const own = running;
    attempt.abort();
    attempt = new AbortController();
    followPending = false;
    stopClient();
    if (own && !deviceIds.includes(own.deviceId)) {
      void serverSideLogout(own);
    }
  };

  const stopListening = listenToOtherTabs(actorId, {
    running: () => running,
    onDeviceChanged: follow,
    onSignedOut: signedOutElsewhere,
  });

  registerActiveSession(stop, rotateIfDue);
  if (signal?.aborted) {
    stop();
  }
  signal?.addEventListener('abort', stop);

  if (!abort.signal.aborted) {
    setSessionEstablishing(true);
  }
  try {
    await transition(async () => {
      const { signal: attemptSignal } = attempt;
      const record = await withCredentialLock(actorId, () => loadOrAcquireRecord(attemptSignal));
      if (!abort.signal.aborted && record) {
        await start(record, attemptSignal);
      }
    });
  } catch {
    // Establishment failure leaves nothing to stop; the next load retries.
  } finally {
    finishEstablishing();
  }

  return { stop };
};

export { establishSession };
export type { MatrixClientLike };
