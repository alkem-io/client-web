import axios from 'axios';
import { useCallback, useContext, useMemo } from 'react';
import { configContext } from '../context/ConfigProvider';
import { SimpleAuthProviderConfig } from '../generated/graphql';
import { AuthenticationResult, RegisterResult } from '../models/AuthenticationResult';
import { AUTH_STATUS_KEY, TOKEN_KEY } from '../models/Constants';

export const useSimpleAuth = () => {
  const { config } = useContext(configContext);

  const simpleAuthProvider = useMemo(() => {
    return config.authentication.providers.find(x => x.config.__typename === 'SimpleAuthProviderConfig')
      ?.config as SimpleAuthProviderConfig;
  }, [config]);

  const login = useCallback(
    async (username: string, password: string) => {
      if (!simpleAuthProvider) return;
      const result = await axios.post<AuthenticationResult>(
        simpleAuthProvider.tokenEndpoint,
        {
          username,
          password,
        },
        {
          responseType: 'json',
          timeout: 5000,
        }
      );
      return result.data;
    },
    [simpleAuthProvider]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(AUTH_STATUS_KEY, 'unauthenticated');
  }, [config]);

  const register = useCallback(
    async (email: string, password: string) => {
      if (!simpleAuthProvider) return;
      const result = await axios.post<RegisterResult>(
        '/users/create',
        {
          email,
          password,
        },
        {
          responseType: 'json',
          timeout: 5000,
        }
      );
      return result.data;
    },
    [simpleAuthProvider]
  );

  return {
    login,
    logout,
    register,
  };
};
