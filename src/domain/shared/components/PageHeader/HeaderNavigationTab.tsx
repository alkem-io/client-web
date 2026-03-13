import { Tab, type TabProps } from '@mui/material';
import type { TabTypeMap } from '@mui/material/Tab/Tab';
import type React from 'react';
import RouterLink from '@/core/ui/link/RouterLink';

interface HeaderNavigationTabProps {
  to: string;
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
