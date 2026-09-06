import { describe, expect, it } from 'vitest';
import { glyphForSlug, isKnownSlug } from './reactionEmoji';

describe('glyphForSlug', () => {
  it('returns the glyph for each known slug', () => {
    expect(glyphForSlug('heart')).toBe('❤️');
    expect(glyphForSlug('hugging-face')).toBe('🤗');
    expect(glyphForSlug('clapping-hands')).toBe('👏');
    expect(glyphForSlug('light-bulb')).toBe('💡');
    expect(glyphForSlug('bullseye')).toBe('🎯');
    expect(glyphForSlug('check-mark')).toBe('✅');
    expect(glyphForSlug('rocket')).toBe('🚀');
  });

  it('returns undefined for an unknown slug — never throws', () => {
    expect(glyphForSlug('unknown-slug')).toBeUndefined();
    expect(glyphForSlug('')).toBeUndefined();
    expect(glyphForSlug('1')).toBeUndefined();
    expect(glyphForSlug('#')).toBeUndefined();
    expect(glyphForSlug('*')).toBeUndefined();
    expect(glyphForSlug('fire')).toBeUndefined();
  });

  it('returns undefined for inherited-property slug names (prototype-safe)', () => {
    // A plain-object lookup would resolve these to inherited members; the Map
    // returns undefined so they are skipped rather than rendered as raw text.
    expect(glyphForSlug('__proto__')).toBeUndefined();
    expect(glyphForSlug('constructor')).toBeUndefined();
    expect(glyphForSlug('toString')).toBeUndefined();
    expect(glyphForSlug('hasOwnProperty')).toBeUndefined();
    expect(glyphForSlug('valueOf')).toBeUndefined();
  });

  it('covers exactly 7 slugs (the platform-defined set for this iteration)', () => {
    const knownSlugs = ['heart', 'hugging-face', 'clapping-hands', 'light-bulb', 'bullseye', 'check-mark', 'rocket'];
    for (const slug of knownSlugs) {
      expect(glyphForSlug(slug)).toBeDefined();
    }
    expect(knownSlugs).toHaveLength(7);
  });
});

describe('isKnownSlug', () => {
  it('returns true for every known slug', () => {
    expect(isKnownSlug('heart')).toBe(true);
    expect(isKnownSlug('rocket')).toBe(true);
  });

  it('returns false for unknown slugs without throwing', () => {
    expect(isKnownSlug('fire')).toBe(false);
    expect(isKnownSlug('1')).toBe(false);
    expect(isKnownSlug('')).toBe(false);
  });

  it('returns false for inherited-property slug names (prototype-safe)', () => {
    expect(isKnownSlug('__proto__')).toBe(false);
    expect(isKnownSlug('constructor')).toBe(false);
    expect(isKnownSlug('toString')).toBe(false);
    expect(isKnownSlug('hasOwnProperty')).toBe(false);
  });
});
