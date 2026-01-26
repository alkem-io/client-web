import { ComponentType } from 'react';
import { SvgIconProps, Theme } from '@mui/material';

type CustomIconSize = 'xl' | 'xxl' | 'xs';

export interface IconProps extends SvgIconProps {
  size: SvgIconProps['fontSize'] | CustomIconSize;
  color?: SvgIconProps['color'];
  iconComponent: ComponentType<SvgIconProps>;
}

const FontSizes: Record<CustomIconSize, (theme: Theme) => string> = {
  xxl: (theme: Theme) => theme.spacing(12),
  xl: (theme: Theme) => theme.spacing(6.5),
  xs: (theme: Theme) => theme.spacing(1.5),
};

const Icon = ({ size, color, iconComponent: IconComponent, ...svgIconProps }: IconProps) => {
  const sizeProps =
    size && FontSizes[size]
      ? { sx: { fontSize: FontSizes[size as keyof typeof FontSizes] } }
      : { fontSize: size as SvgIconProps['fontSize'] };

  return <IconComponent {...sizeProps} color={color} {...svgIconProps} />;
};

export default Icon;
