import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { isAbsoluteUrl, normalizeLink } from '../../utils/links';

interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'target'>, Pick<MuiLinkProps, 'underline'> {
  to: string;
  loose?: boolean;
  raw?: boolean;
  blank?: boolean;
}

/**
 * Constructs a link choosing between MUI Link and ReactRouter Link
 * @param to
 * @param loose - allows domain to be specified without protocol, good for user-submitted content
 * @constructor
 */
const RouterLink = ({ to, raw = false, loose = raw, blank, ...props }: RouterLinkProps) => {
  const urlLike = loose ? normalizeLink(to) : to;

  const isForeign = raw || isAbsoluteUrl(urlLike);

  const shouldOpenNewWindow = blank ?? isForeign;

  const componentProps = {
    component: isForeign ? undefined : ReactRouterLink,
    [isForeign ? 'href' : 'to']: urlLike,
  };

  return <MuiLink target={shouldOpenNewWindow ? '_blank' : undefined} {...componentProps} {...props} />;
};

export default RouterLink;
