import { privateGraphQLEndpoint } from '@/main/constants/endpoints';
import { getConfig } from './matrixConfig';
import { type CredentialRecord, clearNamespace, storeCredentials } from './storage';

// The mutation takes no variables — there is no subject to pass (spec D4).
const MINT_MUTATION = 'mutation MintMatrixSession { mintMatrixSession { userId deviceId accessToken } }';

// The platform can accept the POST and never answer — an ordinary condition on a
// mobile network, not a speculative edge. The caller's signal aborts on sign-out,
// which is not a time limit, so with no deadline `establishSession` stays pending
// for good: `start()` never runs and `setSessionEstablishing(false)` never fires.
// In app mode this is the ONLY acquisition path, so chat would sit silently dead
// until the page reloads. 20s is `attemptSilentSso`'s own deadline, which is what
// the `catch` below means by failing "exactly like a timed-out SSO".
const MINT_TIMEOUT_MS = 20_000;

type MintResponse = {
  readonly data?: { readonly mintMatrixSession?: { userId: string; deviceId: string; accessToken: string } | null };
  readonly errors?: ReadonlyArray<unknown>;
};

/**
 * Acquires credentials for the current actor from the platform API, for the
 * case the silent-SSO round-trip cannot run — the native app WebView, which
 * holds no identity-origin cookie at all (workspace#091 spec §0).
 *
 * Stores them exactly as the SSO callback does and returns the record, or null
 * when Matrix is not configured, the mutation fails, the response is
 * incomplete, the attempt was aborted, or the request outlived MINT_TIMEOUT_MS.
 *
 * Posted with `fetch` rather than through the app's Apollo client, for the same
 * three reasons `exchangeLoginToken` next door does: this runs in a
 * framework-free controller with no React context; the minted token must never
 * enter the normalized cache (here it cannot, by construction, rather than by a
 * `fetchPolicy` flag); and a failed acquisition must stay silent (FR-024).
 */
const mintAndStore = async (signal?: AbortSignal): Promise<CredentialRecord | null> => {
  const { homeserverUrl } = getConfig();
  if (homeserverUrl === '' || signal?.aborted) {
    return null;
  }

  // Composed by hand rather than with AbortSignal.any(): Safari shipped that in
  // 17.4, under the repo's >90% support bar for a path every app launch takes.
  const attempt = new AbortController();
  const expire = setTimeout(() => attempt.abort(), MINT_TIMEOUT_MS);
  const propagate = () => attempt.abort();
  signal?.addEventListener('abort', propagate);

  try {
    const response = await fetch(privateGraphQLEndpoint, {
      method: 'POST',
      signal: attempt.signal,
      // Same-origin through the gateway, authenticated by the alkemio_session
      // cookie only — no Authorization header. Precedent for a non-React module
      // reaching the platform API this way: src/main/assistant/assistantApi.ts:19.
      credentials: 'include',
      // `application/json` is NOT a CORS-safelisted content type, which is
      // exactly the discriminator Apollo Server 4's default csrfPrevention
      // accepts (server/src/app.module.ts:157-200 sets no override). Do not
      // "simplify" this to text/plain and do not add apollo-require-preflight:
      // one is a 400, the other is a header with no job here.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: MINT_MUTATION }),
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as MintResponse;
    const credentials = body.errors?.length ? null : (body.data?.mintMatrixSession ?? null);
    if (!credentials) {
      return null;
    }

    const { userId, deviceId, accessToken } = credentials;
    // A record missing any field would be resumed unchecked until sign-out.
    if (!userId || !deviceId || !accessToken) {
      return null;
    }
    const record: CredentialRecord = { userId, deviceId, accessToken, homeserverUrl };
    // storeCredentials returns false on ANY IndexedDB failure (storage.ts:41-59).
    // Reporting a failed write as a persisted credential is worse than failing
    // closed: start() would run a session the next launch cannot resume, so the
    // app would mint a fresh Synapse device and audit row on every launch
    // (FR-020a). exchangeAndStore next door DISCARDS this boolean, which is why
    // it is checked here and not in a shared helper.
    if (!(await storeCredentials(record))) {
      return null;
    }
    // A sign-out during the write may already have listed and cleared the
    // stored namespaces; remove what this write left behind.
    if (signal?.aborted) {
      await clearNamespace(record.userId);
      return null;
    }
    return record;
  } catch {
    // Fail closed, exactly like a timed-out SSO.
    return null;
  } finally {
    clearTimeout(expire);
    signal?.removeEventListener('abort', propagate);
  }
};

export { mintAndStore };
