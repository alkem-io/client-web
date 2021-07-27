import clsx from 'clsx';
import React, { FC, RefObject } from 'react';
import { createStyles } from '../../hooks';

const useToolbarStyles = createStyles(theme => ({
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
  },
  paddingDefault: {
    padding: `${theme.shape.spacing(4)}px ${theme.shape.spacing(4)}px`,
  },
  paddingDense: {
    padding: `${theme.shape.spacing(2)}px ${theme.shape.spacing(4)}px`,
  },
  responsivePadding: {
    [theme.media.down('md')]: {
      paddingLeft: theme.shape.spacing(2),
      paddingRight: theme.shape.spacing(2),
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
