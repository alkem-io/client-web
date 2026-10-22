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

  // `providers[0]` is optional-chained too: the array can be present but empty
  // (no provider configured). This hook is called from `NonIdentity`, which
  // renders on every route, so a throw here is a white screen.
  return authentication?.providers[0]?.config.issuer;
};

export default useIdentityOrigin;
