import type { PropsWithChildren } from 'react';
import { KratosPublicUrlContext } from '@/core/auth/authentication/hooks/KratosPublicUrlContext';
import { useV2Config } from '@/domain/platform/config/v2/V2ConfigProvider';

// The one place the v2 shell sources the Kratos public API URL for the client-rendered Kratos flows (Q1).
export const V2KratosPublicUrlProvider = ({ children }: PropsWithChildren) => {
  const { kratosPublicUrl } = useV2Config();
  return <KratosPublicUrlContext value={kratosPublicUrl}>{children}</KratosPublicUrlContext>;
};
