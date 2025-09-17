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
const RouterLink = ({
  ref,
  to,
  raw = false,
  strict = false,
  blank,
  keepScroll = false,
  ...props
}: RouterLinkProps & {
  ref?: React.Ref<HTMLAnchorElement>;
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

  const getToParam = () => {
    if (isNativeLink || !keepScroll) {
      return urlLike;
    }
    return { pathname: urlLike, state: { keepScroll: true } };
  };

  const componentProps = {
    component: isNativeLink ? undefined : ReactRouterLink,
    [isNativeLink ? 'href' : 'to']: getToParam(),
  };

  return (
    <MuiLink
      ref={ref}
      target={shouldOpenNewWindow ? '_blank' : undefined}
      rel={shouldOpenNewWindow ? 'noopener' : undefined}
      {...componentProps}
      {...props}
    />
  );
};

export default RouterLink;
