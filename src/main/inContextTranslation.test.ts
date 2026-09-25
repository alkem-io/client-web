import { afterEach, describe, expect, it } from 'vitest';
import { loadInContextTranslation } from './inContextTranslation';

const loaderScripts = () => document.querySelectorAll('script[data-jipt]');

describe('loadInContextTranslation', () => {
  afterEach(() => {
    for (const script of loaderScripts()) script.remove();
    window._jipt = undefined;
  });

  it('does nothing when the flag is unset or false', () => {
    loadInContextTranslation(undefined);
    loadInContextTranslation({ VITE_APP_IN_CONTEXT_TRANSLATION: 'false' });
    expect(loaderScripts()).toHaveLength(0);
    expect(window._jipt).toBeUndefined();
  });

  it('appends the Crowdin loader once when the flag is on', () => {
    loadInContextTranslation({ VITE_APP_IN_CONTEXT_TRANSLATION: 'true' });
    loadInContextTranslation({ VITE_APP_IN_CONTEXT_TRANSLATION: 'true' });
    const scripts = loaderScripts();
    expect(scripts).toHaveLength(1);
    expect((scripts[0] as HTMLScriptElement).src).toBe('https://cdn.crowdin.com/jipt/jipt.js');
    expect(window._jipt).toEqual([['project', 'alkemio']]);
  });
});
