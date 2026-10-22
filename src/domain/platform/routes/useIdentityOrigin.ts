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
  const issuer = authentication?.providers[0]?.config.issuer;
  if (!issuer) {
    return undefined;
  }

  // Normalised to an ORIGIN, because both call sites compare it against
  // `window.location.origin`, which is always scheme+host+port with no path and
  // no trailing slash. The issuer is configured as a URL and need not be bare:
  // `alkemio.yml`'s own default is `http://alkemio-server-dev/`, whose trailing
  // slash alone would make a raw comparison never match — leaving the Matrix
  // guard inert and `NonIdentity`'s redirect dead. Every deployed tier happens
  // to configure a bare origin today, so this guards the local default and any
  // future issuer that carries a path.
  //
  // `new URL` THROWS on a malformed value, and a throw here is that white
  // screen, so it is caught rather than allowed to escape.
  try {
    return new URL(issuer).origin;
  } catch {
    return undefined;
  }
};

export default useIdentityOrigin;
