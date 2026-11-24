/**
 * The installed store-app version, read from the marker the native shell
 * appends to the WebView user agent: `AlkemioApp/<version> (<platform>; <env>)`
 * (`client-appstore/capacitor.config.ts`). Undefined in a browser and in app
 * builds older than the marker. Display only: a user agent is forgeable, so
 * nothing may be decided from this value.
 */
export const appVersion = (): string | undefined => navigator.userAgent.match(/\bAlkemioApp\/([^\s(]+)/)?.[1];
