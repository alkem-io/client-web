import React, { ComponentType } from 'react';
import { BoxProps, IconProps, SvgIconProps } from '@mui/material';
import RoundedBadge, { RoundedBadgeProps } from './RoundedBadge';

export interface RoundedIconProps extends Pick<RoundedBadgeProps, 'size' | 'color'> {
  component: ComponentType<SvgIconProps>;
  iconSize?: IconProps['fontSize'];
}

const RoundedIcon = ({
  size,
  iconSize = size,
  component: Icon,
  ...containerProps
}: RoundedIconProps & Omit<BoxProps, 'color'>) => {
  return (
    <RoundedBadge size={size} {...containerProps}>
      <Icon fontSize={iconSize} />
    </RoundedBadge>
  );
};

export default RoundedIcon;
