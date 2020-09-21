import {
  AccountInfo,
  AuthenticationResult,
  AuthError,
  AuthorizationUrlRequest,
  EndSessionRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Nav, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import EcoverseContainer from '../../containers/EcoverseContainer';
import ProfileContainer from '../../containers/ProfileContainer';
import { IRootState } from '../../reducers';
import { updateAccount, updateError } from '../../reducers/auth/actions';
import { loginRequest, msalConfig, silentRequest, tokenRequest } from '../../utils/authConfig';
import './App.css';

const useRedirectFlow = false;

const App = (): React.ReactElement => {
  // const [isAuthenticated, setAuthenticated] = useState(false);

  const [account, setAccount] = useState<AccountInfo | null>(null);

  const [username, setUsername] = useState('');

  const [error, setError] = useState<AuthError | null>(null);
  const msalApp = new PublicClientApplication(msalConfig);
  // const account = useSelector<IRootState, AccountInfo | null>(state => state.auth.account);
  // const username = useSelector<IRootState, string>(state => (state.auth.account ? state.auth.account.username : ''));
  const isAuthenticated = useSelector<IRootState, boolean>(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const getAccounts = () => {
    /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    const currentAccounts = msalApp.getAllAccounts();

    if (currentAccounts === null) {
      console.error('No accounts detected!');
    } else if (currentAccounts.length > 1) {
      console.warn('Multiple accounts detected.');
      // Add choose account code here
      dispatch(updateAccount(msalApp.getAccountByUsername(currentAccounts[0].username)));
      setAccount(msalApp.getAccountByUsername(currentAccounts[0].username));
      setUsername(currentAccounts[0].username);
      // setAuthenticated(true);
    } else if (currentAccounts.length === 1) {
      dispatch(updateAccount(msalApp.getAccountByUsername(currentAccounts[0].username)));
      setAccount(msalApp.getAccountByUsername(currentAccounts[0].username));
      setUsername(currentAccounts[0].username);
      // setAuthenticated(true);
    }
  };

  const handleResponse = (response: AuthenticationResult | null) => {
    if (response !== null) {
      dispatch(updateAccount(response.account));
      setAccount(response.account);
      setUsername(response.account.username);
      // setAuthenticated(true);
    } else {
      getAccounts();
    }
  };

  const signIn = async (redirect: any) => {
    if (redirect) {
      return msalApp.loginRedirect(loginRequest);
    }

    return msalApp
      .loginPopup(loginRequest)
      .then(handleResponse)
      .catch(err => {
        setError(err);
      });
  };

  const signOut = async () => {
    const logoutRequest = {
      account: msalApp.getAccountByUsername(username),
    } as EndSessionRequest;

    return msalApp.logout(logoutRequest);
  };

  const handleSignIn = () => {
    signIn(useRedirectFlow).then(() => {
      if (account) {
        dispatch(updateAccount(account));
      } else if (error) {
        dispatch(updateError(error));
      } else {
        dispatch(updateError(new Error('Sign-in failed. Please try again.') as AuthError));
      }
    });
  };

  const handleSignOut = () => {
    signOut().then(() => {
      if (account) {
        dispatch(updateAccount(null));
      } else if (error) {
        dispatch(updateError(error));
      } else {
        dispatch(updateError(new Error('Sign-in failed. Please try again.') as AuthError));
      }
    });
  };

  const acquireToken = async () => {
    /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    const sr = {
      scopes: [...silentRequest.scopes],
      account: msalApp.getAccountByUsername(username),
    } as SilentRequest;

    // eslint-disable-next-line consistent-return
    return msalApp.acquireTokenSilent(sr).catch(err => {
      console.warn('silent token acquisition fails. acquiring token using interactive method');
      if (err) {
        // fallback to interaction when silent call fails
        const tr = {
          scopes: [...tokenRequest.scopes],
          account: msalApp.getAccountByUsername(username),
        } as AuthorizationUrlRequest;

        return msalApp
          .acquireTokenPopup(tr)
          .then(handleResponse)
          .catch((er: any) => {
            console.error(er);
          });
      }
      console.warn(err);
    });
  };

  useEffect(() => {
    if (useRedirectFlow) {
      msalApp
        .handleRedirectPromise()
        .then(handleResponse)
        .catch(err => {
          // this.setState({ error: err.errorMessage });
          console.error(err);
        });
    }
    console.log(account);
    getAccounts();
  }, [username]);

  return (
    <div className="App">
      <Navbar className="navbar" bg="dark" variant="dark">
        <Navbar.Brand href="/">Cherry Twist</Navbar.Brand>
        <Nav className="mr-auto" />
        {username}
        {isAuthenticated ? (
          <Button variant="info" onClick={handleSignOut}>
            Logout
          </Button>
        ) : (
          <Button variant="outline-info" onClick={handleSignIn}>
            Login
          </Button>
        )}
      </Navbar>
      {/* {isAuthenticated ? (
        <ProfileContainer acquireToken={acquireToken}>
          <EcoverseContainer />
        </ProfileContainer>
      ) : ( */}
      <EcoverseContainer />
      {/* )} */}
    </div>
  );
};

export default App;
