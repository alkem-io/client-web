import { Configuration, PublicApi } from '@ory/kratos-client';
import { useMemo } from 'react';
import { AuthenticationProviderConfigUnion, OryConfig } from '../types/graphql-schema';
import { useConfig } from './useConfig';

export function isOryConfig(pet: AuthenticationProviderConfigUnion): pet is OryConfig {
  return (pet as OryConfig).__typename === 'OryConfig';
}

export const handleFlowError = err => {
  const response = err && err.response;
  if (response) {
    if (response.status === 410) {
      window.location.replace(response.data.error.details.redirect_to);
    }
  }
};

export const useKratosClient = () => {
  const { authentication } = useConfig();

  return useMemo(() => {
    const config = authentication.providers.map(x => x.config).find(x => isOryConfig(x));
    return new PublicApi(new Configuration({ basePath: config?.kratosPublicBaseURL }));
  }, [authentication]);
};
