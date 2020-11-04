import clsx from 'clsx';
import React, { FC, RefObject } from 'react';
import { createStyles } from '../../hooks/useTheme';

const useToolbarStyles = createStyles(theme => ({
  toolbar: {
    height: theme.shape.spacing(4),
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
  paddingClass?: string;
  classes?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: RefObject<any>;
}

const Toolbar: FC<ToolbarProps> = ({ dense, paddingClass, classes, children, innerRef }) => {
  const styles = useToolbarStyles();

  return (
    <div
      ref={innerRef}
      className={clsx(
        styles.toolbar,
        paddingClass || styles.paddingDefault,
        dense && styles.paddingDense,
        styles.responsivePadding,
        classes
      )}
    >
      {children}
    </div>
  );
};

export default Toolbar;
