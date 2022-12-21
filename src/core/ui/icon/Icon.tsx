import React, { ComponentType } from 'react';
import { SvgIconProps, Theme } from '@mui/material';

type CustomIconSize = 'xl' | 'xxl';

export interface IconProps extends SvgIconProps {
  size: SvgIconProps['fontSize'] | CustomIconSize;
  iconComponent: ComponentType<SvgIconProps>;
}

const FontSizes: Record<CustomIconSize, (theme: Theme) => string> = {
  xxl: (theme: Theme) => theme.spacing(12),
  xl: (theme: Theme) => theme.spacing(6.5),
};

const Icon = ({ size, iconComponent: IconComponent, ...svgIconProps }: IconProps) => {
  const sizeProps =
    size && FontSizes[size]
      ? { sx: { fontSize: FontSizes[size as keyof typeof FontSizes] } }
      : { fontSize: size as SvgIconProps['fontSize'] };

  return <IconComponent {...sizeProps} {...svgIconProps} />;
};

export default Icon;
