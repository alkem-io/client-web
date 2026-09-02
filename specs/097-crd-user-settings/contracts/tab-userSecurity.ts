/**
 * User Security tab — view contracts.
 * See data-model.md "User Story 7" and research.md Decision #6 for details.
 */

import type { ReactNode } from 'react';

/** Discriminated state from the integration hook. */
export type SecurityViewState =
  | { kind: 'loading' }
  | { kind: 'error'; error: Error }
  | { kind: 'noWebauthn' }
  | { kind: 'ready'; flow: unknown }; // typed as `unknown` — the integration layer knows the actual flow shape

export type SecurityViewProps = {
  /** Title — i18n: "Security & Passkeys". */
  title: string;
  state: SecurityViewState;
  /** i18n: "WebAuthn / Passkey is not enabled on this account". */
  noWebauthnLabel: string;
  /**
   * Renders the identity-provider form. The integration layer supplies this — it mounts
   * <KratosForm><KratosUI flow={flow} /></KratosForm> with the existing REMOVED_FIELDS filter.
   * The view itself never imports the identity-provider SDK.
   */
  renderKratos: (flow: unknown) => ReactNode;
  /** Existing CRD error display (from src/crd/components/error/) or equivalent. */
  errorView: ReactNode;
};
