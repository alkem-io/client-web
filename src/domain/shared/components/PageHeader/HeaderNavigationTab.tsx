import { Tab, TabProps } from '@mui/material';
import React from 'react';
import RouterLink from '@/core/ui/link/RouterLink';
import { TabTypeMap } from '@mui/material/Tab/Tab';

interface HeaderNavigationTabProps {
  to: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: React.Ref<any>;
}

const HeaderNavigationTab = (<D extends React.ElementType = TabTypeMap['defaultComponent'], P = {}>({
  ref,
  to,
  ...props
}: HeaderNavigationTabProps & TabProps<D, P>) => {
  return <Tab ref={ref} iconPosition="start" component={RouterLink} to={to} {...props} />;
}) as <D extends React.ElementType = TabTypeMap['defaultComponent'], P = {}>(
  props: HeaderNavigationTabProps & TabProps<D, P>
) => ReturnType<typeof Tab>;

export default HeaderNavigationTab;
