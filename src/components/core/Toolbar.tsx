import clsx from 'clsx';
import React, { FC, RefObject } from 'react';
import { createStyles } from '../../hooks/useTheme';

const useToolbarStyles = createStyles(theme => ({
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
  },
  paddingDefault: {
    padding: `${theme.spacing(4)} ${theme.spacing(4)}`,
  },
  paddingDense: {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
  },
  responsivePadding: {
    [theme.breakpoints.down('lg')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
}));

interface ToolbarProps {
  dense?: boolean;
  classes?: {
    padding?: string;
    densePadding?: string;
  };
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: RefObject<any>;
}

const Toolbar: FC<ToolbarProps> = ({ dense, classes, className, children, innerRef }) => {
  const styles = useToolbarStyles();

  return (
    <div
      ref={innerRef}
      className={clsx(
        styles.toolbar,
        classes?.padding || styles.paddingDefault,
        dense && (classes?.densePadding || styles.paddingDense),
        styles.responsivePadding,
        className
      )}
    >
      {children}
    </div>
  );
};

export default Toolbar;
