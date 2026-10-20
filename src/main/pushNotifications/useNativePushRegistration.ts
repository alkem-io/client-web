import { useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { isAppMode } from '@/core/appMode/isAppMode';
import { DEVICE_PUSH_TOKEN_KEY } from '@/main/pushNotifications/constants';
import {
  RegisterDevicePushTokenDocument,
  type RegisterDevicePushTokenVariables,
} from '@/main/pushNotifications/devicePushTokenMutations';
import { getNativePushPlugin } from '@/main/pushNotifications/nativePushPlugin';

/**
 * The single owner of every native-registration log line. Without it an absent
 * `google-services.json`, a missing entitlement, an APNs refusal, an
 * uncompiled plugin and a failed bind are all indistinguishable from "push is
 * broken" on the page.
 */
const logNativePushFailure = (detail: string) => {
  console.error(`[native push] device registration failed: ${detail}`);
};

/**
 * SC-020 — captures the OS device token in app mode and binds it to the
 * signed-in user (P1 → P2).
 *
 * Mounted from `PushNotificationProviderInner`, which only mounts while
 * `isAuthenticated` — so **mounting is the sign-in transition** and unmounting
 * is the sign-out one. There is deliberately no auth-flag effect and no
 * "is the user signed in?" check. Mount **once**: this effect requests OS
 * permission, so a second instance would re-prompt (and on iOS a decline is
 * permanent for the install). Accepted consequence, residual R-8.
 *
 * Exposes nothing. The captured token travels to the sign-out unbind through
 * `localStorage`, the way this module already persists `PUSH_SUBSCRIPTION_ID_KEY`.
 */
export const useNativePushRegistration = () => {
  const [registerDevicePushToken] = useMutation<{ registerDevicePushToken: boolean }, RegisterDevicePushTokenVariables>(
    RegisterDevicePushTokenDocument
  );

  useEffect(() => {
    if (!isAppMode()) return;

    // `requestPermissions()` resolves on the OS dialog, which can outlive this
    // effect: the provider unmounts the instant `isAuthenticated` turns false,
    // and on iOS that dialog can sit open indefinitely. Listeners added after
    // the cleanup has run are listeners the cleanup cannot remove, so they
    // survive to bind a token outside the session that asked for it — and
    // `removeAllListeners()` is itself async, so an event can still land while
    // removal is in flight. Both checks below exist for those two windows.
    let active = true;

    const plugin = getNativePushPlugin();
    const getPlatform = window.Capacitor?.getPlatform;

    // In the app, yet the bridge exposed no PushNotifications proxy: the plugin
    // was never compiled into this build (`npx cap sync` not run, or the native
    // registration missing). Distinguishable from the browser case only here.
    if (!plugin || !getPlatform) {
      logNativePushFailure('the native bridge exposes no PushNotifications plugin');
      return;
    }

    plugin
      .requestPermissions()
      .then(status => {
        if (!active) return;
        // `PermissionStatus` is an OBJECT — compare the `receive` member. The
        // web-push leg next door compares a bare string because
        // `Notification.requestPermission()` resolves one; copying that shape
        // here would make the comparison always true and `register()` never run.
        if (status.receive !== 'granted') return;

        plugin.addListener('registrationError', error => logNativePushFailure(error.error));
        plugin.addListener('registration', token => {
          if (!active) return;
          // Persist first: the unbind on sign-out reads this key, and a rejected
          // bind must still leave a token the next provider mount can re-send
          // (the server's upsert is atomic, so re-registering is idempotent).
          localStorage.setItem(DEVICE_PUSH_TOKEN_KEY, token.value);
          registerDevicePushToken({
            variables: { token: token.value, platform: getPlatform() },
          }).catch(error => logNativePushFailure(String(error)));
        });

        return plugin.register();
      })
      .catch(error => logNativePushFailure(String(error)));

    return () => {
      active = false;
      plugin.removeAllListeners();
    };
  }, [registerDevicePushToken]);
};
