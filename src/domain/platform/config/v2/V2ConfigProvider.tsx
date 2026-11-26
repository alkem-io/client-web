import { createContext, type PropsWithChildren, useContext } from 'react';
import { useV2ConfigurationQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { isSessionStoreUnavailable } from '@/core/apollo/v2/isSessionStoreUnavailable';
import { SessionStoreUnavailableNotice } from '@/crd/components/common/SessionStoreUnavailableNotice';
import { toV2PlatformConfig, type V2PlatformConfig } from './v2PlatformConfig';

const V2ConfigContext = createContext<V2PlatformConfig | undefined>(undefined);

export const V2ConfigProvider = ({ children }: PropsWithChildren) => {
  const { data, previousData, error, loading, refetch } = useV2ConfigurationQuery({
    notifyOnNetworkStatusChange: true,
  });
  const unavailable = isSessionStoreUnavailable(error);
  const current = data ?? (unavailable ? previousData : undefined);
  const notice = unavailable ? (
    <SessionStoreUnavailableNotice
      busy={loading}
      onRetry={() => {
        void refetch().catch(() => undefined);
      }}
    />
  ) : null;
  if (error && !unavailable) {
    throw error;
  }
  if (!current) {
    return notice;
  }
  return (
    <V2ConfigContext.Provider value={toV2PlatformConfig(current)}>
      {notice}
      {children}
    </V2ConfigContext.Provider>
  );
};

export const useV2Config = (): V2PlatformConfig => {
  const config = useContext(V2ConfigContext);
  if (!config) {
    throw new Error('useV2Config must be used inside V2ConfigProvider');
  }
  return config;
};
