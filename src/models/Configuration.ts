export type Ccnfiguration = {
  authenticationProviders: AuthenticationProvider[];
};

export type AuthenticationProvider = {
  name: string;
  label: string;
  icon: string;
  config: AADConfig | SimpleAuthProviderConfig;
};

export type AADConfig = {
  type: 'AadConfig';
};

export type SimpleAuthProviderConfig = {
  type: 'SimpleAuthProviderConfig';
  issuer: string;
  tokenEndpoint: string;
};
