// import { useTheme } from '@material-ui/core/styles';
// import useMediaQuery from '@material-ui/core/useMediaQuery';
import clsx from 'clsx';
import React, { FC, RefObject, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import ReactVisibilitySensor from 'react-visibility-sensor';
import { createStyles } from '../../../../hooks/useTheme';
import hexToRgba from '../../../../utils/hexToRGBA';
import Container from '../../../core/Container';
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
    padding: `${theme.spacing(4)}px 0`,

    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
  },
  toolbarDense: {
    padding: `${theme.spacing(2)}px 0`,

    [theme.breakpoints.down('md')]: {
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
  // const theme = useTheme();
  // const upSm = useMediaQuery(theme.breakpointss.up('sm'));
  // const upMd = useMediaQuery(theme.breakpointss.up('md'));

  return (
    <>
      <ReactVisibilitySensor partialVisibility onChange={setHeaderInSight}>
        <Toolbar innerRef={innerRef} />
      </ReactVisibilitySensor>

      <Container
        className={clsx(
          styles[headerInSight ? 'absolute' : 'fixed'],
          styles.root
          // !headerInSight && (upMd ? styles.offsetLeftMax : upSm ? styles.offsetLeftMin : styles.offsetLeftNone)
        )}
      >
        <Row>
          {/* <Col xs={false} lg={3}></Col> */}
          <Col xs>
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
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Header;
