import { Link as MuiLink } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';

interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'target'> {
  to: string;
  external?: boolean;
}

const RouterLink = ({ external = false, to, ...props }: RouterLinkProps) => {
  const linkProps = {
    [external ? 'href' : 'to']: to,
    component: external ? undefined : ReactRouterLink,
    target: external ? '_blank' : undefined,
  };
  return <MuiLink {...linkProps} {...props} />;
};

export default RouterLink;
