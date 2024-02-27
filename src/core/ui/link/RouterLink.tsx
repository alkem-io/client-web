import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { isAbsoluteUrl, normalizeLink } from '../../utils/links';
import { forwardRef } from 'react';

export interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'target'>, Pick<MuiLinkProps, 'underline' | 'sx'> {
  to: string;
  strict?: boolean;
  raw?: boolean;
  blank?: boolean;
}

/**
 * Constructs a link choosing between MUI Link and ReactRouter Link
 * @param to
 * @param loose - allows domain to be specified without protocol, good for user-submitted content
 * @constructor
 */
const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ to, raw = false, strict = false, blank, ...props }, ref) => {
    const urlLike = !strict ? normalizeLink(to) : to;

    const isForeign = raw || isAbsoluteUrl(urlLike);

    const shouldOpenNewWindow = blank ?? isForeign;

    const componentProps = {
      component: isForeign ? undefined : ReactRouterLink,
      [isForeign ? 'href' : 'to']: urlLike,
    };

    return <MuiLink ref={ref} target={shouldOpenNewWindow ? '_blank' : undefined} {...componentProps} {...props} />;
  }
);

export default RouterLink;
