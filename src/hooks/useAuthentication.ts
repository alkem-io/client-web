import {
  AccountInfo,
  AuthenticationResult,
  AuthorizationUrlRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import { useCallback, useContext, useMemo } from 'react';
import { configContext } from '../context/ConfigProvider';
import { AadConfig } from '../generated/graphql';

export interface UseAuthenticationResult {
  signIn: () => Promise<AuthenticationResult | undefined>;
  signOut: (username: string) => Promise<void>;
  acquireToken: (username: string) => Promise<AuthenticationResult | undefined>;
  refreshToken: (username?: string) => Promise<AuthenticationResult | undefined>;
  getAccounts: () => AccountInfo[];
  loading: boolean;
}

const signIn = async (msalApp?: PublicClientApplication, aadConfig?: AadConfig) => {
  if (!msalApp || !aadConfig) return;

  return await msalApp.loginPopup(aadConfig.loginRequest);
};

const signOut = async (msalApp?: PublicClientApplication, userName?: string) => {
  if (!msalApp || !userName) return;

  return msalApp.logout({ account: msalApp.getAccountByUsername(userName) || undefined });
};

const acquireTokenSilent = async (msalApp?: PublicClientApplication, aadConfig?: AadConfig, userName?: string) => {
  if (!msalApp || !aadConfig || !userName) return;

  const silentRequest = {
    scopes: [...aadConfig.silentRequest.scopes],
    account: msalApp.getAccountByUsername(userName),
  } as SilentRequest;

  return msalApp.acquireTokenSilent(silentRequest);
};

const acquireTokenPopup = async (msalApp?: PublicClientApplication, aadConfig?: AadConfig, userName?: string) => {
  if (!msalApp || !aadConfig || !userName) return;

  const tokenRequest = {
    scopes: [...aadConfig.tokenRequest.scopes],
    account: msalApp.getAccountByUsername(userName),
  } as AuthorizationUrlRequest;

  return msalApp.acquireTokenPopup(tokenRequest);
};

const acquireToken = async (msalApp?: PublicClientApplication, aadConfig?: AadConfig, userName?: string) => {
  return await acquireTokenSilent(msalApp, aadConfig, userName).catch(async _err => {
    return await acquireTokenPopup(msalApp, aadConfig, userName);
  });
};

const refreshToken = async (msalApp?: PublicClientApplication, aadConfig?: AadConfig, userName?: string) => {
  const account = msalApp?.getAllAccounts() || [];

  const _userName = userName || (account && account[0]?.username);

  if (_userName) {
    return await acquireToken(msalApp, aadConfig, _userName);
  }
};

export const useAuthentication = (): UseAuthenticationResult => {
  const { loading: configLoading, config } = useContext(configContext);

  const aadConfig = useMemo(() => {
    return config.authentication.providers.find(x => x.config.__typename === 'AadConfig')?.config as AadConfig;
  }, [config]);

  const msalApp = useMemo(() => {
    if (configLoading || aadConfig === undefined) {
      return undefined;
    }

    return new PublicClientApplication(aadConfig.msalConfig);
  }, [configLoading, aadConfig]);

  const acquireTokenWired = useCallback((username: string) => acquireToken(msalApp, aadConfig, username), [
    msalApp,
    aadConfig,
  ]);

  const refreshTokenWired = useCallback((username?: string) => refreshToken(msalApp, aadConfig, username), [
    msalApp,
    aadConfig,
  ]);

  const getAccounts = useCallback(() => {
    if (!msalApp) console.error('Missing msalApp');
    return msalApp?.getAllAccounts() || [];
  }, [msalApp]);
  const signInWired = useCallback(() => signIn(msalApp, aadConfig), [msalApp, aadConfig]);
  const signOutWired = useCallback((username: string) => signOut(msalApp, username), [msalApp]);

  return {
    acquireToken: acquireTokenWired,
    refreshToken: refreshTokenWired,
    getAccounts,
    signIn: signInWired,
    signOut: signOutWired,
    loading: configLoading,
  };
};
