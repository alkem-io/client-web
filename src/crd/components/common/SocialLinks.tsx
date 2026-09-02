import { Globe } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/crd/lib/utils';
import BlueSkyIcon from './icons/social/BlueSky.svg?react';
import GitHubIcon from './icons/social/GitHub.svg?react';
import LinkedInIcon from './icons/social/LinkedIn.svg?react';
import MailIcon from './icons/social/Mail.svg?react';
import YouTubeIcon from './icons/social/YouTube.svg?react';

export type SocialLinksReference = {
  id: string;
  name: string;
  uri: string;
};

type Brand = 'website' | 'linkedin' | 'github' | 'bsky' | 'youtube' | 'email' | 'generic';

const BRAND_ORDER: Record<Brand, number> = {
  website: 0,
  linkedin: 1,
  github: 2,
  bsky: 3,
  youtube: 4,
  email: 5,
  generic: 6,
};

const BRAND_ICON: Record<Brand, ComponentType<SVGProps<SVGSVGElement>>> = {
  website: Globe,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  bsky: BlueSkyIcon,
  youtube: YouTubeIcon,
  email: MailIcon,
  generic: Globe,
};

const resolveBrand = (name: string): Brand | null => {
  switch (name.trim().toLowerCase()) {
    case 'website':
      return 'website';
    case 'linkedin':
      return 'linkedin';
    case 'github':
      return 'github';
    case 'bsky':
      return 'bsky';
    case 'youtube':
      return 'youtube';
    case 'email':
      return 'email';
    default:
      return null;
  }
};

export const isSocialReference = (ref: { name: string }): boolean => resolveBrand(ref.name) !== null;

export const excludeSocialReferences = <T extends { name: string }>(refs: T[]): T[] =>
  refs.filter(ref => !isSocialReference(ref));

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * Returns true when `uri` uses an allowlisted protocol (http / https / mailto).
 * Used to filter out unsafe schemes (`javascript:`, `data:`, etc.) before
 * rendering social-link anchors — `uri` comes from user-controlled profile data.
 */
const isSafeUri = (uri: string): boolean => {
  const trimmed = uri.trim();
  if (!trimmed) return false;
  // No scheme = relative URL (safe).
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return true;
  const lower = trimmed.toLowerCase();
  // Explicitly block `data:` URIs
  if (lower.startsWith('data:')) return false;
  return SAFE_PROTOCOLS.some(proto => lower.startsWith(proto));
};

/**
 * Returns true when at least one ref in the array is a social reference with a
 * non-empty URI AND a safe protocol. Use this in the consumer when you need to
 * gate the section header based on whether `<SocialLinks>` will render anything.
 */
export const hasSocialReferences = (refs: { name: string; uri: string }[]): boolean =>
  refs.some(ref => {
    if (!isSocialReference(ref) || ref.uri.trim().length === 0) return false;
    const brand = resolveBrand(ref.name);
    // Email is wrapped in mailto: by buildHref; other brands need an allowlisted protocol.
    return brand === 'email' || isSafeUri(ref.uri);
  });

const buildHref = (brand: Brand, uri: string): string => {
  if (brand !== 'email') return uri;
  return uri.startsWith('mailto:') ? uri : `mailto:${uri.trimStart()}`;
};

export type SocialLinksProps = {
  references: SocialLinksReference[];
  className?: string;
};

export function SocialLinks({ references, className }: SocialLinksProps) {
  const items = references
    .map(ref => ({ ref, brand: resolveBrand(ref.name) ?? ('generic' as const) }))
    .filter(({ ref, brand }) => {
      if (resolveBrand(ref.name) === null) return false;
      if (ref.uri.trim().length === 0) return false;
      // Email refs are wrapped in `mailto:` by buildHref — accept them unconditionally;
      // for every other brand, allowlist the URI's protocol.
      return brand === 'email' || isSafeUri(ref.uri);
    })
    .sort((a, b) => BRAND_ORDER[a.brand] - BRAND_ORDER[b.brand]);

  if (items.length === 0) return null;

  return (
    <ul className={cn('flex items-center gap-3 flex-wrap', className)}>
      {items.map(({ ref, brand }) => {
        const Icon = BRAND_ICON[brand];
        return (
          <li key={ref.id}>
            <a
              href={buildHref(brand, ref.uri)}
              target="_blank"
              rel="noreferrer"
              aria-label={ref.name}
              title={ref.name}
              className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              <Icon aria-hidden="true" className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
