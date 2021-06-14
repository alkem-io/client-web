import { Configuration, PublicApi } from '@ory/kratos-client';
import { useMemo } from 'react';
import { AuthenticationProviderConfigUnion, OryConfig } from '../types/graphql-schema';
import { useConfig } from './useConfig';

export function isOryConfig(pet: AuthenticationProviderConfigUnion): pet is OryConfig {
  return (pet as OryConfig).__typename === 'OryConfig';
}

export const useKratosClient = () => {
  const { authentication } = useConfig();

  return useMemo(() => {
    const config = authentication.providers.map(x => x.config).find(x => isOryConfig(x));
    return new PublicApi(new Configuration({ basePath: config?.kratosPublicBaseURL }));
  }, [authentication]);
};
