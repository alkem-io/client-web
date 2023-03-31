import { STORAGE_KEY_RETURN_URL, STORAGE_KEY_SIGN_UP_RETURN_URL } from '../constants/authentication.constants';

/**
 * Ideally, returnURL should be stored per each Registration flow, which can be achieved by having registration flowId
 * being part of the key. The problem is that when restoring, the storage is accessed from the Verification flow.
 * Currently, Verification flow is completely detached from the Registration flow it was triggered by, and we can't
 * know the original Registration flow id.
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
