/**
 * Switches a stylesheet linked with media="print" (fetched without blocking
 * rendering) to all media once it has loaded — what an inline onload handler
 * used to do, now without one.
 */
export function activateDeferredStylesheet(link: HTMLLinkElement | null) {
  if (!link) {
    return;
  }
  const activate = () => {
    link.media = 'all';
  };
  if (link.sheet) {
    activate();
  } else {
    link.addEventListener('load', activate, { once: true });
  }
}
