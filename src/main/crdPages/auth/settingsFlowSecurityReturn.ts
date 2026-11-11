import type { SettingsFlow } from '@ory/kratos-client';

// The two pages that create settings flows of their own: the Security tab, and /second-factor.
const RESUMABLE_PATH_SUFFIXES = ['/settings/security', '/second-factor'];

/**
 * The `return_to` a settings flow was created with. Kratos serialises it as
 * `return_to` on the API object; older/other serialisations keep it only on
 * the recorded `request_url` (`/self-service/settings/browser?return_to=…`),
 * so fall back to parsing it out of there.
 */
const returnToOf = (flow: SettingsFlow): string | undefined => {
  if (flow.return_to) return flow.return_to;
  if (!flow.request_url) return undefined;
  try {
    return new URL(flow.request_url).searchParams.get('return_to') ?? undefined;
  } catch {
    return undefined;
  }
};

/**
 * Where a settings flow landing on the bare `/settings` route should actually
 * be handled, if not here.
 *
 * Kratos redirects an *errored* settings flow to the global settings `ui_url`
 * (`/settings?flow=<id>`) — `return_to` is honoured only on success. So a
 * link/unlink attempt refused by Kratos (e.g. 4000007, provider identity
 * already connected to a different account) escapes the Connected Accounts
 * section and lands on the recovery-oriented "Set new password" card: an
 * unprompted password form whose submission changes the signed-in account's
 * password (FR-019 violation, observed live 2026-08-21).
 *
 * This resolves that seam: when the flow's own `return_to` targets a user
 * Security settings page (`…/settings/security`) or `/second-factor`, return
 * that page with `?flow=<id>` appended so it resumes the flow and renders its
 * error with the settings-context copy. Recovery-issued flows carry no such
 * `return_to` and stay on the set-new-password card.
 *
 * `/settings` is served on the identity origin wherever one is configured,
 * while those pages live on the platform origin: a `return_to` on
 * `platformOrigin` yields the absolute URL to leave for; one on `origin` yields
 * the path. Any other origin, or an absent `return_to`, yields `null`.
 */
export const securitySettingsResumeTarget = (
  flow: SettingsFlow,
  origin: string = window.location.origin,
  platformOrigin?: string
): string | null => {
  const returnTo = returnToOf(flow);
  if (!returnTo) return null;
  let target: URL;
  try {
    target = new URL(returnTo, origin);
  } catch {
    return null;
  }
  if (target.origin !== origin && target.origin !== platformOrigin) return null;
  if (!RESUMABLE_PATH_SUFFIXES.some(suffix => target.pathname.endsWith(suffix))) return null;
  target.searchParams.set('flow', flow.id);
  return target.origin === origin ? `${target.pathname}${target.search}` : target.toString();
};
