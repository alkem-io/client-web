/**
 * The widget library logs this, with the error, every time the call UI fails to
 * download a file through the host. The call UI asks for an avatar again on
 * every tile resize, so one broken avatar floods the console for the whole
 * call. A temporary hide until the failing downloads themselves are fixed.
 */
const DOWNLOAD_ERROR_MESSAGE = 'error while downloading a file';

/** Open calls that want the message hidden. */
let openCalls = 0;
let installed: { wrapper: typeof console.error; previous: typeof console.error } | null = null;

/**
 * Hides the widget library's "error while downloading a file" console error
 * while a call is open; every other console error passes through unchanged.
 * Returns the release; the filter goes away when the last open call releases.
 * A wrapper installed over this one is never clobbered: this one then stays in
 * the chain, passing everything through until a call is open again.
 */
export const quietDownloadErrors = (): (() => void) => {
  openCalls += 1;
  if (!installed) {
    const previous = console.error;
    const wrapper = function (this: unknown, ...args: unknown[]) {
      if (openCalls > 0 && args[0] === DOWNLOAD_ERROR_MESSAGE) {
        return;
      }
      return previous.apply(this, args);
    };
    console.error = wrapper;
    installed = { wrapper, previous };
  }
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    openCalls -= 1;
    if (openCalls === 0 && installed && console.error === installed.wrapper) {
      console.error = installed.previous;
      installed = null;
    }
  };
};
