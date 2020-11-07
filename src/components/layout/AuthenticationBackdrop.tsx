import React, { FC } from 'react';
// import { createStyles } from '../../hooks/useTheme';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';
import Backdrop from '../core/Backdrop';
import Typography from '../core/Typography';
import Button from '../core/Button';

// const useMainStyles = createStyles(theme => ({}));

interface Props {
  open?: boolean;
}

const AuthenticationBackdrop: FC<Props> = ({ children, open = false }) => {
  const { context, isAuthenticated } = useAuthenticationContext();

  if (isAuthenticated && !open) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      <Backdrop>{children}</Backdrop>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'column',
          placeContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3">You need to sign in to check the community out.</Typography>
        <div>
          <Button onClick={context.handleSignIn} text={'Sign in'} />
        </div>
      </div>
    </div>
  );
};

export default AuthenticationBackdrop;
