import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setBaseTitle, setTitleOverride, setTitlePrefix } from './documentTitle';

describe('documentTitle', () => {
  beforeEach(() => {
    // Reset the module-level singleton to a known state before each test.
    setTitlePrefix('');
    setBaseTitle('');
  });

  afterEach(() => {
    setTitleOverride(null);
    setTitlePrefix('');
    setBaseTitle('');
  });

  it('composes base then prefix (base set first)', () => {
    setBaseTitle('Forum | Alkemio');
    expect(document.title).toBe('Forum | Alkemio');

    setTitlePrefix('(3) ');
    expect(document.title).toBe('(3) Forum | Alkemio');
  });

  it('composes prefix then base (prefix set first)', () => {
    setTitlePrefix('(3) ');
    // With an empty base, document.title trims the trailing space (HTML spec).
    expect(document.title).toBe('(3)');

    setBaseTitle('Forum | Alkemio');
    expect(document.title).toBe('(3) Forum | Alkemio');
  });

  it('clearing the prefix leaves the base intact', () => {
    setBaseTitle('Forum | Alkemio');
    setTitlePrefix('(3) ');
    expect(document.title).toBe('(3) Forum | Alkemio');

    setTitlePrefix('');
    expect(document.title).toBe('Forum | Alkemio');
  });

  it('updating the base while a prefix is active keeps the prefix', () => {
    setTitlePrefix('(1) ');
    setBaseTitle('First Page | Alkemio');
    expect(document.title).toBe('(1) First Page | Alkemio');

    setBaseTitle('Second Page | Alkemio');
    expect(document.title).toBe('(1) Second Page | Alkemio');
  });

  it('an override stands in for the base, and a navigation under it shows once it clears', () => {
    setTitlePrefix('(1) ');
    setBaseTitle('First Page | Alkemio');
    setTitleOverride('Ana is calling you');
    expect(document.title).toBe('(1) Ana is calling you');

    setBaseTitle('Second Page | Alkemio');
    expect(document.title).toBe('(1) Ana is calling you');

    setTitleOverride(null);
    expect(document.title).toBe('(1) Second Page | Alkemio');
  });
});
