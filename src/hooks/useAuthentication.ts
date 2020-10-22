import {
  AuthenticationResult,
  AuthError,
  AuthorizationUrlRequest,
  EndSessionRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateAccount, updateToken } from '../reducers/auth/actions';
import { pushError } from '../reducers/error/actions';
import { loginRequest, msalConfig, silentRequest, tokenRequest } from '../utils/authConfig';
import { useTypedSelector } from './useTypedSelector';

const useRedirectFlow = false;

export const useAuthentication = (enabled = true): { handleSignIn: () => void; handleSignOut: () => void } => {
  const username = useTypedSelector(state => state.auth.account?.username || '');

  const msalApp = new PublicClientApplication(msalConfig);
  const dispatch = useDispatch();

  const getAccounts = () => {
    console.log('getting accounts');
    if (enabled) {
      /**
       * See here for more info on account retrieval:
       * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
       */
      const accounts = msalApp.getAllAccounts();
      if (accounts === null) {
        dispatch(updateAccount(null));
        console.error('No accounts detected!');
      } else if (accounts.length > 1) {
        console.warn('Multiple accounts detected.');
        // Add choose account code here
        dispatch(updateAccount(msalApp.getAccountByUsername(accounts[0].username)));
      } else if (accounts.length === 1) {
        dispatch(updateAccount(msalApp.getAccountByUsername(accounts[0].username)));
      }
    } else {
      setDummyAccount();
    }
  };

  const handleResponse = (response: AuthenticationResult | null) => {
    if (enabled) {
      if (response !== null) {
        dispatch(updateAccount(response.account));
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
        dispatch(pushError(err));
      });
  };

  const signOut = async () => {
    if (username) {
      const logoutRequest = {
        account: msalApp.getAccountByUsername(username),
      } as EndSessionRequest;

      return msalApp.logout(logoutRequest);
    }
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

  const handleSignIn = async () => {
    if (enabled) {
      await signIn(useRedirectFlow);
    } else {
      setDummyAccount();
    }
  };

  const handleSignOut = async () => {
    if (enabled) {
      await signOut();
    }
  };

  const acquireToken = useCallback(async () => {
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
  }, [username]);

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
      if (username) {
        acquireToken().then(response => {
          if (response) {
            // set access token
            dispatch(updateToken(response));
          }
        });
      }
    }
  }, [username]);

  return {
    handleSignIn,
    handleSignOut,
  };
};
