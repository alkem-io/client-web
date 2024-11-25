import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { isAbsoluteUrl, normalizeLink } from '@/core/utils/links';
import { forwardRef } from 'react';
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
const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ to, raw = false, strict = false, blank, keepScroll = false, ...props }, ref) => {
    const base = useUrlBase();

    if (!isAbsoluteUrl(to) && base && !to.startsWith('/')) {
      to = `${base}/${to}`;
    }

    const urlLike = !strict ? normalizeLink(to) : to;

    const isForeign = raw || isAbsoluteUrl(urlLike);

    const shouldOpenNewWindow = blank ?? isForeign;

    const getToParam = () => {
      if (isForeign || !keepScroll) {
        return urlLike;
      }
      return { pathname: urlLike, state: { keepScroll: true } };
    };

    const componentProps = {
      component: isForeign ? undefined : ReactRouterLink,
      [isForeign ? 'href' : 'to']: getToParam(),
    };

    return <MuiLink ref={ref} target={shouldOpenNewWindow ? '_blank' : undefined} {...componentProps} {...props} />;
  }
);

export default RouterLink;
