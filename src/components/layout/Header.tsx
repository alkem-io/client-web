import clsx from 'clsx';
import React, { FC, RefObject, useState } from 'react';
import ReactVisibilitySensor from 'react-visibility-sensor';
import { createStyles } from '../../hooks/useTheme';
import Toolbar from '../core/Toolbar';
import Container from '../core/Container';
import hexToRgba from '../../utils/hexToRGBA';
import { Col, Row } from 'react-bootstrap';
import Typography from '../core/Typography';

const appBarZIndex = 100;

const useHeaderStyles = createStyles(theme => ({
  earlyAccessAlert: {
    width: 'calc(100% + 30px)',
    marginLeft: -15,
    height: 40,
    background: theme.palette.primary,
  },
  alertText: {
    padding: '0 40px',
  },
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

      <Container className={styles[headerInSight ? 'absolute' : 'fixed']}>
        {headerInSight && (
          <Row className={styles.earlyAccessAlert}>
            <Col xs={false} lg={3} />
            <Col xs={12} lg={8} className={'d-flex align-items-center'}>
              <Typography variant={'caption'} weight={'boldLight'} color={'background'} className={styles.alertText}>
                Early Access Partner Preview (read-only)
              </Typography>
            </Col>
          </Row>
        )}
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
