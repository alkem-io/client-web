import { AriaAttributes, ComponentType, MouseEventHandler, PropsWithChildren } from 'react';
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
  id?: string;
} & AriaAttributes;

const DefaultTypography = props => <BlockSectionTitle textTransform="uppercase" {...props} />;

const NavigatableMenuItem = ({
  iconComponent: Icon,
  route,
  onClick,
  replace = false,
  tabOnly = false,
  children,
  typographyComponent: Typography = DefaultTypography,
  id,
  ...ariaProps
}: PropsWithChildren<NavigatableMenuItemProps>) => {
  const menuItemProps = route ? { component: RouterLink, replace, to: route, blank: false } : {};

  return (
    <MenuItem
      id={id}
      {...menuItemProps}
      onClick={onClick}
      sx={visibleOnFocus({ skip: !tabOnly })({ paddingX: gutters(), textTransform: 'none' })}
      {...ariaProps}
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
