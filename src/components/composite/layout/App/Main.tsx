import React, { FC } from 'react';
import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useMainStyles = makeStyles(() => ({
  main: {
    flexGrow: 1,
  },
}));

export const Main: FC = ({ children }) => {
  const styles = useMainStyles();

  return (
    <Container maxWidth="xl" className={styles.main}>
      <>{children}</>
    </Container>
  );
};

export default Main;
