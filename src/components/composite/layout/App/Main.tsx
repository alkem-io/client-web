import { Container } from '@mui/material';
import React, { FC } from 'react';

export const Main: FC = ({ children }) => {
  return (
    <Container maxWidth="xl" sx={{ flexGrow: 1 }}>
      <>{children}</>
    </Container>
  );
};

export default Main;
