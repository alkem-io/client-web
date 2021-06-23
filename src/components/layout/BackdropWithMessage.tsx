import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Backdrop from '../core/Backdrop';
import Typography from '../core/Typography';

const useBackdropStyles = createStyles(theme => ({
  backdropContainer: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    placeContent: 'center',
    alignItems: 'center',
    padding: theme.shape.spacing(4),
  },
  message: {
    textAlign: 'center',
  },
}));

export interface BackdropProps {
  show?: boolean;
  blockName?: string;
  message?: string;
  template?: React.ReactNode;
}

const BackdropWithMessage: FC<BackdropProps> = ({ children, message, template, show = false }) => {
  const styles = useBackdropStyles();

  if (show) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      <Backdrop>{children}</Backdrop>
      <div className={styles.backdropContainer}>
        <Typography variant="h3" className={styles.message}>
          {message}
        </Typography>
        {template && <div>{template}</div>}
      </div>
    </div>
  );
};

export default BackdropWithMessage;
