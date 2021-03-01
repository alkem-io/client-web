import { AadConfig } from '../generated/graphql';

export type Configuration = {
  authenticationProviders: AuthenticationProvider[];
};

export type AuthenticationProvider = {
  name: string;
  label: string;
  icon: string;
  config: AADConfig | SimpleAuthProviderConfig;
};

export type AADConfig = AadConfig & {
  type: 'AadConfig';
};

export type SimpleAuthProviderConfig = {
  type: 'SimpleAuthProviderConfig';
  issuer: string;
  tokenEndpoint: string;
};
