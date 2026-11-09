/**
 * The widget library logs this, with the error, every time the call UI fails to
 * download a file through the host. The call UI asks for an avatar again on
 * every tile resize, so one broken avatar floods the console for the whole
 * call. A temporary hide until the failing downloads themselves are fixed.
 */
const DOWNLOAD_ERROR_MESSAGE = 'error while downloading a file';

/**
 * Hides the widget library's "error while downloading a file" console error
 * until the returned release is called; every other console error passes
 * through unchanged. Once released, the filter passes everything through, and
 * it is taken out of `console.error` if nothing was wrapped over it since.
 */
export const quietDownloadErrors = (): (() => void) => {
  const previous = console.error;
  let active = true;
  const wrapper = function (this: unknown, ...args: unknown[]) {
    if (active && args[0] === DOWNLOAD_ERROR_MESSAGE) {
      return;
    }
    return previous.apply(this, args);
  };
  console.error = wrapper;
  return () => {
    active = false;
    if (console.error === wrapper) {
      console.error = previous;
    }
  };
};
