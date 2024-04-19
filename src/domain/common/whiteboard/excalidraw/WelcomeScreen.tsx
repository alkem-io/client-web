import { Button } from '@mui/material';
import React from 'react';

const WelcomeScreen = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
        boxSizing: 'border-box',
        position: 'absolute',
      }}
    >
      <Button onClick={() => {}}>Excalidraw can have children</Button>
    </div>
  );
};

export default WelcomeScreen;
