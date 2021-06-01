import { Configuration } from '../models/Configuration';
import { Config } from '../types/graphql-schema';

export const getConfig = (config?: Config): Configuration => {
  return {
    authentication: {
      ...config?.authentication,
      enabled: config?.authentication.enabled === undefined ?? false,
      providers: config?.authentication.providers || [],
    },
  };
};
