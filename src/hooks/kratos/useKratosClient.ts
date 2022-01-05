import { Configuration, V0alpha2Api } from '@ory/kratos-client';
import { useMemo } from 'react';
import { AuthenticationProviderConfigUnion, OryConfig } from '../../models/graphql-schema';
import { useConfig } from '../useConfig';

export function isOryConfig(pet: AuthenticationProviderConfigUnion): pet is OryConfig {
  return (pet as OryConfig).__typename === 'OryConfig';
}

export const useKratosClient = () => {
  const { authentication } = useConfig();

  return useMemo(() => {
    if (!authentication) return undefined;
    const config = authentication?.providers.map(x => x.config).find(x => isOryConfig(x));
    return new V0alpha2Api(new Configuration({ basePath: config?.kratosPublicBaseURL }));
  }, [authentication]);
};
