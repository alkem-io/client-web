import { ComponentType } from 'react';
import { BoxProps, SvgIconProps, useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import RoundedBadge, { RoundedBadgeProps } from './RoundedBadge';

type IconSize = SvgIconProps['fontSize'] | 'xsmall';
type Variant = 'filled' | 'outlined';

export type RoundedIconProps = Pick<RoundedBadgeProps, 'size' | 'color'> &
  Omit<BoxProps, 'color'> & {
    component: ComponentType<SvgIconProps>;
    iconSize?: IconSize;
    variant?: Variant;
    disabled?: boolean;
  };

const getFontSize = (theme: Theme, iconSize: IconSize) => {
  if (iconSize === 'xsmall') {
    return theme.spacing(1.5);
  }
  return undefined;
};

const getBackgroundColor = (variant: Variant, disabled: boolean): string => {
  if (variant === 'filled') {
    return disabled ? 'muted.main' : 'primary.main';
  }
  if (variant === 'outlined') {
    return disabled ? 'muted.main' : 'transparent';
  }
  return 'transparent';
};

const getBorder = (variant: Variant, dividerColor: string): string => {
  if (variant === 'outlined') {
    return `1px solid ${dividerColor}`;
  }
  return 'none';
};

const getIconColor = (variant: Variant, disabled: boolean, theme: Theme): string => {
  if (variant === 'filled') {
    return disabled ? theme.palette.text.primary : theme.palette.common.white;
  }
  if (variant === 'outlined') {
    return disabled ? theme.palette.text.primary : theme.palette.primary.main;
  }
  return theme.palette.text.primary;
};

const RoundedIcon = ({
  size,
  iconSize = size,
  component: Icon,
  sx,
  disabled = false,
  variant = 'filled',
  ...containerProps
}: RoundedIconProps) => {
  const theme = useTheme();

  const backgroundColor = getBackgroundColor(variant, disabled);
  const border = getBorder(variant, theme.palette.divider);
  const iconColor = getIconColor(variant, disabled, theme);
  const resolvedIconSize = iconSize === 'xsmall' ? 'inherit' : iconSize;

  return (
    <RoundedBadge
      color={backgroundColor}
      border={border}
      size={size}
      {...containerProps}
      sx={{ fontSize: themeParam => getFontSize(themeParam, iconSize), ...sx }}
    >
      <Icon fontSize={resolvedIconSize} sx={{ color: iconColor }} />
    </RoundedBadge>
  );
};

export default RoundedIcon;
