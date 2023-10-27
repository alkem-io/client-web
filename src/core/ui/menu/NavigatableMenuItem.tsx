import React, { ComponentType, MouseEventHandler, PropsWithChildren } from 'react';
import RouterLink from '../link/RouterLink';
import { ListItemIcon, ListItemText, MenuItem, SvgIconProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { BlockSectionTitle } from '../typography';

interface NavigatableMenuItemProps {
  iconComponent: ComponentType<SvgIconProps>;
  route?: string;
  onClick?: MouseEventHandler;
}

const NavigatableMenuItem = ({
  iconComponent: Icon,
  route,
  onClick,
  children,
}: PropsWithChildren<NavigatableMenuItemProps>) => {
  const menuItemProps = route ? { component: RouterLink, to: route } : {};

  return (
    <MenuItem {...menuItemProps} onClick={onClick} sx={{ paddingX: gutters() }}>
      <ListItemIcon>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText disableTypography>
        <BlockSectionTitle textTransform="uppercase">{children}</BlockSectionTitle>
      </ListItemText>
    </MenuItem>
  );
};

export default NavigatableMenuItem;
