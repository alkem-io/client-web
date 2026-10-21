/**
 * Access to the native `PushNotifications` plugin proxy — a **pure accessor**.
 * It answers one question: "did the shell inject the plugin?". It makes no
 * app-mode judgement and logs nothing; `useNativePushRegistration` owns every
 * native-registration log line, including the one that tells "we are in a
 * browser" apart from "we are in the app and the plugin was never compiled in"
 * (both of which come back here as `undefined`).
 *
 * **Why the global and not `registerPlugin`.** `registerPlugin` lives only in
 * the `@capacitor/core` npm bundle, which this page does not load — it appears
 * zero times in either vendored native bridge. What the shell actually injects
 * at document start is `window.Capacitor` with `isPluginAvailable` (Android
 * `native-bridge.js:841`) plus one concrete object per *registered native*
 * plugin at `Capacitor.Plugins['<jsName>']` (iOS `JSExport.swift:73-100`,
 * Android `JSExport.java:58-91`, whose `plugin.getMethods()` includes the base
 * `Plugin` class's `requestPermissions` and `removeAllListeners`). Written as
 * `registerPlugin(...)` this would return `undefined` on a real device too, with
 * every gate green.
 *
 * The interface below is hand-written because the plugin is a `client-appstore`
 * dependency and must not be installed here. Its members are transcribed from
 * `@capacitor/push-notifications@8.1.3` `dist/esm/definitions.d.ts` (`:114`
 * `requestPermissions(): Promise<PermissionStatus>`, `:375`/`:381`
 * `PermissionStatus { receive: PermissionState }`, `:258` `Token { value }`,
 * `:267` `RegistrationError { error }`) and `@capacitor/core@8.4.2`
 * `types/definitions.d.ts:66` (`PermissionState`). It is unversioned — residual
 * R-9.
 *
 * **`pushNotificationActionPerformed` carries no line citation, deliberately.**
 * That `.d.ts` is absent from this workspace, so inventing line numbers beside
 * the honest ones above would make the whole docblock unverifiable. The overload
 * therefore declares only what the tap handler reads: `notification.data`, a
 * loose per-platform bag — not a symmetric shape, because the iOS APNs
 * dictionary and the Android FCM data map are different objects that merely
 * agree on `url` (server `native.push.sender.service.ts:206` and `:313`).
 */

export type NativePushPlugin = {
  /** `PermissionStatus` resolves an **object**, not a bare permission string. */
  requestPermissions(): Promise<{ receive: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied' }>;
  register(): Promise<void>;
  /**
   * Typed `unknown` deliberately: the injected implementation returns a plain
   * `{ remove }` object *synchronously* (`native-bridge.js:183-195`), not the
   * `Promise<PluginListenerHandle>` the plugin's own `.d.ts` declares, so no
   * caller may rely on the handle.
   *
   * There is therefore no per-consumer teardown at all, and the plugin's global
   * `removeAllListeners()` is deliberately not declared: one consumer calling it
   * silently removes every other consumer's listener. Both listening consumers
   * (`useNativePushRegistration`, `useNativePushTapRouting`) register once and
   * stay registered for the page's lifetime instead.
   */
  addListener(eventName: 'registration', listenerFunc: (token: { value: string }) => void): unknown;
  addListener(eventName: 'registrationError', listenerFunc: (error: { error: string }) => void): unknown;
  addListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (event: { notification: { data?: Record<string, unknown> } }) => void
  ): unknown;
};

export const getNativePushPlugin = (): NativePushPlugin | undefined => {
  const available = window.Capacitor?.isPluginAvailable?.('PushNotifications') === true;

  return available ? (window.Capacitor?.Plugins?.PushNotifications as NativePushPlugin | undefined) : undefined;
};
