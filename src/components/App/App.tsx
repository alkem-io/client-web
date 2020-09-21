import {
  AccountInfo,
  AuthorizationUrlRequest,
  EndSessionRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Jumbotron, Nav, Navbar } from 'react-bootstrap';
import { loginRequest, msalConfig, silentRequest, tokenRequest } from '../../utils/authConfig';
import ProfileContainer from '../../containers/ProfileContainer';
import './App.css';

export interface AppProps {
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  account: any;
  error: Error | undefined;
  signIn: () => Promise<void>;
  updateAccount: (account: any) => void;
  updateError: (error: Error) => void;
}

const useRedirectFlow = false;

const App = (): React.ReactElement => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  const [account, setAccount] = useState<AccountInfo | null>(null);

  const [username, setUsername] = useState('');

  const msalApp = new PublicClientApplication(msalConfig);

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
      setAccount(msalApp.getAccountByUsername(currentAccounts[0].username));
      setUsername(currentAccounts[0].username);
      setAuthenticated(true);
    } else if (currentAccounts.length === 1) {
      setAccount(msalApp.getAccountByUsername(currentAccounts[0].username));
      setUsername(currentAccounts[0].username);
      setAuthenticated(true);
    }
  };

  const handleResponse = (response: any) => {
    if (response !== null) {
      setAccount(response.account);
      setUsername(response.account.username);
      setAuthenticated(true);
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
        console.error(err);
      });
  };

  const signOut = async () => {
    const logoutRequest = {
      account: msalApp.getAccountByUsername(username),
    } as EndSessionRequest;

    return msalApp.logout(logoutRequest);
  };

  // const { isAuthenticated } = props;
  const handleSignIn = () => {
    setAuthenticated(true);
    signIn(useRedirectFlow).then(() => {
      console.log('Sign in success!');
      //   if (props.account) {
      //     console.log(props);
      //     props.updateAccount(props.account);
      //   } else if (props.error) {
      //     props.updateError(props.error);
      //   } else {
      //     props.updateError(new Error('Sign-in failed. Please try again.'));
      //   }
    });
  };

  const handleSignOut = () => {
    setAuthenticated(false);
    signOut().then(() => {
      console.log('Sign out success!');
      //   if (!props.account) {
      //     props.updateAccount(null);
      //   } else if (props.error) {
      //     props.updateError(props.error);
      //   } else {
      //     props.updateError(new Error('Sign-out failed. Please try again.'));
      //   }
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

    return msalApp.acquireTokenSilent(sr).catch(error => {
      console.warn('silent token acquisition fails. acquiring token using interactive method');
      if (error) {
        // fallback to interaction when silent call fails
        const tr = {
          scopes: [...tokenRequest.scopes],
          account: msalApp.getAccountByUsername(username),
        } as AuthorizationUrlRequest;

        return msalApp
          .acquireTokenPopup(tr)
          .then(handleResponse)
          .catch((err: any) => {
            console.error(err);
          });
      }
      console.warn(error);
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

    getAccounts();
  });

  return (
    <div className="App">
      <Navbar className="navbar" bg="dark" variant="dark">
        <Navbar.Brand href="/">Cherry Twist</Navbar.Brand>
        <Nav className="mr-auto" />
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
      {isAuthenticated ? (
        <ProfileContainer />
      ) : (
        // <ChallengeList handleIdChange={handleIdChange}/>
        // <ChallengeProfile id={id} />
        <Jumbotron className="welcome">
          <h1>Cherry twist login test</h1>
        </Jumbotron>
      )}
    </div>
  );
};

export default App;
