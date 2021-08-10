import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { BreakpointValues } from '@material-ui/core/styles/createBreakpoints';

const displayNone = {
  display: 'none',
};

const useHiddenStyles = createStyles(theme =>
  Object.keys(theme.breakpoints).reduce((aggr, key) => {
    aggr[`${key}Up`] = { [theme.breakpoints.up(key as keyof BreakpointValues)]: displayNone };
    aggr[`${key}Down`] = { [theme.breakpoints.down(key as keyof BreakpointValues)]: displayNone };

    return aggr;
  }, {} as Record<string, {}>)
);

interface HiddenProps extends Record<string, boolean | undefined | string | React.ReactNode> {
  lgUp?: boolean;
  lgDown?: boolean;
  mdUp?: boolean;
  mdDown?: boolean;
  smUp?: boolean;
  smDown?: boolean;
  xsUp?: boolean;
  xsDown?: boolean;
  className?: string;
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<any>;
}

const Hidden: FC<HiddenProps> = props => {
  const {
    children,
    className,
    component: Component = 'div',
    lgUp,
    lgDown,
    mdUp,
    mdDown,
    smUp,
    smDown,
    xsDown,
    xsUp,
    ...rest
  } = props;
  const hiddenStyles = useHiddenStyles();

  const targetClasses = Object.keys(hiddenStyles)
    .map(key => (Boolean(props[key] as boolean) === true ? hiddenStyles[key] : null))
    .filter(x => x);

  return (
    <Component className={clsx(className, ...targetClasses)} {...rest}>
      {children}
    </Component>
  );
};

export default Hidden;
