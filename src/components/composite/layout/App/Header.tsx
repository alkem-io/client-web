import clsx from 'clsx';
import React, { FC, RefObject, useState } from 'react';
import ReactVisibilitySensor from 'react-visibility-sensor';
import Grid from '@mui/material/Grid';
import { Container } from '@mui/material';
import { createStyles } from '../../../../hooks/useTheme';
import hexToRgba from '../../../../utils/hexToRGBA';
import Toolbar from '../../../core/Toolbar';

const appBarZIndex = 100;

const useHeaderStyles = createStyles(theme => ({
  earlyAccessAlert: {
    width: 'calc(100% + 30px)',
    marginLeft: -15,
    height: theme.earlyAccessAlert.height,
    background: theme.palette.primary.main,
  },
  alertText: {
    padding: `0 ${theme.earlyAccessAlert.height}px`,
  },
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
  offsetLeftMax: {
    left: theme.sidebar.maxWidth,
  },
  offsetLeftNone: {
    left: 0,
  },
  offsetLeftMin: {
    left: theme.sidebar.minWidth,
  },
  centerContent: {
    alignItems: 'center',
  },
  link: {
    textDecoration: 'underline',
    color: theme.palette.background.paper,
  },
  toolbar: {
    padding: `${theme.spacing(4)} 0`,

    [theme.breakpoints.down('lg')]: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
  },
  toolbarDense: {
    padding: `${theme.spacing(2)} 0`,

    [theme.breakpoints.down('lg')]: {
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
        <Toolbar innerRef={innerRef} />
      </ReactVisibilitySensor>

      <Container className={clsx(styles[headerInSight ? 'absolute' : 'fixed'], styles.root)}>
        <Grid container spacing={2}>
          <Grid item xs>
            <Toolbar
              dense={!headerInSight}
              className={clsx(styles.centerContent)}
              classes={{
                padding: styles.toolbar,
                densePadding: styles.toolbarDense,
              }}
            >
              {children(headerInSight)}
            </Toolbar>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Header;
