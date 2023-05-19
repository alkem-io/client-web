import { useEffect, useRef } from 'react';
import { ROUTE_HOME } from '../../../../domain/platform/routes/constants';
import { STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';

// TODO review if default is needed when returnUrl is mandatory (can we ensure returnUrl is always present?)
const DEFAULT_RETURN_URL = ROUTE_HOME;

const STORAGE_KEY_SIGN_UP_RETURN_URL = 'signUpReturnUrl';

const storeSignUpReturnUrl = (returnUrl: string) => {
  localStorage.setItem(STORAGE_KEY_SIGN_UP_RETURN_URL, returnUrl);
};

export const useReturnUrl = () => {
  return useRef(sessionStorage.getItem(STORAGE_KEY_RETURN_URL)).current ?? DEFAULT_RETURN_URL;
};

type UseSignUpReturnUrlProvided = [returnUrl: string, cleanUp: () => void];

export const useSignUpReturnUrl = (): UseSignUpReturnUrlProvided => {
  const sessionReturnUrl = useRef(sessionStorage.getItem(STORAGE_KEY_RETURN_URL)).current;

  const signUpReturnUrl = useRef(localStorage.getItem(STORAGE_KEY_SIGN_UP_RETURN_URL)).current;

  useEffect(() => {
    if (!sessionReturnUrl && signUpReturnUrl) {
      sessionStorage.setItem(STORAGE_KEY_RETURN_URL, signUpReturnUrl);
    }
  }, [sessionReturnUrl]);

  const returnUrl = sessionReturnUrl ?? signUpReturnUrl ?? DEFAULT_RETURN_URL;

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
