import { useApolloClient } from '@apollo/client';
import {
  AuthenticationResult,
  AuthError,
  AuthorizationUrlRequest,
  EndSessionRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { configContext } from '../context/ConfigProvider';
import { updateAccount, updateToken } from '../reducers/auth/actions';
import { pushError } from '../reducers/error/actions';
import { useTypedSelector } from './useTypedSelector';

const useRedirectFlow = false;
export const TOKEN_STORAGE_KEY = 'accessToken';

export interface UseAuthenticationResult {
  handleSignIn: () => void;
  handleSignOut: () => void;
  acquireToken: () => Promise<AuthenticationResult | void>;
  getAccounts: () => void;
  loading: boolean;
}

export const useAuthentication = (enabled = true): UseAuthenticationResult => {
  const config = useContext(configContext);
  const username = useTypedSelector(state => state.auth.account?.username || '');
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const client = useApolloClient();

  const resetCache = () => {
    console.debug('Resetting apollo store');
    return client.resetStore();
  };

  const msalApp = useMemo(() => {
    if (config.loading) {
      localStorage.setItem(TOKEN_STORAGE_KEY, '');
      return undefined;
    }
    return new PublicClientApplication(config.aadConfig.msalConfig);
  }, [config.loading]);

  const loading = useMemo(() => {
    return config.loading || msalApp === undefined;
  }, [config.loading, msalApp]);

  const getAccounts = useCallback(() => {
    if (!msalApp) return;
    if (enabled) {
      console.debug('getting accounts');
      /**
       * See here for more info on account retrieval:
       * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
       */
      const accounts = msalApp.getAllAccounts();
      if (accounts === null || accounts.length === 0) {
        dispatch(updateAccount(null));
        console.error('No accounts detected!');
        setIsReady(true); // If accounts are not detected, acquiring the token is not necessary.
      } else if (accounts.length > 1) {
        console.warn('Multiple accounts detected.');
        // Add choose account code here
        dispatch(updateAccount(msalApp.getAccountByUsername(accounts[0].username)));
      } else if (accounts.length === 1) {
        console.debug('Account found:', accounts[0].username);
        console.debug('Ready: ', isReady);
        dispatch(updateAccount(msalApp.getAccountByUsername(accounts[0].username)));
      }
    } else {
      setDummyAccount();
    }
  }, [msalApp]);

  const handleResponse = (response: AuthenticationResult | null) => {
    if (enabled) {
      if (response !== null) {
        dispatch(updateAccount(response.account));
      } else {
        getAccounts();
      }
      resetCache();
    }
  };

  const signIn = async (redirect: boolean) => {
    if (!msalApp) return;
    setIsReady(false);
    if (redirect) {
      return msalApp.loginRedirect(config.aadConfig.loginRequest);
    }
    return msalApp
      .loginPopup(config.aadConfig.loginRequest)
      .then(handleResponse)
      .catch(err => {
        dispatch(pushError(err));
      });
  };

  const signOut = async () => {
    if (!msalApp) return;
    setIsReady(false);
    if (username) {
      const logoutRequest = {
        account: msalApp.getAccountByUsername(username),
      } as EndSessionRequest;

      return msalApp.logout(logoutRequest).then(() => resetCache());
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
    if (!msalApp) return;
    console.log('Acquiring token ...');
    console.log('Ready: ', isReady);
    const silentRequest = {
      scopes: [...config.aadConfig.silentRequest.scopes],
      account: msalApp.getAccountByUsername(username),
    } as SilentRequest;

    // eslint-disable-next-line consistent-return
    return msalApp.acquireTokenSilent(silentRequest).catch(err => {
      console.warn('Silent token acquisition fails. Acquiring token using interactive method');
      if (err) {
        // fallback to interaction when silent call fails
        const tokenRequest = {
          scopes: [...config.aadConfig.tokenRequest.scopes],
          account: msalApp.getAccountByUsername(username),
        } as AuthorizationUrlRequest;

        return msalApp
          .acquireTokenPopup(tokenRequest)
          .then(handleResponse)
          .catch((er: AuthError) => {
            dispatch(updateToken(null));
            dispatch(pushError(new Error(er.errorMessage)));
            console.error(er);
            setIsReady(true);
          });
      }
      console.warn(err);
    });
  }, [username, msalApp]);

  useEffect(() => {
    if (!msalApp) return;
    if (enabled) {
      if (useRedirectFlow) {
        msalApp
          .handleRedirectPromise()
          .then(handleResponse)
          .catch(err => {
            dispatch(pushError(new Error(err.errorMessage)));
            console.error(err);
          });
      }
    }
    getAccounts();
  }, [msalApp]);

  useEffect(() => {
    if (enabled && msalApp) {
      if (username) {
        acquireToken().then(response => {
          if (response) {
            // set access token
            dispatch(updateToken(response));
          } else {
            dispatch(updateToken(null));
          }
          console.debug('Token acquired ...');

          resetCache().then(() => {
            setIsReady(true);
          });
        });
      }
    }
  }, [username, msalApp]);

  return {
    acquireToken,
    getAccounts,
    handleSignIn,
    handleSignOut,
    loading: loading || !isReady,
  };
};
