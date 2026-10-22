import { useConfig } from '../config/useConfig';

/**
 * The origin serving the identity provider (the `identity.` subdomain). Signing
 * in lands the browser there and `NonIdentity` immediately replaces the
 * location with the platform origin, so it is a transient staging origin:
 * nothing origin-bound — storage, a Matrix session — may be anchored to it.
 *
 * Derived in one place so the two call sites cannot drift apart.
 */
const useIdentityOrigin = () => {
  const { authentication } = useConfig();

  return authentication?.providers[0].config.issuer;
};

export default useIdentityOrigin;
