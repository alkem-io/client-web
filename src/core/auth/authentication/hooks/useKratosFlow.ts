import type {
  FrontendApi,
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
} from '@ory/kratos-client';
import type { AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import { useKratosClient } from './useKratosClient';

type FlowTypes = LoginFlow | RegistrationFlow | SettingsFlow | VerificationFlow | RecoveryFlow;

export enum FlowTypeName {
  Login = 'Login',
  Registration = 'Registration',
  Settings = 'Settings',
  Verification = 'Verification',
  Recovery = 'Recovery',
}

type ReturnFlowType = {
  [FlowTypeName.Login]: LoginFlow;
  [FlowTypeName.Registration]: RegistrationFlow;
  [FlowTypeName.Settings]: SettingsFlow;
  [FlowTypeName.Verification]: VerificationFlow;
  [FlowTypeName.Recovery]: RecoveryFlow;
};

export const KRATOS_SESSION_EXPIRED_ERROR_NAME = 'KratosSessionExpiredError';

/**
 * The identity provider's own browser session (`ory_kratos_session`) has
 * lapsed, so Kratos refuses to hand out a flow.
 *
 * Alkemio runs two independent sessions with independent lifetimes: the
 * platform's BFF session, which renews itself on ordinary use and never
 * consults the identity provider, and the identity provider's session, which
 * is only extended when the identity provider itself handles a request
 * (sign-in, settings, recovery). Someone who signed in once and has simply
 * been using the app keeps the first alive indefinitely while the second
 * quietly expires. The Security settings tab is the only surface that talks
 * to the identity provider directly, so it is the only place the divergence
 * ever shows up.
 *
 * This is a recoverable re-authentication prompt, not a failure, and it is
 * NOT fixed by reloading — only by signing in again. Consumers should
 * distinguish it (via `isKratosSessionExpiredError`) and present that path
 * rather than a generic error.
 */
export class KratosSessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    // Matched by name rather than prototype: the error crosses module
    // boundaries and is compared in code that may hold a separately-bundled
    // copy of this class, where `instanceof` silently fails.
    this.name = KRATOS_SESSION_EXPIRED_ERROR_NAME;
  }
}

export const isKratosSessionExpiredError = (error: unknown): error is KratosSessionExpiredError =>
  error instanceof Error && error.name === KRATOS_SESSION_EXPIRED_ERROR_NAME;

interface ReturnValue<Name extends FlowTypeName> {
  flow: ReturnFlowType[Name] | undefined;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

interface UseKratosFlowOptions {
  /**
   * Settings flow only (currently). Forwarded to `createBrowserSettingsFlow`
   * so the flow's own `return_to` — which takes precedence over the
   * configured default browser return URL — lands the person back where
   * they started once an OIDC link callback or a re-auth interruption
   * completes. Ignored for every other flow type.
   */
  returnTo?: string;
}

const useKratosFlow = <Name extends FlowTypeName>(
  flowTypeName: Name,
  flowId: string | undefined,
  options?: UseKratosFlowOptions
): ReturnValue<Name> => {
  const client = useKratosClient();
  const [flow, setFlow] = useState<ReturnFlowType[Name]>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);
  // Bumped on every request kickoff; a response is only applied if it is still the most recent
  // request in flight when it resolves. Without this, an earlier request that resolves after a
  // later one (e.g. `options.returnTo` flipping from empty to a real value right after mount)
  // can overwrite the newer flow with a stale one via `setFlow`'s last-write-wins semantics.
  const requestSeqRef = useRef(0);

  const handleFlowError = (err: unknown) => {
    const response = (
      err as {
        response?: {
          status: number;
          data: FlowTypes & {
            error?: { id?: string; details?: { redirect_to?: string; redirect_browser_to?: string } };
          };
        };
      }
    )?.response;
    if (response) {
      const redirectTarget =
        response.data.error?.details?.redirect_browser_to ?? response.data.error?.details?.redirect_to;
      if (response.status === 410 && redirectTarget) {
        window.location.replace(redirectTarget);
      } else if (response.status === 403 && redirectTarget) {
        // Kratos signals a stale-session re-auth requirement for privileged
        // Settings changes (e.g. password change) as HTTP 403 with
        // `error.id === 'session_refresh_required'` and a login-flow URL in
        // `redirect_browser_to`. Follow the redirect so the user re-authenticates;
        // Kratos will then return to the Settings flow.
        window.location.replace(redirectTarget);
      } else if (response.status === 401 && flowTypeName === FlowTypeName.Settings) {
        // The identity provider's session has lapsed (`session_inactive`)
        // while the platform's BFF session is still alive and renewing itself.
        // Recoverable by re-authenticating, never by reloading — see
        // `KratosSessionExpiredError`.
        //
        // Scoped to the Settings flow, unlike the 410 and 403 branches above.
        // Those two describe conditions any flow can be in (the flow expired;
        // this flow needs a fresher session). A 401 is different: the identity
        // provider's own endpoints only answer 401 for the settings flow, and
        // the reading placed on it here — "your identity-provider session
        // outlived the platform one, so sign out and back in" — is the
        // Settings-only divergence described above. Applying that reading to a
        // Login, Registration, Recovery or Verification 401 would attach a
        // navigation or a re-authentication prompt to a condition never
        // observed there; those flows keep the generic error they had.
        if (redirectTarget) {
          // Kratos named where to go (a login flow that returns here once
          // completed) — the same hand-off the 403 re-auth branch takes.
          window.location.replace(redirectTarget);
        } else {
          // Kratos answers a scripted (non-navigational) flow request with a
          // bare 401 and no redirect target, so there is nowhere to send the
          // browser unilaterally. Report it as its own typed, legible event
          // instead of an opaque `Error`, and let the consuming surface offer
          // signing in again.
          const errorId = response.data.error?.id ?? 'session_inactive';
          const error = new KratosSessionExpiredError(
            `Kratos ${flowTypeName} flow: identity provider session expired (401 ${errorId})`
          );
          setError(error);
          logError(error, { category: TagCategoryValues.AUTH, label: `${flowTypeName}FlowSessionExpired` });
        }
      } else if (response.status === 400 && response.data?.ui) {
        // Kratos v26.2.0+: OIDC account linking failures return HTTP 400
        // with the flow object containing error messages in the response body.
        setError(undefined);
        setFlow(response.data as ReturnFlowType[Name]);
      } else {
        const error = new Error((err as { message: string }).message);
        setError(error);
        logError(error, { category: TagCategoryValues.AUTH });
      }
    } else {
      // No HTTP response at all: a CORS rejection, a DNS/network failure, or an
      // aborted request. This case previously took no branch whatsoever —
      // nothing was stored as an error and nothing structured was logged, so
      // the consumer only failed through its downstream "no flow" fallback and
      // the sole telemetry was an opaque `Network Error` from the Axios
      // interceptor, carrying neither the URL nor the flow being loaded.
      // Record both so this class of failure is diagnosable from telemetry.
      const request = err as { config?: { url?: string; baseURL?: string }; message?: string };
      const requestUrl = `${request.config?.baseURL ?? ''}${request.config?.url ?? ''}` || 'unknown';
      const error = new Error(
        `Kratos ${flowTypeName} flow request failed with no response (url: ${requestUrl}): ${request.message ?? 'unknown error'}`
      );
      setError(error);
      logError(error, { category: TagCategoryValues.AUTH, label: `${flowTypeName}FlowNoResponse` });
    }
  };

