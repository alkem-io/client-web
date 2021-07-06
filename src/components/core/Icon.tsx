import clsx from 'clsx';
import React, { FunctionComponent, SVGProps } from 'react';
import { Palette } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';

const useIconStyles = createStyles(theme => ({
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
    aggr[key] = { color: theme.palette[key as keyof Palette] };

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
}

// would be the preferred way of loading https://stackoverflow.com/questions/61339259/how-to-dynamically-import-svg-and-render-it-inline
// this way we can always swap bootstrap with something else seamlessly
const Icon: React.FC<IconProps> = ({ size, color, component }): JSX.Element | null => {
  const styles = useIconStyles();

  return React.createElement(component, {
    className: clsx((styles as Record<string, string>)[color], styles[size]),
  });
};

export default Icon;
