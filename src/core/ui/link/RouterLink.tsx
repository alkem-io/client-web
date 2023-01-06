import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { isAbsoluteUrl, normalizeLink } from '../../utils/links';

interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'target'>, Pick<MuiLinkProps, 'underline'> {
  to: string;
  loose?: boolean;
}

/**
 * Constructs a link choosing between MUI Link and ReactRouter Link
 * @param to
 * @param loose - allows domain to be specified without protocol, good for user-submitted content
 * @constructor
 */
const RouterLink = ({ to, loose = false, ...props }: RouterLinkProps) => {
  const urlLike = loose ? normalizeLink(to) : to;

  const isAbsolute = isAbsoluteUrl(urlLike);

  const componentProps = {
    component: isAbsolute ? undefined : ReactRouterLink,
    [isAbsolute ? 'href' : 'to']: urlLike,
  };

  return <MuiLink target={isAbsolute ? '_blank' : undefined} {...componentProps} {...props} />;
};

export default RouterLink;
