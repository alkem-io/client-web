export interface Configuration {
  authentication: {
    providers: AuthenticationProvider[];
  };
  locations: {
    environment: string;
    domain: string;
    landing: string;
    about: string;
    blog: string;
    feedback: string;
    forumreleases: string;
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
    documentation: string;
  };
  featureFlags: FeatureFlag[];
  sentry: {
    enabled: boolean;
    endpoint: string;
    submitPII: boolean;
    environment: string;
  };
  apm: {
    rumEnabled: boolean;
    endpoint: string;
  };
  geo: {
    enabled: boolean;
    endpoint: string;
  };
  integration: {
    iframeAllowedUrls: string[];
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
