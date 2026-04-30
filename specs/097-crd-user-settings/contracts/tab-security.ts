/**
 * CRD Security tab contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/tabs/SecurityView.tsx
 *
 * Per research §11, this iteration only re-skins the OUTER shell — the
 * Kratos-rendered fields keep their default Kratos styling. The Security
 * tab is owner-only (Kratos session constraint, FR-093).
 */

/**
 * Opaque Kratos flow value. The view does not inspect this — it forwards
 * it to `KratosForm`/`KratosUI`. The mapper imports the real type from the
 * Kratos client SDK.
 */
export type KratosFlow = unknown;

export type SecurityViewState =
  | { kind: 'loading' }
  | { kind: 'error'; errorMessage: string }
  | { kind: 'noWebauthn' }
  | { kind: 'ready'; flow: KratosFlow };

export type SecurityViewProps = {
  state: SecurityViewState;
  /** i18n keys. */
  labels: {
    title: string;            // "Security"
    noWebauthnAlert: string;  // "WebAuthn / Passkey is not enabled on this account"
    loadingLabel: string;
  };
  /**
   * `KratosForm` and `KratosUI` are passed in as render-prop slots. The view
   * itself never imports the Kratos SDK — only the integration layer does
   * (it provides the actual nodes via these props).
   */
  renderKratos: (flow: KratosFlow) => React.ReactNode;
};

import type * as React from 'react';
