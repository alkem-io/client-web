import { useEffect, useRef } from 'react';
import { ROUTE_HOME } from '@domain/platform/routes/constants';
import { STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import { useConfig } from '@domain/platform/config/useConfig';
import usePlatformOrigin from '@domain/platform/routes/usePlatformOrigin';

const STORAGE_KEY_SIGN_UP_RETURN_URL = 'signUpReturnUrl';

const storeSignUpReturnUrl = (returnUrl: string) => {
  localStorage.setItem(STORAGE_KEY_SIGN_UP_RETURN_URL, returnUrl);
};

export const useReturnUrl = () => {
  const platformOrigin = usePlatformOrigin();
  const defaultReturnUrl = platformOrigin && `${platformOrigin}${ROUTE_HOME}`;

  return useRef(sessionStorage.getItem(STORAGE_KEY_RETURN_URL)).current ?? defaultReturnUrl;
};

type UseSignUpReturnUrlProvided = [returnUrl: string, cleanUp: () => void];

export const useSignUpReturnUrl = (): UseSignUpReturnUrlProvided => {
  const { locations } = useConfig();
  const sessionReturnUrl = useRef(sessionStorage.getItem(STORAGE_KEY_RETURN_URL)).current;

  const signUpReturnUrl = useRef(localStorage.getItem(STORAGE_KEY_SIGN_UP_RETURN_URL)).current;

  useEffect(() => {
    if (!sessionReturnUrl && signUpReturnUrl) {
      sessionStorage.setItem(STORAGE_KEY_RETURN_URL, signUpReturnUrl);
    }
  }, [sessionReturnUrl]);

  const returnUrl = sessionReturnUrl ?? signUpReturnUrl ?? `https://${locations?.domain}${ROUTE_HOME}`;

  const cleanUp = () => localStorage.removeItem(STORAGE_KEY_SIGN_UP_RETURN_URL);

  return [returnUrl, cleanUp];
};

export const useStoreSignUpReturnUrl = () => {
  const returnUrl = useRef(sessionStorage.getItem(STORAGE_KEY_RETURN_URL)).current;

  useEffect(() => {
    if (returnUrl) {
      storeSignUpReturnUrl(returnUrl);
    }
  }, [returnUrl]);
};
