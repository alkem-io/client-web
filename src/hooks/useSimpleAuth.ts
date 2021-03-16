import axios from 'axios';
import { useCallback, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { configContext } from '../context/ConfigProvider';
import { SimpleAuthProviderConfig, useCreateUserMutation } from '../generated/graphql';
import { AuthenticationResult, RegisterResult } from '../models/AuthenticationResult';
import { AUTH_STATUS_KEY, TOKEN_KEY } from '../models/Constants';
import { updateStatus, updateToken } from '../reducers/auth/actions';

export const useSimpleAuth = () => {
  const dispatch = useDispatch();
  const { config } = useContext(configContext);
  const [createUser] = useCreateUserMutation();
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
    async (
      name: string,
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string
    ) => {
      if (!simpleAuthProvider) return;
      dispatch(updateStatus('userRegistration'));
      const result = await axios.post<RegisterResult>(
        '/auth/register',
        {
          email,
          password,
          confirmPassword,
        },
        {
          responseType: 'json',
          timeout: 5000,
        }
      );

      dispatch(updateToken(result?.data.access_token));

      await createUser({
        variables: {
          user: {
            name,
            firstName,
            lastName,
            email,
          },
        },
      });

      dispatch(updateStatus('done'));
    },
    [simpleAuthProvider]
  );

  return {
    login,
    logout,
    register,
  };
};
