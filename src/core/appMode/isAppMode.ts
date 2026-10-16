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
 */

declare global {
  interface Window {
    /**
     * Injected by the native shell — never by this bundle. Only the members the
     * page actually reads are declared, and this is their one declaration site,
     * which is what makes a wrong access path a `typecheck:native` error.
     *
     * Note there is deliberately **no `registerPlugin`**: that function exists
     * only in the `@capacitor/core` npm bundle, which this page does not load.
     * The shell injects one concrete proxy per registered native plugin at
     * `Capacitor.Plugins['<jsName>']` instead.
     */
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      isPluginAvailable?: (name: string) => boolean;
      Plugins?: Record<string, unknown>;
    };
  }
}

export const isAppMode = (): boolean =>
  typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;
