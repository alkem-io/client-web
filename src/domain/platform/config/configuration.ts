export interface Configuration {
  authentication: {
    providers: AuthenticationProvider[];
  };
  locations: {
    environment: string;
    domain: string;
    about: string;
    feedback: string;
    privacy: string;
    security: string;
    support: string;
    terms: string;
    impact: string;
    foundation: string;
    opensource: string;
    inspiration: string;
    innovationLibrary: string;
    releases: string;
    help: string;
    community: string;
    newuser: string;
    tips: string;
    aup: string;
  };
  featureFlags: FeatureFlag[];
  sentry: {
    enabled: boolean;
    endpoint: string;
    submitPII: boolean;
  };
  apm: {
    rumEnabled: boolean;
    endpoint: string;
  };
  geo: {
    endpoint: string;
  };
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
