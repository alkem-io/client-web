/**
 * CRD Auth Component Contracts.
 *
 * These are the prop types for every new presentational component under
 * `src/crd/components/auth/`. Per the CRD golden rules, every prop is plain
 * TypeScript — never a Kratos type, never a GraphQL type, never a MUI type.
 *
 * The integration layer in `src/main/crdPages/auth/` is responsible for
 * producing these props from the live Kratos flow.
 */

import type { ReactNode } from 'react';
import type { KratosFlowDescriptor, KratosPasskeyTrigger } from './flow-descriptor';

/** Generic loading hint applied to every card while the initial flow fetch is pending. */
type LoadingProps = {
  isLoading?: boolean;
};

/** Analytics callbacks — never optional in production wiring, but optional in tests/standalone preview. */
type AnalyticsProps = {
  onProviderClick?: (providerKey: string) => void;
  onSubmitAttempt?: () => void;
};

// ─── CrdKratosFlow — the flow renderer ────────────────────────────────────

export type CrdKratosFlowProps = {
  descriptor: KratosFlowDescriptor;

  /** Slots that mirror the MUI `KratosUI` extension points. */
  beforeInputs?: ReactNode;
  resetPasswordElement?: ReactNode;
  acceptTermsComponent?: ReactNode;
  children?: ReactNode;

  /** Submission affordances. */
  submitDisabled?: boolean;
  submitLabelOverride?: (defaultLabel: string) => string;
  disableInputs?: boolean;

  /**
   * Invoked when the user activates a passkey button. A passkey button is NOT
   * a plain form submit — it initiates a browser WebAuthn ceremony. The CRD
   * layer therefore never touches `window.__oryPasskey*`; it delegates the
   * resolved trigger to the integration layer through this callback. The
   * integration layer invokes the correct routine and surfaces any
   * passkey-specific error (script not loaded, browser unsupported, ceremony
   * failed). Required whenever the descriptor's `groups.passkey` is non-empty.
   */
  onPasskeyTrigger?: (trigger: KratosPasskeyTrigger) => void;
} & AnalyticsProps;

// ─── Per-screen cards ─────────────────────────────────────────────────────

export type SignInCardProps = {
  descriptor: KratosFlowDescriptor;
  signUpHref: string;
  forgotPasswordHref: string;
} & LoadingProps & AnalyticsProps;

export type SignUpCardProps = {
  descriptor: KratosFlowDescriptor;
  signInHref: string;
  termsOfUseHref: string;
  privacyPolicyHref: string;
  hasAcceptedTerms: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
} & LoadingProps & AnalyticsProps;

export type RegistrationCardProps = {
  descriptor: KratosFlowDescriptor;
  signInHref: string;
  termsOfUseHref: string;
  privacyPolicyHref: string;
  /** When true, the screen renders the AcceptTerms gate only, not the full form. */
  mustAcceptTerms: boolean;
  hasAcceptedTerms: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
} & LoadingProps & AnalyticsProps;

export type PasswordRecoveryCardProps = {
  descriptor: KratosFlowDescriptor;
  signUpHref: string;
  isInCooldown: boolean;
  cooldownSecondsRemaining: number;
} & LoadingProps & AnalyticsProps;

export type PasswordRecoveryCodeCardProps = {
  descriptor: KratosFlowDescriptor;
  signUpHref: string;
} & LoadingProps & AnalyticsProps;

export type SetNewPasswordCardProps = {
  descriptor: KratosFlowDescriptor;
} & LoadingProps & AnalyticsProps;

export type EmailVerificationCardProps = {
  descriptor: KratosFlowDescriptor;
  /** Resolved by the integration layer from `flow.ui.action` or the stored returnUrl. */
  continueHref?: string;
} & LoadingProps & AnalyticsProps;

export type EmailVerificationRequiredCardProps = {
  /** Shown to the user as "you'll be returned to: …". Empty when there is no stored returnUrl. */
  returnUrl?: string;
} & LoadingProps;

export type AuthErrorCardProps = {
  errorCode?: string;
  errorMessage?: string;
  errorReason?: string;
  signInHref: string;
} & LoadingProps;

// ─── Sub-components ───────────────────────────────────────────────────────

export type AuthCardHeaderProps = {
  /** Text shown on the right-hand cross-link, e.g. "No account?", "Have an account?". */
  contextLabel: string;
  /** Text of the link itself, e.g. "Sign up", "Sign in". */
  contextLinkLabel: string;
  /** `href` the link navigates to. */
  contextLinkHref: string;
  /** Optional alt-text override for the logo. */
  logoAltText?: string;
};

export type SocialProviderButtonProps = {
  /** Display label (used for tooltip + aria-label). */
  label: string;
  /** Icon `src` (SVG) shown inside the button. */
  iconSrc: string;
  /** Optional value submitted with the form (matches the Kratos node name/value pair). */
  formFieldName?: string;
  formFieldValue?: string;
  disabled?: boolean;
  /** Click handler. Receives the underlying form-field value so analytics can disambiguate providers. */
  onClick?: () => void;
};

export type OrContinueWithDividerProps = {
  /** Translation-resolved label, e.g. "or continue with". */
  label: string;
};

// ─── Layout ────────────────────────────────────────────────────────────────

export type AuthShellProps = {
  children: ReactNode;

  /** Language switcher wiring — same shape as the existing CRD Footer. */
  languages: ReadonlyArray<{ code: string; label: string }>;
  currentLanguage: string;
  onLanguageChange: (code: string) => void;

  /** Footer link hrefs. Concrete type is imported from `@/crd/layouts/types` in the implementation. */
  footerLinks: {
    terms: string;
    privacy: string;
    security: string;
    support: string;
    about: string;
  };

  /** Optional floating help button. */
  helpButton?: ReactNode;

  /** Background image — defaults to `/alkemio-banner/global-banner.svg`. */
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
};

// ─── Form-field wrappers (live under src/crd/forms/) ──────────────────────

export type EmailFieldProps = {
  name: string;
  value: string;
  label: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
};

export type PasswordFieldProps = {
  name: string;
  value: string;
  label: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  /** i18n-resolved label for the show/hide toggle's accessible name. */
  showPasswordLabel: string;
  hidePasswordLabel: string;
};

export type TextInputFieldProps = {
  name: string;
  value: string;
  label: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  /** Defaults to 'text'. */
  type?: 'text' | 'tel';
};

export type AcceptTermsCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /**
   * Rich-content label. The integration layer supplies the rendered <Trans/>
   * with Terms-of-Use and Privacy-Policy anchor tags wired up.
   */
  label: ReactNode;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
};
