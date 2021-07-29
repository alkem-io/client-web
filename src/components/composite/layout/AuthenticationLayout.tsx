import clsx from 'clsx';
import React, { FC } from 'react';
import { Col, Container, ContainerProps, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Image from '../../core/Image';
import { createStyles } from '../../../hooks/useTheme';

const useAuthenticationLayout = createStyles(theme => ({
  logo: {
    height: theme.shape.spacing(4),
  },
  logoWrapper: {
    marginBottom: theme.shape.spacing(2),
  },
}));

interface AuthenticationLayoutProps extends ContainerProps {}

export const AuthenticationLayout: FC<AuthenticationLayoutProps> = ({ children, ...rest }) => {
  const styles = useAuthenticationLayout();
  return (
    <Container {...rest}>
      <Row>
        <Col className={clsx('d-flex justify-content-center', styles.logoWrapper)}>
          <Link to={'/about'} href="https://alkem.io/about/">
            <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
          </Link>
        </Col>
      </Row>
      {children}
    </Container>
  );
};
export default AuthenticationLayout;
