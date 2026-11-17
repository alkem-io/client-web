import type { SettingsFlow } from '@ory/kratos-client';

export type KratosSettingsOutcome =
  /** Kratos answered with the flow: saved (200) or refused with its messages (400). */
  | { kind: 'flow'; flow: SettingsFlow }
  /** Kratos sends the browser elsewhere first, e.g. to re-confirm a session too old to change security settings. */
  | { kind: 'redirect'; to: string };

/**
 * Submits fields to a Kratos settings action as JSON and reads Kratos's answer,
 * so the page updates in place instead of following a native POST's redirect
 * back into a full reload. Throws when Kratos answers with neither a flow nor
 * somewhere to go.
 */
export const submitKratosSettings = async (
  action: string,
  fields: Record<string, string>
): Promise<KratosSettingsOutcome> => {
  const response = await fetch(action, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const body = await response.json().catch(() => undefined);
  if ((response.ok || response.status === 400) && body?.ui) {
    return { kind: 'flow', flow: body as SettingsFlow };
  }
  if (typeof body?.redirect_browser_to === 'string') {
    return { kind: 'redirect', to: body.redirect_browser_to };
  }
  throw new Error(`Kratos answered the settings submission with ${response.status}`);
};
