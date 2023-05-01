import { PropsWithChildren } from 'react';
import { useConfig } from '../config/useConfig';
import { Error404 } from '../../../core/pages/Errors/Error404';
import Loading from '../../../common/components/core/Loading/Loading';

const NonIdentity = ({ children }: PropsWithChildren<{}>) => {
  const config = useConfig();

  const identityOrigin = config.authentication?.providers[0].config.issuer;

  const isIdentityOrigin = window.location.origin === identityOrigin;

  if (config.loading) {
    return <Loading />;
  }

  if (isIdentityOrigin) {
    return <Error404 />;
  }

  return <>{children}</>;
};

export default NonIdentity;
