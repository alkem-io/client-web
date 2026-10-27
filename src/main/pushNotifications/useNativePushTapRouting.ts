import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAppMode } from '@/core/appMode/isAppMode';
import { getNativePushPlugin } from '@/main/pushNotifications/nativePushPlugin';
import { normalizePushTargetUrl } from '@/main/pushNotifications/normalizePushTargetUrl';

/**
 * Opens the notification's target when a native push is tapped.
 *
 * **Why this is not in `useNativePushRegistration`.** That hook is mounted from
 * `PushNotificationProviderInner`, which only exists while `isAuthenticated`
 * (`PushNotificationProvider.tsx:137-139`), and mounting it *is* the sign-in
 * transition. The tap listener has to be live on **every** app start, because a
 * cold-start tap is retained by the platform until JS consumes it — and a tap
 * arriving with no session must still route. So this is a separate consumer,
 * mounted from `root.tsx` inside `BrowserRouter` and above the auth gate.
 *
 * **A signed-out or wrong-user tap routes anyway.** The target is normalised and
 * navigated immediately; there is no stash, no persisted shape and no identity
 * comparison. The app's existing route-level auth and per-route authorization
 * are the gates — adding a client-side entitlement decision would put the
 * forgeable app-mode signal near an authorization path, which `isAppMode.ts`
 * calls a hard stop.
 *
 * **Registered once, never torn down.** `addListener`'s handle is unusable
 * (`nativePushPlugin.ts`) and the plugin's `removeAllListeners()` is global, so
 * there is no way to remove just this listener — and no need: this consumer is
 * mounted for the page's lifetime. Hence the empty dependency array: `navigate`
 * re-memoizes on every location change, and a dependency on it would accumulate
 * listeners that fire one navigation per past route. The first render's
 * `navigate` stays correct because `normalizePushTargetUrl` only ever returns an
 * absolute path, which react-router resolves without the captured location.
 */
export const useNativePushTapRouting = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAppMode()) return;

    const plugin = getNativePushPlugin();
    // The browser case and the "plugin was never compiled in" case are both
    // `undefined` here; `useNativePushRegistration` owns that log line.
    if (!plugin) return;

    plugin.addListener('pushNotificationActionPerformed', event => {
      // `data.url` by name, nothing else off `data` — see the overload's
      // docblock on why the two platforms' bags are not treated as symmetric.
      const target = normalizePushTargetUrl(event.notification.data?.url, window.location.origin);
      // `undefined` is the documented "stay on the start route" outcome.
      if (target) {
        navigate(target);
      }
    });
  }, []);
};
