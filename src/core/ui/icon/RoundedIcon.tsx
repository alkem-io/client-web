import { ComponentType } from 'react';
import { BoxProps, SvgIconProps } from '@mui/material';
import RoundedBadge, { RoundedBadgeProps } from './RoundedBadge';
import { Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material';

export type RoundedIconProps = Pick<RoundedBadgeProps, 'size' | 'color'> &
  Omit<BoxProps, 'color'> & {
    component: ComponentType<SvgIconProps>;
    iconSize?: SvgIconProps['fontSize'] | 'xsmall';
    variant?: 'filled' | 'outlined';
    disabled?: boolean;
  };

const getFontSize = (theme: Theme) => (iconSize: SvgIconProps['fontSize'] | 'xsmall') => {
  if (iconSize === 'xsmall') {
    return theme.spacing(1.5);
  }
};

const RoundedIcon = ({ size, iconSize = size, component: Icon, sx, disabled, variant = 'filled', ...containerProps }: RoundedIconProps) => {
  const theme = useTheme();

  const backgroundColor =
    variant === 'filled' ? (
      disabled ? 'muted.main' : 'primary.main') :
      variant === 'outlined' ? (
        disabled ? 'muted.main' : 'transparent') :
        'transparent';
  const border = variant === 'outlined' ? `1px solid ${theme.palette.divider}` : 'none';
  const iconColor =
    variant === 'filled' ? (
      disabled ? theme.palette.text.primary : theme.palette.common.white) :
      variant === 'outlined' ? (
        disabled ? theme.palette.text.primary : theme.palette.primary.main) :
        theme.palette.text.primary;

  return (
    <RoundedBadge
      color={backgroundColor}
      border={border}
      size={size}
      {...containerProps}
      sx={{ fontSize: theme => getFontSize(theme)(iconSize), ...sx }}
    >
      <Icon fontSize={iconSize === 'xsmall' ? 'inherit' : iconSize} sx={{ color: iconColor }} />
    </RoundedBadge>
  );
};

export default RoundedIcon;
