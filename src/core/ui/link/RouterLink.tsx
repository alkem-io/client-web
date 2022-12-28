import { Link as MuiLink } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { isAbsoluteUrl } from '../../utils/isAbsoluteUrl';

interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'target'> {
  to: string;
  external?: boolean;
}

const RouterLink = ({ external = false, to, ...props }: RouterLinkProps) => {
  const isAbsolute = isAbsoluteUrl(to);

  const componentProps = {
    component: isAbsolute ? undefined : ReactRouterLink,
    [isAbsolute ? 'href' : 'to']: to,
  };

  const shouldOpenNewTab = external ?? isAbsolute;

  return <MuiLink target={shouldOpenNewTab ? '_blank' : undefined} {...componentProps} {...props} />;
};

export default RouterLink;
