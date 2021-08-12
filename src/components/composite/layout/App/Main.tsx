import React, { FC } from 'react';
import { Container } from '@material-ui/core';
import { createStyles } from '../../../../hooks/useTheme';

const useMainStyles = createStyles(() => ({
  main: {
    flexGrow: 1,
    padding: '40px 0 0 0',
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
