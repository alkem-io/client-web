import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { Spinner as BootstrapSpinner, SpinnerProps as BootstrapSpinnerProps } from 'react-bootstrap';

interface SpinnerProps extends Omit<BootstrapSpinnerProps, 'animation'> {
  animation?: 'grow' | 'border';
}

const useStyles = createStyles(theme => ({
  spinner: {
    color: theme.palette.primary.main,
  },
}));

export const Spinner: FC<SpinnerProps> = ({ animation = 'grow', ...props }) => {
  const styles = useStyles();

  return <BootstrapSpinner animation={animation} className={styles.spinner} {...props} />;
};
export default Spinner;
