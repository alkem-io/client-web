import clsx from 'clsx';
import React, { FC } from 'react';
import { Breakpoints } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';

const displayNone = {
  display: 'none',
};

const useHiddenStyles = createStyles(theme =>
  Object.keys(theme.media.breakpoints).reduce((aggr, key) => {
    aggr[`${key}Up`] = { [theme.media.up(key as keyof Breakpoints)]: displayNone };
    aggr[`${key}Down`] = { [theme.media.down(key as keyof Breakpoints)]: displayNone };

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
}

const Hidden: FC<HiddenProps> = props => {
  const { children, className } = props;
  const hiddenStyles = useHiddenStyles();

  const targetClasses = Object.keys(hiddenStyles)
    .map(key => (Boolean(props[key] as boolean) === true ? hiddenStyles[key] : null))
    .filter(x => x);

  return <div className={clsx(className, ...targetClasses)}>{children}</div>;
};

export default Hidden;
