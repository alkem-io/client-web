import clsx from 'clsx';
import React, { FC, RefObject } from 'react';
import { createStyles } from '../../hooks/useTheme';

const useToolbarStyles = createStyles(theme => ({
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
  },
  paddingDefault: {
    padding: `${theme.spacing(4)}px ${theme.spacing(4)}px`,
  },
  paddingDense: {
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
  },
  responsivePadding: {
    [theme.breakpoints.down('md')]: {
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
