import React, { FC } from 'react';
import { useTheme } from '@mui/material';

const CookieConsent: FC = ({ children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        alignItems: 'baseline',
        background: theme.palette.primary.main,
        fontFamily: theme.typography.fontFamily,
        color: 'white',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        left: '0',
        bottom: '0',
        position: 'fixed',
        width: '100%',
        zIndex: '1500',
      }}
    >
      {children}
    </div>
  );
};

export default CookieConsent;
