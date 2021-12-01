import React, { FC } from 'react';
import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useMainStyles = makeStyles(() => ({
  main: {
    flexGrow: 1,
    padding: '128px 0 0 0',
    maxWidth: 1380,
  },
}));

export const Main: FC = ({ children }) => {
  const styles = useMainStyles();

  return (
    <Container className={styles.main}>
      <>{children}</>
    </Container>
  );
};

export default Main;
