import appleIconUrl from './components/AuthProviders/apple.svg';
import cleverbaseIconUrl from './components/AuthProviders/cleverbase.svg';
import githubIconUrl from './components/AuthProviders/github.svg';
import linkedinIconUrl from './components/AuthProviders/linkedin.svg';
import microsoftIconUrl from './components/AuthProviders/microsoft.svg';

/**
 * Framework-agnostic metadata for the social / OIDC sign-in providers Alkemio
 * recognises. Single source of truth shared by both the MUI auth layer
 * (`KratosSocialButton` / `KratosUI`) and the CRD auth integration layer
 * (`src/main/crdPages/auth/flowDescriptorAdapter`), so the two design systems
 * never disagree on which providers exist, in what order they appear, or how
 * the brand name is cased in user-facing copy.
 *
 * `iconSrc` is a resolved asset URL (Vite resolves a default `.svg` import to a
 * URL string), so it can be rendered with a plain `<img>` by any consumer.
 */
export type SocialProviderCustomization = {
  /** Matches the Kratos `node.attributes.value` for an OIDC node (always lower-cased). */
  providerKey: string;
  /** Lower renders first. */
  sortOrder: number;
  /** Resolved URL of the provider's brand icon. */
  iconSrc: string;
  /**
   * Brand-cased display name (e.g. "GitHub" for the `github` key) used by
   * message overrides that interpolate `{{provider}}`, and by the i18n
   * `providers.<key>` labels so the UI stays brand-consistent.
   */
  displayName: string;
};

export const socialProviderCustomizations: Record<string, SocialProviderCustomization> = {
  microsoft: { providerKey: 'microsoft', displayName: 'Microsoft', sortOrder: 1, iconSrc: microsoftIconUrl },
  linkedin: { providerKey: 'linkedin', displayName: 'LinkedIn', sortOrder: 2, iconSrc: linkedinIconUrl },
  apple: { providerKey: 'apple', displayName: 'Apple', sortOrder: 3, iconSrc: appleIconUrl },
  github: { providerKey: 'github', displayName: 'GitHub', sortOrder: 4, iconSrc: githubIconUrl },
  cleverbase: { providerKey: 'cleverbase', displayName: 'Cleverbase', sortOrder: 5, iconSrc: cleverbaseIconUrl },
};
