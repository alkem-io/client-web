import clsx from 'clsx';
import React, { FC, useState } from 'react';
import ReactVisibilitySensor from 'react-visibility-sensor';
import { createStyles } from '../../hooks/useTheme';
import Toolbar from '../core/Toolbar';
import Container from '../core/Container';
import hexToRgba from '../../utils/hexToRGBA';
import { Col, Row } from 'react-bootstrap';

const appBarZIndex = 100;

const useHeaderStyles = createStyles(theme => ({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: appBarZIndex,
  },
  fixed: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: appBarZIndex,
    background: hexToRgba(theme.palette.background, 0.8),
  },
  centerContent: {
    alignItems: 'center',
  },
}));

interface HeaderProps {
  children: (isVisible: boolean) => React.ReactNode;
}

const Header: FC<HeaderProps> = ({ children }) => {
  const styles = useHeaderStyles();
  const [headerInSight, setHeaderInSight] = useState(true);

  return (
    <>
      <ReactVisibilitySensor partialVisibility onChange={setHeaderInSight}>
        <Toolbar />
      </ReactVisibilitySensor>

      <Container className={styles[headerInSight ? 'absolute' : 'fixed']}>
        <Row>
          <Col xs={false} lg={3}></Col>
          <Col xs>
            <Toolbar dense={!headerInSight} classes={clsx(styles.centerContent)}>
              {children(headerInSight)}
            </Toolbar>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Header;
