import {
  SelfServiceLoginFlow,
  SelfServiceRecoveryFlow,
  SelfServiceRegistrationFlow,
  SelfServiceSettingsFlow,
  SelfServiceVerificationFlow,
} from '@ory/kratos-client';
import { AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';
import { useKratosClient } from './useKratosClient';

type FlowTypes =
  | SelfServiceLoginFlow
  | SelfServiceRegistrationFlow
  | SelfServiceSettingsFlow
  | SelfServiceVerificationFlow
  | SelfServiceRecoveryFlow;

export const useKratos = () => {
  const client = useKratosClient();
  const [flow, setFlow] = useState<FlowTypes>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>();

  const handleFlowError = err => {
    debugger;
    const response = err && err.response;
    if (response) {
      if (response.status === 410) {
        window.location.replace(response.data.error.details.redirect_to);
      } else {
        setError(err.message);
      }
    }
  };

  const handlePromise = (promise: Promise<AxiosResponse<FlowTypes>>) => {
    setLoading(true);
    promise
      .then(({ status, data }) => {
        if (status !== 200) {
          console.error(data);
          setError(new Error('Error loading flow!'));
        }
        setFlow(data);
      })
      .catch(handleFlowError)
      .finally(() => {
        setLoading(false);
      });
  };

  const initializeLoginFlow = useCallback(() => {
    if (client) {
      handlePromise(client.initializeSelfServiceLoginFlowForBrowsers());
    }
  }, [client]);

  const initializeRegistrationFlow = useCallback(() => {
    if (client) {
      handlePromise(client.initializeSelfServiceRegistrationFlowForBrowsers());
    }
  }, [client]);

  const initializeRecoveryFlow = useCallback(() => {
    if (client) {
      handlePromise(client.initializeSelfServiceRecoveryFlowForBrowsers());
    }
  }, [client]);

  const initializeVerificationFlow = useCallback(() => {
    if (client) {
      handlePromise(client.initializeSelfServiceVerificationFlowForBrowsers());
    }
  }, [client]);

  const initializeSettingsFlow = useCallback(() => {
    if (client) {
      handlePromise(client.initializeSelfServiceSettingsFlowForBrowsers());
    }
  }, [client]);

  const getSelfServiceLoginFlow = useCallback(
    (flowId?: string) => {
      if (client) {
        if (flowId) {
          handlePromise(client.getSelfServiceLoginFlow(flowId));
        } else {
          initializeLoginFlow();
        }
      }
    },
    [client]
  );

  const getSelfServiceRegistrationFlow = useCallback(
    (flowId?: string) => {
      if (client) {
        if (flowId) {
          handlePromise(client.getSelfServiceRegistrationFlow(flowId));
        } else {
          initializeRegistrationFlow();
        }
      }
    },
    [client]
  );

  const getSelfServiceRecoveryFlow = useCallback(
    (flowId?: string) => {
      if (client) {
        if (flowId) {
          handlePromise(client.getSelfServiceRecoveryFlow(flowId));
        } else {
          initializeRecoveryFlow();
        }
      }
    },
    [client]
  );

  const getSelfServiceVerificationFlow = useCallback(
    (flowId?: string) => {
      if (client) {
        if (flowId) {
          handlePromise(client.getSelfServiceVerificationFlow(flowId));
        } else {
          initializeVerificationFlow();
        }
      }
    },
    [client]
  );

  const getSelfServiceSettingsFlow = useCallback(
    (flowId?: string) => {
      if (client) {
        if (flowId) {
          handlePromise(client.getSelfServiceSettingsFlow(flowId));
        } else {
          initializeSettingsFlow();
        }
      }
    },
    [client]
  );

  return {
    loginFlow: flow as SelfServiceLoginFlow,
    registrationFlow: flow as SelfServiceRegistrationFlow,
    recoveryFlow: flow as SelfServiceRecoveryFlow,
    settingsFlow: flow as SelfServiceSettingsFlow,
    verificationFlow: flow as SelfServiceVerificationFlow,
    error,
    loading,
    // initializeLoginFlow,
    // initializeRegistrationFlow,
    // initializeRecoveryFlow,
    // initializeVerificationFlow,
    // initializeSettingsFlow,
    getLoginFlow: getSelfServiceLoginFlow,
    getRecoveryFlow: getSelfServiceRecoveryFlow,
    getRegistrationFlow: getSelfServiceRegistrationFlow,
    getSettingsFlow: getSelfServiceSettingsFlow,
    getVerificationFlow: getSelfServiceVerificationFlow,
  };
};
