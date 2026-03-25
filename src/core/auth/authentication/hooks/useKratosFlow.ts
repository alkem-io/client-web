import type {
  FrontendApi,
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
} from '@ory/kratos-client';
import type { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
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

const useKratosFlow = <Name extends FlowTypeName>(
  flowTypeName: Name,
  flowId: string | undefined
): ReturnValue<Name> => {
  const client = useKratosClient();
  const [flow, setFlow] = useState<ReturnFlowType[Name]>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  const handleFlowError = (err: unknown) => {
    const response = (err as { response?: { status: number; data: { error: { details: { redirect_to: string } } } } })
      ?.response;
    if (response) {
      if (response.status === 410) {
        window.location.replace(response.data.error.details.redirect_to);
      } else {
        const error = new Error((err as { message: string }).message);
        setError(error);
        logError(error, { category: TagCategoryValues.AUTH });
      }
    }
  };

  const handlePromise = async (promise: Promise<AxiosResponse<FlowTypes>>) => {
    try {
      setLoading(true);
      const { status, data } = await promise;
      if (status !== 200) {
        const error = new Error(`Error loading flow! Status: ${status}`);
        setError(error);
        logError(error, { category: TagCategoryValues.AUTH });
      }
      setFlow(data as ReturnFlowType[Name]);
    } catch (error) {
      handleFlowError(error);
    } finally {
      setLoading(false);
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
        return client.createBrowserSettingsFlow();
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

  useEffect(() => {
    getOrInitializeFlow();
  }, [client, flowId]);

  return {
    flow,
    error,
    loading,
    refetch: getOrInitializeFlow,
  };
};

export default useKratosFlow;
