import React, { FC } from 'react';
import { Button, Navbar } from 'react-bootstrap';
import Nav from 'react-bootstrap/esm/Nav';
import './Header.css';

interface HeaderProps {
  onSignIn: () => void;
  onSignOut: () => void;
  isAuthenticated?: boolean;
  userName: string;
}

const Header: FC<HeaderProps> = ({ userName, isAuthenticated, onSignIn, onSignOut }) => {
  return (
    <div>
      <Navbar className="navbar" bg="dark" variant="dark">
        <Navbar.Brand href="/">
          <img alt="" src="/logo-white-cropped.png" height="30" />
        </Navbar.Brand>
        <Nav className="mr-auto" />
        {userName}
        {isAuthenticated ? (
          <Button variant="info" onClick={onSignOut}>
            Logout
          </Button>
        ) : (
          <Button variant="outline-info" onClick={onSignIn}>
            Login
          </Button>
        )}
      </Navbar>
    </div>
  );
};

export default Header;
