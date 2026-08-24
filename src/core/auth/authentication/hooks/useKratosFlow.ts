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
    if (client) {
      handlePromise(typeof flowId === 'undefined' ? initializeFlow(client) : getFlow(client, flowId));
    }
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
