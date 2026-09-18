import type { SettingsFlow } from '@ory/kratos-client';

const SECURITY_SETTINGS_PATH_SUFFIX = '/settings/security';

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
 * Security settings page (`…/settings/security`), return that page's path
 * with `?flow=<id>` appended so the section resumes the flow and renders its
 * error with the settings-context copy. Recovery-issued flows carry no such
 * `return_to` and stay on the set-new-password card. Cross-origin or absent
 * `return_to` yields `null` (no redirect).
 */
export const securitySettingsResumeTarget = (
  flow: SettingsFlow,
  origin: string = window.location.origin
): string | null => {
  const returnTo = returnToOf(flow);
  if (!returnTo) return null;
  let target: URL;
  try {
    target = new URL(returnTo, origin);
  } catch {
    return null;
  }
  if (target.origin !== origin) return null;
  if (!target.pathname.endsWith(SECURITY_SETTINGS_PATH_SUFFIX)) return null;
  target.searchParams.set('flow', flow.id);
  return `${target.pathname}${target.search}`;
};
