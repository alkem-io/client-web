import { Container, ContainerProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import useCurrentBreakpoint from '../../../../../core/ui/utils/useCurrentBreakpoint';

const useMainStyles = makeStyles(() => ({
  main: {
    flexGrow: 1,
    display: 'flex',
    flexFlow: 'column nowrap',
  },
}));

/**
 * @deprecated - left for compatibility with Pages that haven't been updated to the new design yet
 */
export const Main = (props: ContainerProps) => {
  const styles = useMainStyles();
  const breakpoint = useCurrentBreakpoint();

  return <Container maxWidth={breakpoint} className={styles.main} {...props} />;
};

export default Main;
