import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import useCurrentBreakpoint from '../../../../hooks/useCurrentBreakpoint';

const useMainStyles = makeStyles(() => ({
  main: {
    flexGrow: 1,
    display: 'flex',
    flexFlow: 'column nowrap',
  },
}));

export const Main: FC = ({ children }) => {
  const styles = useMainStyles();
  const breakpoint = useCurrentBreakpoint();

  return (
    <Container maxWidth={breakpoint} className={styles.main}>
      <>{children}</>
    </Container>
  );
};

export default Main;
