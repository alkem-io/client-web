import {
  AuthenticationResult,
  AuthError,
  AuthorizationUrlRequest,
  EndSessionRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { configContext } from '../context/ConfigProvider';
import { updateAccount, updateToken } from '../reducers/auth/actions';
import { pushError } from '../reducers/error/actions';
import { useTypedSelector } from './useTypedSelector';

const useRedirectFlow = false;
export const TOKEN_STORAGE_KEY = 'accessToken';

interface UseAuthenticationReturn {
  handleSignIn: () => void;
  handleSignOut: () => void;
  loading: boolean;
}

export const useAuthentication = (enabled = true): UseAuthenticationReturn => {
  const config = useContext(configContext);
  const username = useTypedSelector(state => state.auth.account?.username || '');
  const dispatch = useDispatch();

  const msalApp = useMemo(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (config.loading) return undefined;
    return new PublicClientApplication(config.aadConfig.msalConfig);
  }, [config.loading]);

  const getAccounts = useCallback(() => {
    if (!msalApp) return;
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
  }, [msalApp]);

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
    if (!msalApp) return;
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
    if (!msalApp) return;
    /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    const silentRequest = {
      scopes: [...config.aadConfig.silentRequest.scopes],
      account: msalApp.getAccountByUsername(username),
    } as SilentRequest;

    // eslint-disable-next-line consistent-return
    return msalApp.acquireTokenSilent(silentRequest).catch(err => {
      console.warn('silent token acquisition fails. acquiring token using interactive method');
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
            dispatch(pushError(new Error(er.errorMessage)));
            console.error(er);
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
  }, [username, msalApp]);

  useEffect(() => {
    if (enabled && msalApp) {
      if (username) {
        acquireToken().then(response => {
          if (response) {
            // set access token
            dispatch(updateToken(response));
          }
        });
      }
    }
  }, [username, msalApp]);

  return {
    handleSignIn,
    handleSignOut,
    loading: config.loading,
  };
};
