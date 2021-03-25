import axios from 'axios';
import { useCallback, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { configContext } from '../context/ConfigProvider';
import { DemoAuthProviderConfig, useCreateUserMutation } from '../generated/graphql';
import { AuthenticationResult, RegisterResult } from '../models/AuthenticationResult';
import { AUTH_PROVIDER_KEY, AUTH_STATUS_KEY, AUTH_USER_KEY, PROVIDER_DEMO, TOKEN_KEY } from '../models/Constants';
import { updateStatus, updateToken } from '../reducers/auth/actions';
import { useAuthenticate } from './useAuthenticate';

export const useDemoAuth = () => {
  const dispatch = useDispatch();
  const { resetStore } = useAuthenticate();
  const { config } = useContext(configContext);
  const [createUser] = useCreateUserMutation();
  const demoAuthProvider = useMemo(() => {
    return config.authentication.providers.find(x => x.config.__typename === 'DemoAuthProviderConfig')
      ?.config as DemoAuthProviderConfig;
  }, [config]);

  const login = useCallback(
    async (username: string, password: string) => {
      dispatch(updateStatus('authenticating'));
      localStorage.setItem(AUTH_USER_KEY, username);
      localStorage.setItem(AUTH_PROVIDER_KEY, PROVIDER_DEMO);

      if (!demoAuthProvider) return;
      try {
        const result = await axios.post<AuthenticationResult>(
          demoAuthProvider.tokenEndpoint,
          {
            username,
            password,
          },
          {
            responseType: 'json',
            timeout: 5000,
          }
        );
        dispatch(updateToken(result?.data.access_token));
        dispatch(updateStatus('done'));
        try {
          await resetStore();
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        dispatch(updateToken());
        dispatch(updateStatus('unauthenticated'));
        if (error.response) {
          // Request made and server responded
          throw new Error(error.response.data.message);
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error(error.message);
        }
      }
    },
    [demoAuthProvider]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(AUTH_STATUS_KEY, 'unauthenticated');
  }, [config]);

  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string,
      termAndConditions: boolean
    ) => {
      if (!demoAuthProvider) return;
      dispatch(updateStatus('userRegistration'));
      const result = await axios.post<RegisterResult>(
        `${demoAuthProvider.issuer}/auth/register`,
        {
          email,
          password,
          confirmPassword,
          termAndConditions,
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
            name: `${firstName} ${lastName}`.trim(),
            firstName,
            lastName,
            email,
          },
        },
      });

      dispatch(updateStatus('done'));
    },
    [demoAuthProvider]
  );

  return {
    login,
    logout,
    register,
  };
};
