import { describe, expect, it } from 'vitest';
import { isValidUrlOrEmpty, mapUserToProfileFormValues, PHONE_REGEX } from '../userProfileMapper';

const baseUser = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.test',
  phone: '+1-555-123-4567',
  profile: {
    id: 'profile-1',
    displayName: 'Ada',
    tagline: 'Mathematician',
    description: 'I write **algorithms**.',
    location: { country: 'GB', city: 'London' },
    avatar: { id: 'visual-avatar', uri: 'https://example.test/avatar.png', alternativeText: null },
    references: [
      { id: 'ref-1', name: 'LinkedIn', uri: 'https://linkedin.com/in/ada', description: '' },
      { id: 'ref-2', name: 'GitHub', uri: 'https://github.com/ada', description: '' },
      { id: 'ref-3', name: 'Personal site', uri: 'https://ada.example', description: 'Blog' },
    ],
    tagsets: [
      { id: 'tagset-skills', name: 'Skills', tags: ['typescript', 'react'] },
      { id: 'tagset-keywords', name: 'Keywords', tags: ['math', 'cs'] },
    ],
  },
};

describe('mapUserToProfileFormValues', () => {
  it('partitions references into recognized + arbitrary lists', () => {
    const values = mapUserToProfileFormValues(baseUser as never);
    expect(values.recognizedReferences.linkedin?.uri).toBe('https://linkedin.com/in/ada');
    expect(values.recognizedReferences.github?.uri).toBe('https://github.com/ada');
    // Bluesky absent on the server → row is present in the form but with empty id + uri.
    expect(values.recognizedReferences.bsky?.id).toBe('');
    expect(values.recognizedReferences.bsky?.uri).toBe('');
    expect(values.references).toHaveLength(1);
    expect(values.references[0]).toMatchObject({ name: 'Personal site', recognized: false });
  });

  it('extracts Skills and Keywords tagsets independently (case-insensitive name match)', () => {
    const values = mapUserToProfileFormValues(baseUser as never);
    expect(values.skills).toEqual({ id: 'tagset-skills', tags: ['typescript', 'react'] });
    expect(values.keywords).toEqual({ id: 'tagset-keywords', tags: ['math', 'cs'] });
  });

  it('returns id-undefined Skills/Keywords when those tagsets do not exist on the profile', () => {
    const values = mapUserToProfileFormValues({
      ...baseUser,
      profile: { ...baseUser.profile, tagsets: [] },
    } as never);
    expect(values.skills).toEqual({ id: undefined, tags: [] });
    expect(values.keywords).toEqual({ id: undefined, tags: [] });
  });

  it('matches tagset name case-insensitively (parity with UserProfileView reader)', () => {
    const values = mapUserToProfileFormValues({
      ...baseUser,
      profile: {
        ...baseUser.profile,
        tagsets: [
          { id: 'tagset-skills', name: 'sKiLlS', tags: ['typescript'] },
          { id: 'tagset-keywords', name: 'KEYWORDS', tags: ['cs'] },
        ],
      },
    } as never);
    expect(values.skills).toEqual({ id: 'tagset-skills', tags: ['typescript'] });
    expect(values.keywords).toEqual({ id: 'tagset-keywords', tags: ['cs'] });
  });

  it('falls back to empty visual when avatar is missing', () => {
    const values = mapUserToProfileFormValues({
      ...baseUser,
      profile: { ...baseUser.profile, avatar: null },
    } as never);
    expect(values.avatar).toEqual({ id: '', uri: null, altText: null });
  });

  it('preserves first/last name + email + phone on the top-level user', () => {
    const values = mapUserToProfileFormValues(baseUser as never);
    expect(values.firstName).toBe('Ada');
    expect(values.lastName).toBe('Lovelace');
    expect(values.email).toBe('ada@example.test');
    expect(values.phone).toBe('+1-555-123-4567');
  });
});

describe('PHONE_REGEX', () => {
  it('accepts the existing MUI-supported formats', () => {
    // Mirrors `src/domain/community/user/userForm/UserForm.tsx`:
    //   /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im
    // Note: leading-country-code prefixes like "+1-" are NOT supported by
    // the existing MUI regex; we deliberately preserve that behavior.
    expect(PHONE_REGEX.test('555.123.4567')).toBe(true);
    expect(PHONE_REGEX.test('5551234567')).toBe(true);
    expect(PHONE_REGEX.test('(555) 123-4567')).toBe(true);
    expect(PHONE_REGEX.test('+5551234567')).toBe(true);
  });

  it('rejects malformed phones', () => {
    expect(PHONE_REGEX.test('hello')).toBe(false);
    expect(PHONE_REGEX.test('123')).toBe(false);
    // Country-code prefix not supported (parity with current MUI):
    expect(PHONE_REGEX.test('+1-555-123-4567')).toBe(false);
  });
});

describe('isValidUrlOrEmpty', () => {
  it('accepts empty strings (optional refs)', () => {
    expect(isValidUrlOrEmpty('')).toBe(true);
  });

  it('accepts well-formed URLs', () => {
    expect(isValidUrlOrEmpty('https://example.com')).toBe(true);
    expect(isValidUrlOrEmpty('http://example.com/path?q=1')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isValidUrlOrEmpty('not a url')).toBe(false);
    expect(isValidUrlOrEmpty('://broken')).toBe(false);
  });
});
