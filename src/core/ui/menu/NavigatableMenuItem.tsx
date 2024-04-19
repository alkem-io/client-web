import React, { ComponentType, MouseEventHandler, PropsWithChildren } from 'react';
import RouterLink from '../link/RouterLink';
import { ListItemIcon, ListItemText, MenuItem, SvgIconProps, TypographyProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { BlockSectionTitle } from '../typography';
import visibleOnFocus from '../keyboardNavigation/visibleOnFocus';

interface NavigatableMenuItemProps {
  iconComponent: ComponentType<SvgIconProps>;
  route?: string;
  onClick?: MouseEventHandler;
  tabOnly?: boolean;
  typographyComponent?: ComponentType<TypographyProps>;
}

const DefaultTypography = props => <BlockSectionTitle textTransform="uppercase" {...props} />;

const NavigatableMenuItem = ({
  iconComponent: Icon,
  route,
  onClick,
  tabOnly = false,
  children,
  typographyComponent: Typography = DefaultTypography,
}: PropsWithChildren<NavigatableMenuItemProps>) => {
  const menuItemProps = route ? { component: RouterLink, to: route, blank: false } : {};

  return (
    <MenuItem
      {...menuItemProps}
      onClick={onClick}
      sx={visibleOnFocus({ skip: !tabOnly })({ paddingX: gutters(), textTransform: 'none' })}
    >
      <ListItemIcon>
        <Icon fontSize="small" color="primary" />
      </ListItemIcon>
      <ListItemText disableTypography>
        <Typography>{children}</Typography>
      </ListItemText>
    </MenuItem>
  );
};

export default NavigatableMenuItem;
