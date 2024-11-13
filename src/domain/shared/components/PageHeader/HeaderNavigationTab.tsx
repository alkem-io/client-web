import { Tab, TabProps } from '@mui/material';
import React, { forwardRef } from 'react';
import RouterLink from '@core/ui/link/RouterLink';
import { TabTypeMap } from '@mui/material/Tab/Tab';

interface HeaderNavigationTabProps {
  to: string;
}

const HeaderNavigationTab = forwardRef<HTMLAnchorElement, HeaderNavigationTabProps & TabProps>(
  <D extends React.ElementType = TabTypeMap['defaultComponent'], P = {}>(
    { to, ...props }: HeaderNavigationTabProps & TabProps<D, P>,
    ref
  ) => {
    return <Tab ref={ref} iconPosition="start" component={RouterLink} to={to} {...props} />;
  }
) as <D extends React.ElementType = TabTypeMap['defaultComponent'], P = {}>(
  props: HeaderNavigationTabProps & TabProps<D, P>
) => ReturnType<typeof Tab>;

export default HeaderNavigationTab;
