import { forwardRef } from 'react';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { isAbsoluteUrl, normalizeLink } from '@/core/utils/links';
import { useUrlBase } from './UrlBase';

export interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'target'>, Pick<MuiLinkProps, 'underline' | 'sx'> {
  to: string;
  strict?: boolean;
  raw?: boolean;
  blank?: boolean;
  keepScroll?: boolean;
}

/**
 * Constructs a link choosing between MUI Link and ReactRouter Link
 * @param to
 * @constructor
 */
const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(function RouterLink(
  { to, raw = false, strict = false, blank, keepScroll = false, underline, sx, ...props },
  ref
) {
  const base = useUrlBase();

  // Handle anchor links (hash fragments) - don't modify them
  const isAnchorLink = to.startsWith('#');

  let resolvedTo = to;

  if (!isAnchorLink && !isAbsoluteUrl(resolvedTo) && base && !resolvedTo.startsWith('/')) {
    resolvedTo = `${base}/${resolvedTo}`;
  }

  const urlLike = !strict ? normalizeLink(resolvedTo) : resolvedTo;

  const shouldOpenNewWindow = blank ?? (raw || isAbsoluteUrl(urlLike));

  const getToParam = () => {
    if (!keepScroll) {
      return urlLike;
    }
    return { pathname: urlLike, state: { keepScroll: true } };
  };

  const target = shouldOpenNewWindow ? '_blank' : undefined;
  const rel = shouldOpenNewWindow ? 'noopener' : undefined;

  return (
    <MuiLink
      ref={ref}
      component={ReactRouterLink}
      underline={underline}
      sx={sx}
      target={target}
      rel={rel}
      to={getToParam()}
      {...props}
    />
  );
});

export default RouterLink;
