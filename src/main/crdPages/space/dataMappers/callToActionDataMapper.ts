import type { LinkDetails } from '@/domain/collaboration/calloutContributions/link/models/LinkDetails';

export type CallToActionProps = {
  url: string;
  displayName: string;
  isExternal: boolean;
  isValid: boolean;
};

/**
 * Maps a CalloutFraming.link (LinkDetails) to the plain props consumed by
 * `CalloutLinkAction`. Owns URL validation and external-vs-internal detection
 * so the CRD component stays host-agnostic (no `new URL(...)`, no
 * `window.location` inside `src/crd/`).
 *
 * - Returns `undefined` when the link is absent or its URI is empty.
 * - `isValid` is `true` only for well-formed `http:`/`https:` URIs.
 * - `isExternal` compares the parsed origin to `window.location.origin`;
 *   invalid URIs are reported as non-external (we never render them as
 *   `target="_blank"`).
 */
export function mapLinkToCallToActionProps(link: LinkDetails | undefined): CallToActionProps | undefined {
  if (!link) return undefined;
  const uri = link.uri?.trim();
  if (!uri) return undefined;

  const displayName = link.profile?.displayName?.trim() || uri;

  try {
    const parsed = new URL(uri);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { url: uri, displayName, isExternal: false, isValid: false };
    }
    const isExternal = parsed.origin !== window.location.origin;
    return { url: uri, displayName, isExternal, isValid: true };
  } catch {
    return { url: uri, displayName, isExternal: false, isValid: false };
  }
}
