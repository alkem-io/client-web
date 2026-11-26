import type { PropsWithChildren, ReactNode } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useNativeConfigurationQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { isInvalidSession, isSessionStoreUnavailable } from '@/core/apollo/v2/isSessionStoreUnavailable';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { KratosPublicUrlContext } from '@/core/auth/authentication/hooks/KratosPublicUrlContext';
import Loading from '@/core/ui/loading/Loading';
import { SessionStoreUnavailableNotice } from '@/crd/components/common/SessionStoreUnavailableNotice';
import { PlatformOriginContext } from '@/domain/platform/routes/PlatformOriginContext';
import { ConfigContext } from '../ConfigProvider';
import { toLegacyConfiguration } from './legacyConfigDataMapper';

/** fed85 ConfigProvider:48–67: existing context and loading view, native data source. */
export function NativeConfigProvider({
  children,
  matrixSession,
}: PropsWithChildren<{ matrixSession?: (sessionBaseUrl: string) => ReactNode }>) {
  const query = useNativeConfigurationQuery({ notifyOnNetworkStatusChange: true });
  const { pathname } = useLocation();
  const unavailable = isSessionStoreUnavailable(query.error);
  const current = query.data ?? (unavailable ? query.previousData : undefined);
  const notice = unavailable ? (
    <SessionStoreUnavailableNotice
      busy={query.loading}
      onRetry={() => {
        void query.refetch().catch(() => undefined);
      }}
    />
  ) : null;
  if (isInvalidSession(query.error) && matchPath(AUTH_LOGOUT_PATH, pathname)) return children;
  if (query.error && !unavailable) throw query.error;
  if (!current)
    return (
      <>
        {notice}
        <Loading text="Loading configuration ..." />
      </>
    );
  const config = toLegacyConfiguration(current.config);
  const origin = current.config.links.find(({ key }) => key === 'domain')?.url;
  const version = current.config.versions?.server;
  return (
    <ConfigContext
      value={{
        config,
        serverMetadata: { services: version ? [{ version }] : [] },
        loading: query.loading,
        error: query.error,
      }}
    >
      <PlatformOriginContext value={origin}>
        <KratosPublicUrlContext value={current.config.authentication.kratosPublicUrl}>
          {notice}
          {current.config.matrix?.sessionBaseUrl && matrixSession?.(current.config.matrix.sessionBaseUrl)}
          {children}
        </KratosPublicUrlContext>
      </PlatformOriginContext>
    </ConfigContext>
  );
}
