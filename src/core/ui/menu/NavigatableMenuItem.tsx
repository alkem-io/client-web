import React, { ComponentType, MouseEventHandler, PropsWithChildren } from 'react';
import RouterLink from '../link/RouterLink';
import { ListItemIcon, ListItemText, MenuItem, SvgIconProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { BlockSectionTitle } from '../typography';
import visibleOnFocus from '../keyboardNavigation/visibleOnFocus';

interface NavigatableMenuItemProps {
  iconComponent: ComponentType<SvgIconProps>;
  route?: string;
  onClick?: MouseEventHandler;
  tabOnly?: boolean;
}

const NavigatableMenuItem = ({
  iconComponent: Icon,
  route,
  onClick,
  tabOnly = false,
  children,
}: PropsWithChildren<NavigatableMenuItemProps>) => {
  const menuItemProps = route ? { component: RouterLink, to: route, blank: false } : {};

  return (
    <MenuItem {...menuItemProps} onClick={onClick} sx={visibleOnFocus({ skip: !tabOnly })({ paddingX: gutters() })}>
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
