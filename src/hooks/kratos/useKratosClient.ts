import { Configuration, UiContainer, V0alpha2Api } from '@ory/kratos-client';
import { useMemo, useRef } from 'react';
import { AuthenticationProviderConfigUnion, OryConfig } from '../../models/graphql-schema';
import { useConfig } from '../useConfig';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { once } from 'lodash';
import { error as logError } from '../../services/logging/sentry/log';

export function isOryConfig(pet: AuthenticationProviderConfigUnion): pet is OryConfig {
  return (pet as OryConfig).__typename === 'OryConfig';
}

const logFlowErrors = (response: AxiosResponse<{ ui: UiContainer } | {}>) => {
  if ('ui' in response.data && response.data.ui.messages) {
    for (const { text, type } of response.data.ui.messages) {
      if (type !== 'error') {
        continue;
      }
      const errorMessage = 'Kratos Flow Error: ' + text;
      logError(new Error(errorMessage));
    }
  }
};

const isWhoamiError401 = (error: AxiosError) =>
  error.config.url?.endsWith('/sessions/whoami') && error.response?.data?.error?.code === 401;

const isAxiosError = (error: { isAxiosError: boolean }): error is AxiosError => error.isAxiosError;

const getKratosErrorMessage = (requestError: AxiosError) => {
  if (requestError.response?.data) {
    const { message, reason, error } = requestError.response?.data;
    const errorMessage = message ? [message, reason].filter(v => v).join(' ') : error.message;
    return `Kratos Error: ${errorMessage}`;
  } else {
    return `Kratos ${requestError}`;
  }
};

const createAxiosClient = () => {
  const client = axios.create();
  client.interceptors.response.use(
    value => {
      try {
        logFlowErrors(value);
      } catch (e) {}
      return value;
    },
    error => {
      if (isAxiosError(error) && !isWhoamiError401(error)) {
        const errorMessage = getKratosErrorMessage(error);
        logError(new Error(errorMessage));
      }
      throw error;
    }
  );
  return client;
};

export const useKratosClient = () => {
  const { authentication } = useConfig();

  const axiosClient = useRef(once(createAxiosClient)).current();

  return useMemo(() => {
    if (!authentication) {
      return undefined;
    }
    const config = authentication?.providers.map(x => x.config).find(x => isOryConfig(x));
    const apiConfig = new Configuration({ basePath: config?.kratosPublicBaseURL });
    return new V0alpha2Api(apiConfig, undefined, axiosClient);
  }, [authentication]);
};
