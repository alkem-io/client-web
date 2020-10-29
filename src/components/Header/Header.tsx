import { AccountInfo } from '@azure/msal-browser';
import { ReactComponent as PersonCircleIcon } from 'bootstrap-icons/icons/person-circle.svg';
import React, { FC, useContext } from 'react';
import { Button, Dropdown, Navbar } from 'react-bootstrap';
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
  const account = useTypedSelector<AccountInfo | null>(state => state.auth.account);

  // three state configuration
  let loginButton = <div />;

  if (context.enableAuthentication) {
    if (isAuthenticated === true && account) {
      loginButton = (
        <Dropdown alignRight>
          <Dropdown.Toggle as={Button} variant="outline-info" className="btn-circle avatar-button outline-info">
            <PersonCircleIcon className="bi bi-person-circle" style={{ width: '32px' }} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.ItemText className="mb-0">{account.name}</Dropdown.ItemText>
            <Dropdown.ItemText className="text-muted">{account.username}</Dropdown.ItemText>
            <Dropdown.Divider />
            <Dropdown.Item onClick={context.handleSignOut}>Sign out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    } else if (isAuthenticated === false) {
      loginButton = (
        <Button variant="outline-info" onClick={context.handleSignIn}>
          Login
        </Button>
      );
    }
  }
  return (
    <div>
      <Navbar className="navbar" bg="dark" variant="dark" sticky="top">
        <Navbar.Brand as={Link} to="/">
          <img alt="" src="/logo-white-cropped.png" className="logo" />
        </Navbar.Brand>
        <Nav className="mr-auto" />
        <Nav className="ml-auto" as="ul">
          <Nav.Item as="li">
            <Nav.Link as={Link} to="/admin">
              Admin
            </Nav.Link>
          </Nav.Item>{' '}
          <Nav.Item as="li">{loginButton}</Nav.Item>
        </Nav>
      </Navbar>
    </div>
  );
};

export default Header;
