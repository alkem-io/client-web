/**
 * @deprecated
 * Before getting to _AUTH_REGISTER_PATH the user must accept the Platform Terms which is done on AUTH_SIGN_UP_PATH,
 * so please use AUTH_SIGN_UP_PATH for buttons/links that take a user to the registration flow.
 */
export const _AUTH_REGISTER_PATH = '/identity/registration';

/**
 * @deprecated
 * Use buildLoginUrl() helper
 */
export const _AUTH_LOGIN_PATH = '/identity/login';

export const AUTH_VERIFY_PATH = '/identity/verify';
export const AUTH_REQUIRED_PATH = '/identity/required';
export const AUTH_SIGN_UP_PATH = '/identity/sign_up';
export const AUTH_RESET_PASSWORD_PATH = '/identity/recovery';
export const PARAM_NAME_RETURN_URL = 'returnUrl';
export const STORAGE_KEY_RETURN_URL = 'returnUrl';
