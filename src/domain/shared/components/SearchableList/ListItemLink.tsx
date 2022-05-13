import React, { ReactElement } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';

interface ListItemLinkProps {
  icon?: ReactElement;
  primary: string;
  to: string;
}

const ListItemLink = (props: ListItemLinkProps) => {
  const { icon, primary, to } = props;

  const Link = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={Link}>
        <ListItemText primary={primary} />
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      </ListItem>
    </li>
  );
};

export default ListItemLink;
