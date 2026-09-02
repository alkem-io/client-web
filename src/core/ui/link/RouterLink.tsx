import type { CSSProperties, Ref } from 'react';
import { Link as ReactRouterLink, type LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { resolveColor, resolveSx } from '@/core/ui/typography/sx';
import { isAbsoluteUrl, normalizeLink } from '@/core/utils/links';
import { useUrlBase } from './UrlBase';

export interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'target'> {
  to: string;
  strict?: boolean;
  raw?: boolean;
  blank?: boolean;
  keepScroll?: boolean;
  // MUI `Link` surface the importers still pass.
  underline?: 'none' | 'hover' | 'always';
  sx?: any;
  style?: CSSProperties;
}

// MUI `Link` defaults: primary palette colour + `underline="always"`.
const LINK_COLOR = resolveColor('primary.main');

/**
 * Constructs a link choosing between a native anchor and ReactRouter Link.
 * MUI-free replacement for the previous MUI Material `Link`-based version:
 * reproduces MUI `Link`'s default primary colour + underline behaviour and the
 * `underline`/`sx` props the importers rely on.
 */
const RouterLink = ({
  ref,
  to,
  raw = false,
  strict = false,
  blank,
  keepScroll = false,
  underline = 'always',
  sx,
  style,
  ...props
}: RouterLinkProps & {
  ref?: Ref<HTMLAnchorElement>;
}) => {
  const base = useUrlBase();

  // Handle anchor links (hash fragments) - don't modify them
  const isAnchorLink = to.startsWith('#');

  if (!isAnchorLink && !isAbsoluteUrl(to) && base && !to.startsWith('/')) {
    to = `${base}/${to}`;
  }

  const urlLike = !strict ? normalizeLink(to) : to;

  const isNativeLink = raw || isAbsoluteUrl(urlLike) || isAnchorLink;

  const shouldOpenNewWindow = blank ?? (raw || isAbsoluteUrl(urlLike));

  const linkStyle: CSSProperties = {
    color: LINK_COLOR,
    // MUI `always` underlines; `none`/`hover` render without a static underline
    // (the hover-only underline can't be expressed inline and importers that
    // need it pass `sx`/`className`).
    textDecoration: underline === 'always' ? 'underline' : 'none',
    cursor: 'pointer',
    ...resolveSx(sx),
    ...style,
  };

  const target = shouldOpenNewWindow ? '_blank' : undefined;
  const rel = shouldOpenNewWindow ? 'noopener' : undefined;

  if (isNativeLink) {
    return <a ref={ref} href={urlLike} target={target} rel={rel} style={linkStyle} {...props} />;
  }

  return (
    <ReactRouterLink
      ref={ref}
      to={urlLike}
      state={keepScroll ? { keepScroll: true } : undefined}
      target={target}
      rel={rel}
      style={linkStyle}
      {...props}
    />
  );
};

export default RouterLink;
