import { ComponentType, MouseEventHandler, PropsWithChildren } from 'react';
import RouterLink from '../link/RouterLink';
import { ListItemIcon, ListItemText, MenuItem, SvgIconProps, TypographyProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { BlockSectionTitle } from '../typography';
import visibleOnFocus from '../keyboardNavigation/visibleOnFocus';

type NavigatableMenuItemProps = {
  iconComponent: ComponentType<SvgIconProps>;
  route?: string;
  onClick?: MouseEventHandler;
  tabOnly?: boolean;
  typographyComponent?: ComponentType<TypographyProps>;
  replace?: boolean;
};

const DefaultTypography = props => <BlockSectionTitle textTransform="uppercase" {...props} />;

const NavigatableMenuItem = ({
  iconComponent: Icon,
  route,
  onClick,
  replace = false,
  tabOnly = false,
  children,
  typographyComponent: Typography = DefaultTypography,
}: PropsWithChildren<NavigatableMenuItemProps>) => {
  // Separate routing props from click handling
  const menuItemProps = route
    ? {
        component: RouterLink,
        replace,
        to: route,
        blank: false,
        // Don't pass onClick when using routing to avoid conflicts
        onClick: undefined,
      }
    : { onClick };

  return (
    <MenuItem
      {...menuItemProps}
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
