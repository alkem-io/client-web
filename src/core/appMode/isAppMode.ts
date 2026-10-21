/**
 * App mode — the single owner of "is this page running inside the Capacitor
 * native shell (`client-appstore`) rather than a browser?".
 *
 * **Where the signal comes from.** The native shell injects `window.Capacitor`
 * at document start into the *remote* origin it loads, so the deployed page
 * sees it without bundling any Capacitor package. Code-verified on Android
 * (`Bridge.java:261-275`, `WebViewCompat.addDocumentStartJavaScript` against
 * `appUrl = getServerUrl()`) and iOS (`JSExport.swift:20,107,212`,
 * `WKUserScript(.atDocumentStart)`); the bridge derives it from
 * `window.androidBridge` / `window.webkit.messageHandlers.bridge`.
 *
 * **It is forgeable in a browser, and that is accepted.** Anyone can define
 * `window.Capacitor` in a console. Every effect reachable from this predicate is
 * self-inflicted — a visitor suppressing their own web-push subscription — so
 * there is nothing to gain by forging it.
 *
 * **It is never an authorization or entry gate.** This is the lesson of feature
 * 079's residual applied the right way round: do not hunt for an unforgeable
 * client signal, keep the forgeable one off the security-critical path. The
 * device-token binding is authorized by `actorContext.actorID` on the
 * authenticated GraphQL request, exactly as the web-push mutations are. The two
 * legitimate consumers are the web-push availability expression
 * (`usePushNotifications`) and the decision to register a native token
 * (`useNativePushRegistration`); a third consumer needs a ruling, and a consumer
 * on an authorization path is a hard stop.
 *
 * **Third consumer, ruled in (088).** `useNativePushTapRouting` — the handler
 * that routes a tapped native notification to its target — is admitted as the
 * third legitimate consumer. It is **not** on an authorization path: all the
 * predicate decides is whether to register a plugin listener that can only ever
 * exist in the app shell. Forging it in a browser subscribes the forger to an
 * event no browser emits; what the handler would then navigate to is a
 * same-origin path the forger could type into the address bar anyway, because
 * the target is normalised against the serving origin
 * (`normalizePushTargetUrl`) and the route it lands on is still gated by the
 * app's existing route-level auth and per-route authorization. No identity or
 * entitlement decision is taken from this signal.
 */

declare global {
  interface Window {
    /**
     * Injected by the native shell — never by this bundle. Only the members the
     * page actually reads are declared, and this is their one declaration site,
     * which is what makes a wrong access path a `typecheck:native` error. Why
     * there is no `registerPlugin` member: see `nativePushPlugin.ts`.
     */
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      isPluginAvailable?: (name: string) => boolean;
      Plugins?: Record<string, unknown>;
    };
  }
}

export const isAppMode = (): boolean => window.Capacitor?.isNativePlatform?.() === true;
