import { describe, expect, it } from 'vitest';
import { mapPlainIndexToMarkupIndex } from './mentionMarkup';

// Markup `[@John](abc-123) hello` renders as plain `@John hello`.
const VALUE = '[@John](abc-123) hello';

describe('mapPlainIndexToMarkupIndex', () => {
  it('is the identity when there is no mention', () => {
    expect(mapPlainIndexToMarkupIndex('hello', 3)).toEqual({ markupIndex: 3, plainIndex: 3 });
  });

  it('maps an index before the mention unchanged', () => {
    expect(mapPlainIndexToMarkupIndex(`hi ${VALUE}`, 2)).toEqual({ markupIndex: 2, plainIndex: 2 });
  });

  it('maps the caret straight after a just-added mention past the whole markup', () => {
    // Plain index 5 is the end of `@John` — the emoji must land after `)`, not
    // inside the display name.
    expect(mapPlainIndexToMarkupIndex(VALUE, 5)).toEqual({ markupIndex: 16, plainIndex: 5 });
  });

  it('maps an index in the text after a mention past the markup, not into the id', () => {
    // Plain index 11 is the end of `@John hello`.
    expect(mapPlainIndexToMarkupIndex(VALUE, 11)).toEqual({ markupIndex: 22, plainIndex: 11 });
  });

  it('snaps an index inside a mention to the start of its markup', () => {
    // Plain index 3 sits inside `@John`; splicing there would corrupt the name.
    expect(mapPlainIndexToMarkupIndex(VALUE, 3)).toEqual({ markupIndex: 0, plainIndex: 0 });
  });

  it('accounts for every preceding mention', () => {
    const value = '[@John](abc-123) [@Ann](def-456) hi';
    // Plain text is `@John @Ann hi`; index 13 is the end.
    expect(mapPlainIndexToMarkupIndex(value, 13)).toEqual({ markupIndex: 35, plainIndex: 13 });
  });

  it('clamps an out-of-range index to the end of the markup', () => {
    expect(mapPlainIndexToMarkupIndex(VALUE, 99).markupIndex).toBe(VALUE.length);
  });
});
