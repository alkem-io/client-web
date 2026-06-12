import { describe, expect, it } from 'vitest';
import { NAMEID_MAX_LENGTH } from '@/core/ui/forms/validator/nameIdValidator';
import createNameId from '@/core/utils/nameId/createNameId';

// The Create Space slug field auto-derives its `nameID` with the canonical
// `createNameId` helper (the same routine the server uses), replicating the MUI
// `NameIdField`. These cases pin the behavior the dialog relies on.
describe('Create Space slug derivation (createNameId)', () => {
  it('lowercases and strips spaces (no hyphenation between words)', () => {
    expect(createNameId('Climate Innovation Hub')).toBe('climateinnovationhub');
  });

  it('folds accented characters to their base letters', () => {
    expect(createNameId('Café Münch')).toBe('cafemunch');
  });

  it('keeps existing hyphens and digits', () => {
    expect(createNameId('my-space-2026')).toBe('my-space-2026');
  });

  it('removes punctuation and other disallowed characters', () => {
    expect(createNameId('Hello, World! & Co.')).toBe('helloworldco');
  });

  it('is always lowercase', () => {
    expect(createNameId('UPPER Case Name')).toBe(createNameId('UPPER Case Name').toLowerCase());
  });

  it('produces output matching the nameId format rule [a-z0-9-]', () => {
    expect(createNameId('My Awesome Space!')).toMatch(/^[a-z0-9-]*$/);
  });

  it(`caps the slug at NAMEID_MAX_LENGTH (${NAMEID_MAX_LENGTH}) characters`, () => {
    expect(createNameId('a'.repeat(NAMEID_MAX_LENGTH + 20)).length).toBeLessThanOrEqual(NAMEID_MAX_LENGTH);
  });

  it('returns an empty string when no allowed characters remain', () => {
    expect(createNameId('!!!   ')).toBe('');
  });
});
