import { Link as MuiLink } from '@mui/material';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';

const RouterLink = (props: ReactRouterLinkProps) => {
  return <MuiLink component={ReactRouterLink} {...props} />;
};

export default RouterLink;
