import type { ApolloError } from '@apollo/client';
import React, { type FC, type PropsWithChildren, useEffect, useState } from 'react';
import { ConfigurationDocument } from '@/core/apollo/generated/apollo-hooks';
import type { ConfigurationQuery, Metadata } from '@/core/apollo/generated/graphql-schema';
import queryRequest from '@/core/http/queryRequest';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import Loading from '@/core/ui/loading/Loading';
import { platformBaseAddress } from '@/main/constants/endpoints';
import type { Configuration } from './configuration';

export interface ConfigContextProps {
  config?: Configuration;
  serverMetadata: Metadata;
  loading: boolean;
  error?: ApolloError;
}

interface ConfigProviderProps extends PropsWithChildren {
  url: string;
}

const ConfigContext = React.createContext<ConfigContextProps>({
  config: undefined,
  serverMetadata: { services: [] },
  loading: false,
  error: undefined,
});

const RETRY_DELAY_MS = 2000;
const RECHECK_INTERVAL_MS = 30 * 1000;

const ConfigProvider: FC<ConfigProviderProps> = ({ children, url }) => {
  const [config, setConfig] = useState<Configuration | undefined>();
  const [serverMetadata, setServerMetadata] = useState<Metadata>({ services: [] });
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading');

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const attempt = async (failures: number) => {
      try {
        const result = await queryRequest<ConfigurationQuery>(url, ConfigurationDocument);
        if (!active) return;
        const { configuration, settings, metadata } = result.data.data.platform;
        setConfig({ ...configuration, ...settings });
        setServerMetadata(metadata);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        if (failures === 1) {
          logWarn(err as Error, { category: TagCategoryValues.CONFIG });
          setStatus('offline');
        }
        timer = setTimeout(() => attempt(failures + 1), failures === 0 ? RETRY_DELAY_MS : RECHECK_INTERVAL_MS);
      }
    };

    attempt(0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [url]);

  if (status === 'offline') {
    return (
      <iframe
        src={`${platformBaseAddress}/maintenance/unexpected.html`}
        title="Alkemio"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    );
  }

  if (status === 'loading') {
    return <Loading text={'Loading configuration ...'} />;
  }

  return <ConfigContext value={{ config, serverMetadata, loading: false }}>{children}</ConfigContext>;
};

export { ConfigContext, ConfigProvider };
