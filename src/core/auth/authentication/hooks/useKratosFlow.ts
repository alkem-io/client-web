import {
  SelfServiceLoginFlow,
  SelfServiceRecoveryFlow,
  SelfServiceRegistrationFlow,
  SelfServiceSettingsFlow,
  SelfServiceVerificationFlow,
  V0alpha2Api,
} from '@ory/kratos-client';
import { AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useKratosClient } from './useKratosClient';

type FlowTypes =
  | SelfServiceLoginFlow
  | SelfServiceRegistrationFlow
  | SelfServiceSettingsFlow
  | SelfServiceVerificationFlow
  | SelfServiceRecoveryFlow;

export enum FlowTypeName {
  Login = 'Login',
  Registration = 'Registration',
  Settings = 'Settings',
  Verification = 'Verification',
  Recovery = 'Recovery',
}

type ReturnFlowType = {
  [FlowTypeName.Login]: SelfServiceLoginFlow;
  [FlowTypeName.Registration]: SelfServiceRegistrationFlow;
  [FlowTypeName.Settings]: SelfServiceSettingsFlow;
  [FlowTypeName.Verification]: SelfServiceVerificationFlow;
  [FlowTypeName.Recovery]: SelfServiceRecoveryFlow;
};

interface ReturnValue<Name extends FlowTypeName> {
  flow: ReturnFlowType[Name] | undefined;
  error: Error | undefined;
  loading: boolean;
}

const useKratosFlow = <Name extends FlowTypeName>(
  flowTypeName: Name,
  flowId: string | undefined
): ReturnValue<Name> => {
  const client = useKratosClient();
  const [flow, setFlow] = useState<ReturnFlowType[Name]>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  const handleFlowError = useCallback(err => {
    const response = err && err.response;
    if (response) {
      if (response.status === 410) {
        window.location.replace(response.data.error.details.redirect_to);
      } else {
        setError(err.message);
      }
    }
  }, []);

  const handlePromise = useCallback(
    async (promise: Promise<AxiosResponse<FlowTypes>>) => {
      try {
        setLoading(true);
        const { status, data } = await promise;
        if (status !== 200) {
          setError(new Error('Error loading flow!'));
        }
        setFlow(data as ReturnFlowType[Name]);
      } catch (error) {
        handleFlowError(error);
      } finally {
        setLoading(false);
      }
    },
    [handleFlowError]
  );

  const initializeFlow = useCallback(
    (client: V0alpha2Api) => {
      switch (flowTypeName as FlowTypeName) {
        case FlowTypeName.Login:
          return client.initializeSelfServiceLoginFlowForBrowsers();
        case FlowTypeName.Registration:
          return client.initializeSelfServiceRegistrationFlowForBrowsers();
        case FlowTypeName.Recovery:
          return client.initializeSelfServiceRecoveryFlowForBrowsers();
        case FlowTypeName.Verification:
          return client.initializeSelfServiceVerificationFlowForBrowsers();
        case FlowTypeName.Settings:
          return client.initializeSelfServiceSettingsFlowForBrowsers();
      }
    },
    [flowTypeName]
  );

  const getFlow = useCallback(
    (client: V0alpha2Api, flowId: string) => {
      switch (flowTypeName as FlowTypeName) {
        case FlowTypeName.Login:
          return client.getSelfServiceLoginFlow(flowId);
        case FlowTypeName.Registration:
          return client.getSelfServiceRegistrationFlow(flowId);
        case FlowTypeName.Recovery:
          return client.getSelfServiceRecoveryFlow(flowId);
        case FlowTypeName.Verification:
          return client.getSelfServiceVerificationFlow(flowId);
        case FlowTypeName.Settings:
          return client.getSelfServiceSettingsFlow(flowId);
      }
    },
    [flowTypeName]
  );

  const getOrInitializeFlow = () => {
    if (client) {
      handlePromise(typeof flowId === 'undefined' ? initializeFlow(client) : getFlow(client, flowId));
    }
  };

  useEffect(getOrInitializeFlow, [client, flowId, getFlow, handlePromise, initializeFlow]);

  return {
    flow,
    error,
    loading,
  };
};

export default useKratosFlow;
