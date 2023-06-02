import React, { ReactElement, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';

export interface ListItemLinkProps {
  icon?: ReactElement;
  primary: ReactNode;
  to: string;
  actions?: ReactNode;
}

const ListItemLink = ({ icon, primary, to, actions }: ListItemLinkProps) => {
  return (
    <li>
      <ListItem component={RouterLink} to={to}>
        <ListItemText primary={primary} />
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        {actions}
      </ListItem>
    </li>
  );
};

export default ListItemLink;
