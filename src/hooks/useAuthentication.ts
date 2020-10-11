import {
  AccountInfo,
  AuthenticationResult,
  AuthError,
  AuthorizationUrlRequest,
  EndSessionRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateAccount, updateToken } from '../reducers/auth/actions';
import { pushError } from '../reducers/error/actions';
import { loginRequest, msalConfig, silentRequest, tokenRequest } from '../utils/authConfig';

const useRedirectFlow = false;

export const useAuthentication = (enabled = true): { handleSignIn: () => void; handleSignOut: () => void } => {
  const [account, setAccount] = useState<AccountInfo | null>(null);

  const [username, setUsername] = useState('');

  const [error, setError] = useState<AuthError | null>(null);
  const msalApp = new PublicClientApplication(msalConfig);
  const dispatch = useDispatch();

  const getAccounts = () => {
    if (enabled) {
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
    } else {
      setDummyAccount();
    }
  };

  const handleResponse = (response: AuthenticationResult | null) => {
    if (enabled) {
      if (response !== null) {
        dispatch(updateAccount(response.account));
        setAccount(response.account);
        setUsername(response.account.username);
        // setAuthenticated(true);
      } else {
        getAccounts();
      }
    }
  };

  const signIn = async (redirect: boolean) => {
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

  const setDummyAccount = () => {
    dispatch(
      updateAccount({
        username: 'Dummy account',
        environment: '',
        tenantId: '',
        homeAccountId: '',
      })
    );
  };

  const handleSignIn = () => {
    if (enabled) {
      signIn(useRedirectFlow).then(() => {
        if (account) {
          dispatch(updateAccount(account));
        } else if (error) {
          dispatch(pushError(error));
        } else {
          dispatch(pushError(new Error('Sign-in failed. Please try again.') as AuthError));
        }
      });
    } else {
      setDummyAccount();
    }
  };

  const handleSignOut = () => {
    if (enabled) {
      signOut().then(() => {
        if (account) {
          dispatch(updateAccount(null));
        } else if (error) {
          dispatch(pushError(error));
        } else {
          dispatch(pushError(new Error('Sign-in failed. Please try again.') as AuthError));
        }
      });
    }
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
          .catch((er: AuthError) => {
            dispatch(pushError(new Error(er.errorMessage)));
            console.error(er);
          });
      }
      console.warn(err);
    });
  };

  useEffect(() => {
    if (enabled) {
      if (useRedirectFlow) {
        msalApp
          .handleRedirectPromise()
          .then(handleResponse)
          .catch(err => {
            dispatch(pushError(new Error(err.message)));
            console.error(err);
          });
      }
    }
    getAccounts();
  }, [username]);

  useEffect(() => {
    if (enabled) {
      acquireToken().then(response => {
        if (response) {
          // set access token
          dispatch(updateToken(response));
        }
      });
    }
  }, [username]);

  return {
    handleSignIn,
    handleSignOut,
  };
};
