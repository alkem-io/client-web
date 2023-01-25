import React, { ComponentType } from 'react';
import { BoxProps, SvgIconProps } from '@mui/material';
import RoundedBadge, { RoundedBadgeProps } from './RoundedBadge';


export interface RoundedIconProps extends Pick<RoundedBadgeProps, 'size'> {
  component: ComponentType<SvgIconProps>;
}

const RoundedIcon = ({ size, component: Icon, ...containerProps }: RoundedIconProps & BoxProps) => {
  return (
    <RoundedBadge size={size} {...containerProps}>
      <Icon fontSize={size} />
    </RoundedBadge>
  );
};

export default RoundedIcon;
