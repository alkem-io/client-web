import React, { FC } from 'react';
import { makeStyles } from '@mui/styles';
import WrapperBackdrop from './WrapperBackdrop';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';

const useBackdropStyles = makeStyles(theme => ({
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
    padding: theme.spacing(4),
  },
  message: {
    textAlign: 'center',
  },
}));

export interface BackdropProps {
  show?: boolean;
  blockName?: React.ReactNode;
  message?: string;
  template?: React.ReactNode;
}

export const BackdropWithMessage: FC<BackdropProps> = ({ children, message, template, show = false }) => {
  const styles = useBackdropStyles();

  if (!show) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      <WrapperBackdrop>{children}</WrapperBackdrop>
      <div className={styles.backdropContainer}>
        <WrapperTypography variant="h3" className={styles.message}>
          {message}
        </WrapperTypography>
        {template && <div>{template}</div>}
      </div>
    </div>
  );
};

export default BackdropWithMessage;
