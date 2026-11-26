import type { ConfigTelemetry, V2ConfigurationQuery } from '@/core/apollo/generated-v2/graphql-schema';
import type { Configuration } from '../configuration';

// The legacy components already accept an absent top-level configuration slot.
// Optional server values stay absent rather than becoming invented URLs or endpoints.
export type LegacyConfigurationProjection = Omit<Partial<Configuration>, 'locations' | 'sentry' | 'apm' | 'geo'> & {
  locations: Pick<Configuration['locations'], 'domain'> & Partial<Omit<Configuration['locations'], 'domain'>>;
  sentry?: Omit<Configuration['sentry'], 'endpoint' | 'environment'> & {
    endpoint?: string;
    environment?: string;
  };
  apm?: Omit<Configuration['apm'], 'endpoint'> & { endpoint?: string };
  geo?: Omit<Configuration['geo'], 'endpoint'> & { endpoint?: string };
};

type NativeConfigData = Pick<
  V2ConfigurationQuery['config'],
  'languages' | 'defaultLanguage' | 'features' | 'links' | 'iframeAllowlist' | 'geo'
> & { telemetry?: ConfigTelemetry | null };

/** fed85 configuration.graphql:20–82; current public_config links/telemetry declaration. */
export function toLegacyConfiguration(config: NativeConfigData): LegacyConfigurationProjection {
  const links = Object.fromEntries(config.links.map(({ key, url }) => [key, url]));
  const domain = links.domain;
  if (!domain) throw new Error('Required config.links.domain is absent');
  const origin = new URL(domain);
  if (origin.origin !== domain || !['http:', 'https:'].includes(origin.protocol)) {
    throw new Error('config.links.domain must be an HTTP origin');
  }
  const features = config.features;
  const flags =
    features !== null && typeof features === 'object' && !Array.isArray(features)
      ? Object.entries(features).flatMap(([name, enabled]) => (typeof enabled === 'boolean' ? [{ name, enabled }] : []))
      : [];
  const telemetry = config.telemetry;
  return {
    language: { eligible: config.languages, default: config.defaultLanguage },
    // Config.links.domain is an origin; the legacy location slot is a host.
    // Native PlatformOriginContext separately retains the complete declared origin.
    locations: {
      ...links,
      domain: origin.host,
      ...(telemetry?.environment != null ? { environment: telemetry.environment } : {}),
    },
    featureFlags: flags,
    integration: { iframeAllowedUrls: config.iframeAllowlist },
    ...(config.geo
      ? {
          geo: {
            enabled: config.geo.enabled,
            ...(config.geo.endpoint != null ? { endpoint: config.geo.endpoint } : {}),
          },
        }
      : {}),
    ...(telemetry?.sentry
      ? {
          sentry: {
            enabled: telemetry.sentry.enabled,
            submitPII: telemetry.sentry.submitPII,
            ...(telemetry.sentry.endpoint != null ? { endpoint: telemetry.sentry.endpoint } : {}),
            ...(telemetry.sentry.environment != null ? { environment: telemetry.sentry.environment } : {}),
          },
        }
      : {}),
    ...(telemetry?.apm
      ? {
          apm: {
            rumEnabled: telemetry.apm.rumEnabled,
            ...(telemetry.apm.endpoint != null ? { endpoint: telemetry.apm.endpoint } : {}),
          },
        }
      : {}),
  };
}
