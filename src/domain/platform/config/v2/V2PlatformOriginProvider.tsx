import type { PropsWithChildren } from 'react';
import { PlatformOriginContext } from '@/domain/platform/routes/PlatformOriginContext';
import { useV2Config } from './V2ConfigProvider';

// The apex origin for the BFF hand-off (LoginCrdRoute buildOidcRestartHref) is the declared Config.links.domain.
// Without it, usePlatformOrigin falls back to its single-host relative form.
export const V2PlatformOriginProvider = ({ children }: PropsWithChildren) => {
  const { links } = useV2Config();
  return <PlatformOriginContext value={links.domain}>{children}</PlatformOriginContext>;
};
