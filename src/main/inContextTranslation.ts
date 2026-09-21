const CROWDIN_LOADER_URL = 'https://cdn.crowdin.com/jipt/jipt.js';

declare global {
  interface Window {
    _jipt?: [string, string][];
  }
}

/**
 * Loads Crowdin's in-context translation widget when the runtime flag is on.
 * Lives here, not inline in index.html, so the shell needs no inline-script
 * allowance in the content-security policy. Idempotent.
 */
export function loadInContextTranslation(env = window._env_) {
  if (env?.VITE_APP_IN_CONTEXT_TRANSLATION !== 'true' || document.querySelector('script[data-jipt]')) {
    return;
  }
  window._jipt = [['project', 'alkemio']];
  const script = document.createElement('script');
  script.src = CROWDIN_LOADER_URL;
  script.dataset.jipt = '';
  document.head.appendChild(script);
}
