import React, { FC, useContext } from 'react';
import { Button, Navbar } from 'react-bootstrap';
import Nav from 'react-bootstrap/esm/Nav';
import { Link } from 'react-router-dom';
import { appContext } from '../../context/AppProvider';
import { useTypedSelector } from '../../hooks/useTypedSelector';

// interface HeaderProps {
//   onSignIn?: () => void;
//   onSignOut?: () => void;
//   isAuthenticated?: boolean;
//   userName: string;
// }

const Header: FC = () => {
  const context = useContext(appContext);
  const isAuthenticated = useTypedSelector<boolean>(state => state.auth.isAuthenticated);
  const userName = useTypedSelector<string>(state => state.auth.account?.username || '');

  // three state configuration
  let loginButton = <div />;

  if (context.enableAuthentication) {
    if (isAuthenticated === true) {
      loginButton = (
        <Button variant="info" onClick={context.handleSignOut}>
          Logout
        </Button>
      );
    } else if (isAuthenticated === false) {
      loginButton = (
        <Button variant="outline-info" onClick={context.handleSignOut}>
          Login
        </Button>
      );
    }
  }
  return (
    <div>
      <Navbar className="navbar" bg="dark" variant="dark">
        <Navbar.Brand as={Link} to="/">
          <img alt="" src="/logo-white-cropped.png" className="logo" />
        </Navbar.Brand>
        <Nav className="mr-auto" />
        {userName}
        {loginButton}
      </Navbar>
    </div>
  );
};

export default Header;
