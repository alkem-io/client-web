import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';

const useToolbarStyles = createStyles(theme => ({
  toolbar: {
    height: theme.shape.spacing(4),
    display: 'flex',
    flexDirection: 'row',
  },
  paddingDefault: {
    padding: `${theme.shape.spacing(4)}px ${theme.shape.spacing(6)}px`,
  },
  paddingDense: {
    padding: `${theme.shape.spacing(2)}px ${theme.shape.spacing(6)}px`,
  },
}));

interface ToolbarProps {
  dense?: boolean;
  paddingClass?: string;
  classes?: string;
}

const Toolbar: FC<ToolbarProps> = ({ dense, paddingClass, classes, children }) => {
  const styles = useToolbarStyles();

  return (
    <div className={clsx(styles.toolbar, paddingClass || styles.paddingDefault, dense && styles.paddingDense, classes)}>
      {children}
    </div>
  );
};

export default Toolbar;
