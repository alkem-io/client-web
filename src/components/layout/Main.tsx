import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';

const useMainStyles = createStyles(() => ({
  main: {
    flexGrow: 1,
    padding: 0,
  },
}));

export const Main: FC = ({ children }) => {
  const styles = useMainStyles();

  return (
    <Container fluid className={styles.main}>
      {children}
    </Container>
  );
};

export default Main;
