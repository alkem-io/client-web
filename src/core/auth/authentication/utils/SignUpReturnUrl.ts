import { STORAGE_KEY_RETURN_URL, STORAGE_KEY_SIGN_UP_RETURN_URL } from '../constants/authentication.constants';

/**
 * Ideally, flowId should be part of the key, but currently Verification flow is completely detached from the flow
 * it was triggered by.
 * flowId should be made a required argument when post-registration Verification flow has some reference to the "parent"
 * (Registration) flow.
 */
export const getReturnUrlKeyForFlow = (flowId = 'registration') => `kratosFlow:${flowId}:returnUrl`;

export const restoreSignUpReturnUrl = (flowId?: string) => {
  const key = getReturnUrlKeyForFlow(flowId);
  const returnUrl = localStorage.getItem(key);
  // TODO there's no need to remove the entry once flowId is made mandatory
  localStorage.removeItem(key);
  returnUrl && sessionStorage.setItem(STORAGE_KEY_SIGN_UP_RETURN_URL, returnUrl);
};

export const storeSignUpReturnUrl = () => {
  const returnUrl = sessionStorage.getItem(STORAGE_KEY_RETURN_URL);
  returnUrl && sessionStorage.setItem(STORAGE_KEY_SIGN_UP_RETURN_URL, returnUrl);
};
