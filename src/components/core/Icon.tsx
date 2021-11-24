import clsx from 'clsx';
import React, { FunctionComponent, SVGProps } from 'react';
import { Palette } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

const useIconStyles = makeStyles(theme => ({
  xs: {},
  sm: { fontSize: 24 },
  md: { fontSize: 32 },
  lg: { fontSize: 36 },
  xl: {
    fontSize: 80,
  },
  xxl: {
    fontSize: 160,
  },
  ...Object.keys(theme.palette).reduce((aggr: Record<string, {}>, key) => {
    const color = theme.palette[key as keyof Palette]['main'];
    if (color) {
      aggr[key] = { color: color };
    }

    return aggr;
  }, {}),
  inherit: {
    color: 'inherit',
  },
}));

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  component: FunctionComponent<SVGProps<SVGSVGElement>>;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  color: keyof Palette | 'inherit';
  className?: string;
}

// would be the preferred way of loading https://stackoverflow.com/questions/61339259/how-to-dynamically-import-svg-and-render-it-inline
// this way we can always swap bootstrap with something else seamlessly
const Icon: React.FC<IconProps> = ({ size, color, className, component }): JSX.Element | null => {
  const styles = useIconStyles();

  return React.createElement(component, {
    className: clsx((styles as Record<string, string>)[color], styles[size], className),
  });
};

export default Icon;
