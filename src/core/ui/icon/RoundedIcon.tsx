import { ComponentType } from 'react';
import { BoxProps, SvgIconProps } from '@mui/material';
import RoundedBadge, { RoundedBadgeProps } from './RoundedBadge';
import { Theme } from '@mui/material/styles';

export type RoundedIconProps = Pick<RoundedBadgeProps, 'size' | 'color'> &
  Omit<BoxProps, 'color'> & {
    component: ComponentType<SvgIconProps>;
    iconSize?: SvgIconProps['fontSize'] | 'xsmall';
    disabled?: boolean;
  };

const getFontSize = (theme: Theme) => (iconSize: SvgIconProps['fontSize'] | 'xsmall') => {
  if (iconSize === 'xsmall') {
    return theme.spacing(1.5);
  }
};

const RoundedIcon = ({ size, iconSize = size, component: Icon, sx, disabled, ...containerProps }: RoundedIconProps) => (
  <RoundedBadge
    color={disabled ? 'muted.main' : undefined}
    size={size}
    {...containerProps}
    sx={{ fontSize: theme => getFontSize(theme)(iconSize), ...sx }}
  >
    <Icon fontSize={iconSize === 'xsmall' ? 'inherit' : iconSize} />
  </RoundedBadge>
);

export default RoundedIcon;
