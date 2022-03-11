export interface Configuration {
  authentication: {
    providers: AuthenticationProvider[];
  };
  platform: {
    about: string;
    feedback: string;
    privacy: string;
    security: string;
    support: string;
    terms: string;
    featureFlags: FeatureFlag[];
  };
  sentry: {
    enabled: boolean;
    endpoint: string;
    submitPII: boolean;
  };
  template: {
    hubs: {
      aspects?: AspectTemplate[];
    }[];
  };
}

export interface AspectTemplate {
  type: string;
  description: string;

  // __typename?: 'HubAspectTemplate' | undefined;
}

interface AuthenticationProvider {
  name: string;
  label: string;
  icon: string;
  enabled: boolean;
  config: {
    kratosPublicBaseURL: string;
    issuer: string;
  };
}

interface FeatureFlag {
  enabled: boolean;
  name: string;
}
