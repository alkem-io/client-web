import clsx from 'clsx';
import React, { FC, RefObject, useState } from 'react';
import ReactVisibilitySensor from 'react-visibility-sensor';
import Grid from '@mui/material/Grid';
import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';
import hexToRgba from '../../../../utils/hexToRGBA';
import WrapperToolbar from '../../../core/WrapperToolbar';

const appBarZIndex = 100;

const useHeaderStyles = makeStyles(theme => ({
  root: {
    margin: 'auto',
    maxWidth: '100%',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: appBarZIndex,
  },
  fixed: {
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: appBarZIndex,
    background: hexToRgba(theme.palette.background.paper, 0.8),
  },
  centerContent: {
    alignItems: 'center',
  },
  toolbar: {
    padding: theme.spacing(0, 0),

    [theme.breakpoints.down('xl')]: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
  },
  toolbarDense: {
    padding: 0,

    [theme.breakpoints.down('xl')]: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
  },
}));

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: RefObject<any>;
  children: (isVisible: boolean) => React.ReactNode;
}

const Header: FC<HeaderProps> = ({ children, innerRef }) => {
  const styles = useHeaderStyles();
  const [headerInSight, setHeaderInSight] = useState(true);

  return (
    <>
      <ReactVisibilitySensor partialVisibility onChange={setHeaderInSight}>
        <WrapperToolbar innerRef={innerRef} />
      </ReactVisibilitySensor>

      <Container className={clsx(styles[headerInSight ? 'absolute' : 'fixed'], styles.root)}>
        <Grid container spacing={2}>
          <Grid item xs>
            <WrapperToolbar
              dense={!headerInSight}
              className={clsx(styles.centerContent)}
              classes={{
                padding: styles.toolbar,
                densePadding: styles.toolbarDense,
              }}
            >
              {children(headerInSight)}
            </WrapperToolbar>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Header;
