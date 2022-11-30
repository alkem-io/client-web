export interface Configuration {
  authentication: {
    providers: AuthenticationProvider[];
  };
  platform: {
    environment: string;
    about: string;
    feedback: string;
    privacy: string;
    security: string;
    support: string;
    terms: string;
    impact: string;
    foundation: string;
    opensource: string;
    releases: string;
    help: string;
    community: string;
    newuser: string;
    tips: string;
    aup: string;
    featureFlags: FeatureFlag[];
  };
  sentry: {
    enabled: boolean;
    endpoint: string;
    submitPII: boolean;
  };
  storage: {
    file: {
      mimeTypes: string[];
      maxFileSize: number;
    };
  };
  apm: {
    rumEnabled: boolean;
    endpoint: string;
  };
  geo: {
    endpoint: string;
  };
}

export interface AspectTemplate {
  type: string;
  defaultDescription: string;
  typeDescription: string;
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
