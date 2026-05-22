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
 * never disagree on which providers exist or in what order they appear.
 *
 * `iconSrc` is a resolved asset URL (Vite resolves a default `.svg` import to a
 * URL string), so it can be rendered with a plain `<img>` by any consumer.
 */
export type SocialProviderCustomization = {
  /** Matches the Kratos `node.attributes.value` for an OIDC node. */
  providerKey: string;
  /** Lower renders first. */
  sortOrder: number;
  /** Resolved URL of the provider's brand icon. */
  iconSrc: string;
};

export const socialProviderCustomizations: Record<string, SocialProviderCustomization> = {
  microsoft: { providerKey: 'microsoft', sortOrder: 1, iconSrc: microsoftIconUrl },
  linkedin: { providerKey: 'linkedin', sortOrder: 2, iconSrc: linkedinIconUrl },
  apple: { providerKey: 'apple', sortOrder: 3, iconSrc: appleIconUrl },
  github: { providerKey: 'github', sortOrder: 4, iconSrc: githubIconUrl },
  cleverbase: { providerKey: 'cleverbase', sortOrder: 5, iconSrc: cleverbaseIconUrl },
};
