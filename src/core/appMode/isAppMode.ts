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
 *
 * **Fourth consumer, ruled in (091).** `sessionController.loadOrAcquireRecord`
 * — which decides how the browser's Matrix session acquires credentials when
 * none are stored — is admitted as the fourth legitimate consumer. It is **not**
 * on an authorization path: all the predicate decides is *which acquisition path
 * to try first*. The mutation it selects (`mintMatrixSession`) takes no
 * arguments and mints for `actorContext.actorID` on the caller's own
 * authenticated request, so forging the predicate in a browser mints a session
 * for the forger's **own** actor — a credential that browser can already obtain
 * through silent SSO one iframe away. And the branch the predicate selects is
 * reachable in a browser regardless, through the SSO-timeout leg beneath it. So
 * there is no privilege, no subject and no entitlement decided here, and
 * nothing a forger gains that they did not already have.
 *
 * **The census, corrected.** The three paragraphs above rule on three
 * consumers; a fifth call site has existed unruled since before 091 —
 * `CrdUserNotificationsTab.tsx:130`, which reads the predicate to choose what
 * the notifications tab offers. It is noted here so the count is honest: 091's
 * mint is the **fourth ruling and the fifth call site**.
 *
 * **Telemetry consumers, ruled in (118).** Sentry's `bootstrap` and APM's
 * `useApmInit` read the predicate, through `appPlatform` below, to tag every
 * event with `app_mode` and `app_platform` so operators can tell app traffic
 * from browser traffic. They are **not** on an authorization path: the tags are
 * written into the page's own outgoing telemetry and nothing reads them back to
 * decide anything. Forging the predicate in a browser only mislabels the
 * forger's own Sentry events and APM transactions.
 *
 * **The census, recounted (118).** The count above was wrong again: a grep for
 * calls to `isAppMode` outside tests finds fifteen call sites, not five. Ruled:
 * the four consumers above, the two telemetry consumers (`bootstrap.ts`,
 * `useApmInit.ts`) and `appPlatform` in this file, through which they read it.
 * Not yet ruled, each deciding UI or client behaviour (what to render, how links
 * open, whether to offer a reload or pull-to-refresh, whether to show a
 * catching-up state on resume) and none deciding identity or entitlement:
 * `CrdUserNotificationsTab.tsx`, `CrdLayoutWrapper.tsx`, `AppPullToRefresh.tsx`,
 * `CallOverlayHost.tsx`, `useMatrixCatchingUp.ts`, `SecondFactorCrdRoute.tsx`
 * and `ConversationThread.tsx`. A new call site still needs a ruling here.
 *
 * **Security tab, ruled in (122).** `CrdUserSecurityTab.tsx` reads the
 * predicate only to choose what the Security tab offers: in the app, the
 * "manage in a web browser" card instead of a sign-out that re-enters the SSO
 * handoff. It decides no identity or entitlement; the Kratos settings flow
 * behind the tab is authorized by the identity provider either way. The cookie
 * section on that tab does not read the predicate and renders in every state.
 * Forging it in a browser only swaps the forger's own lapsed-session card.
 *
 * **Footer licences link, ruled in.** `useCrdNavigation` reads the predicate to
 * show the third-party licences page in a dialog instead of a new tab, because
 * the shell has no tabs and no back control. It is **not** on an authorization
 * path: the page is public and the predicate only picks how it is presented.
 *
 * **The tap event is also forgeable on Android, and confinement is the control.**
 * Correcting the paragraph above, which only considered browser forgery: the
 * feature's own working path is FCM relaunching the exported `MainActivity`
 * (`ACTION_MAIN`/`LAUNCHER`) with the payload as intent extras, which Capacitor
 * fans out to every plugin — and an exported activity cannot tell that apart
 * from a local app's `startActivity`. So any installed app can synthesise a
 * `pushNotificationActionPerformed`. What that buys is "bring the app forward
 * and steer it to an arbitrary **same-origin** route", bounded by
 * `normalizePushTargetUrl` rejecting every off-origin and authority-confusable
 * target; no read access, and every route keeps its own authorization. The
 * residual (UI redress / nuisance navigation of a live session) is owned by
 * `client-appstore` — the exported launcher activity is the untrusted boundary —
 * and is not closable with a client-web guard, which would be hardening a
 * signal this file already declares non-authoritative.
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

export const appPlatform = (): 'ios' | 'android' | 'web' => {
  if (!isAppMode()) return 'web';
  const platform = window.Capacitor?.getPlatform?.();
  return platform === 'ios' || platform === 'android' ? platform : 'web';
};