  const handlePromise = async (promise: Promise<AxiosResponse<FlowTypes>>) => {
    const seq = ++requestSeqRef.current;
    try {
      setLoading(true);
      const { status, data } = await promise;
      // A newer request has since been kicked off (e.g. `options.returnTo` resolved right after
      // this one started) — this response is stale and must never win over the newer flow.
      if (seq !== requestSeqRef.current) return;
      if (status !== 200) {
        const error = new Error(`Error loading flow! Status: ${status}`);
        setError(error);
        logError(error, { category: TagCategoryValues.AUTH });
      } else {
        // A successful load supersedes any error from an earlier attempt —
        // without this, a retry after an outage keeps reporting the stale
        // error and the consumer never leaves its failure state.
        setError(undefined);
      }
      setFlow(data as ReturnFlowType[Name]);
    } catch (error) {
      if (seq !== requestSeqRef.current) return;
      handleFlowError(error);
    } finally {
      if (seq === requestSeqRef.current) setLoading(false);
    }
  };

  const initializeFlow = (client: FrontendApi) => {
    switch (flowTypeName as FlowTypeName) {
      case FlowTypeName.Login:
        return client.createBrowserLoginFlow();
      case FlowTypeName.Registration:
        return client.createBrowserRegistrationFlow();
      case FlowTypeName.Recovery:
        return client.createBrowserRecoveryFlow();
      case FlowTypeName.Verification:
        return client.createBrowserVerificationFlow();
      case FlowTypeName.Settings:
        return client.createBrowserSettingsFlow(options?.returnTo ? { returnTo: options.returnTo } : undefined);
    }
  };

  const getFlow = (client: FrontendApi, flowId: string) => {
    switch (flowTypeName as FlowTypeName) {
      case FlowTypeName.Login:
        return client.getLoginFlow({ id: flowId });
      case FlowTypeName.Registration:
        return client.getRegistrationFlow({ id: flowId });
      case FlowTypeName.Recovery:
        return client.getRecoveryFlow({ id: flowId });
      case FlowTypeName.Verification:
        return client.getVerificationFlow({ id: flowId });
      case FlowTypeName.Settings:
        return client.getSettingsFlow({ id: flowId });
    }
  };

  const getOrInitializeFlow = () => {
    if (!client) {
      return;
    }
    if (typeof flowId !== 'undefined') {
      handlePromise(getFlow(client, flowId));
      return;
    }
    // A login is only ever started through the OIDC BFF (Hydra → Kratos), which
    // lands back on `/login?flow=<id>`; `LoginCrdRoute` redirects there itself
    // when no flow id is present. Self-initiating a Kratos-native login flow
    // here is therefore never what the caller wants, and it is actively
    // harmful: `createBrowserLoginFlow` rotates the anti-CSRF cookie
    // server-side, so the Hydra-minted flow whose id arrives moments later can
    // no longer be read — Kratos answers `getLoginFlow` with 403
    // `security_csrf_violation` and sign-in dead-ends. `requestSeqRef` cannot
    // save this: the harm is the request's server-side side effect, not a
    // stale response winning a race, and by the time the response is discarded
    // the cookie has already moved on.
    if (flowTypeName === FlowTypeName.Login) {
      return;
    }
    handlePromise(initializeFlow(client));
  };

  // `options?.returnTo` only affects the Settings flow's initial creation
  // (`flowId` undefined); once a flow id is on the URL, `getFlow` ignores it.
  useEffect(() => {
    getOrInitializeFlow();
  }, [client, flowId, options?.returnTo]);

  return {
    flow,
    error,
    loading,
    refetch: getOrInitializeFlow,
  };
};

export default useKratosFlow;
