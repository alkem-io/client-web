import React, { FC } from 'react';
import { Button, Navbar } from 'react-bootstrap';
import Nav from 'react-bootstrap/esm/Nav';
import './Header.css';

interface HeaderProps {
  onSignIn?: () => void;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
  userName: string;
}

const Header: FC<HeaderProps> = ({ userName, isAuthenticated, onSignIn, onSignOut }: HeaderProps) => {
  // three state configuration
  let loginButton = <div />;

  if (isAuthenticated === true) {
    loginButton = (
      <Button variant="info" onClick={onSignOut}>
        Logout
      </Button>
    );
  } else if (isAuthenticated === false) {
    loginButton = (
      <Button variant="outline-info" onClick={onSignIn}>
        Login
      </Button>
    );
  }

  return (
    <div>
      <Navbar className="navbar" bg="dark" variant="dark">
        <Navbar.Brand href="/">
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
