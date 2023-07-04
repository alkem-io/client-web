/**
 * @deprecated
 * Before getting to _AUTH_REGISTER_PATH the user must accept the Platform Terms which is done on AUTH_SIGN_UP_PATH,
 * so please use AUTH_SIGN_UP_PATH for buttons/links that take a user to the registration flow.
 */
export const _AUTH_REGISTER_PATH = '/registration';

/**
 * @deprecated
 * Use buildLoginUrl() helper
 */
export const _AUTH_LOGIN_PATH = '/login';

export const AUTH_LOGOUT_PATH = '/logout';
export const AUTH_VERIFY_PATH = '/verify';
export const AUTH_REMINDER_PATH = `${AUTH_VERIFY_PATH}/reminder`;
export const AUTH_REQUIRED_PATH = '/required';
export const AUTH_SIGN_UP_PATH = '/sign_up';
export const AUTH_RESET_PASSWORD_REQUEST = '/ory/kratos/public/self-service/recovery/browser';
export const AUTH_RESET_PASSWORD_PATH = '/recovery';
export const PARAM_NAME_RETURN_URL = 'returnUrl';
export const STORAGE_KEY_RETURN_URL = 'returnUrl';
