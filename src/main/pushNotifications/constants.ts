export const PUSH_SUBSCRIPTION_ID_KEY = 'alkemio_push_subscription_id';
export const PUSH_USER_DISABLED_KEY = 'alkemio_push_user_disabled';

/**
 * The native device push token captured by `useNativePushRegistration`. It is
 * read by `LogoutPage` on a different route to unbind the device on sign-out —
 * the cross-user-leak control — which is why it is persisted here rather than
 * held in a hook ref: the push context carries no native members, and a ref
 * would also be lost across a page reload.
 */
export const DEVICE_PUSH_TOKEN_KEY = 'alkemio_device_push_token';
