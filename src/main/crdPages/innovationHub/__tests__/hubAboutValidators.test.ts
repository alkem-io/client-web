import { describe, expect, test } from 'vitest';
import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import {
  validateDescription,
  validateDisplayName,
  validateSubdomain,
  validateTagline,
  validateTags,
} from '../hooks/hubAboutValidators';

describe('validateSubdomain', () => {
  test('rejects empty', () => {
    expect(validateSubdomain('')).toBe('settings.about.subdomain.errors.required');
  });
  test('rejects too short', () => {
    expect(validateSubdomain('ab')).toBe('settings.about.subdomain.errors.tooLong');
  });
  test('rejects too long', () => {
    expect(validateSubdomain('a'.repeat(26))).toBe('settings.about.subdomain.errors.tooLong');
  });
  test('rejects uppercase', () => {
    expect(validateSubdomain('FooBar')).toBe('settings.about.subdomain.errors.invalidFormat');
  });
  test('rejects whitespace inside', () => {
    expect(validateSubdomain('foo bar')).toBe('settings.about.subdomain.errors.invalidFormat');
  });
  test('accepts lowercase + hyphens + digits at boundaries', () => {
    expect(validateSubdomain('abc')).toBeUndefined();
    expect(validateSubdomain('vng-hub-2024')).toBeUndefined();
    expect(validateSubdomain('a'.repeat(25))).toBeUndefined();
  });
});

describe('validateDisplayName', () => {
  test('rejects empty', () => {
    expect(validateDisplayName('')).toBe('settings.about.name.errors.required');
  });
  test('rejects too short (1 char)', () => {
    expect(validateDisplayName('a')).toBe('settings.about.name.errors.tooLong');
  });
  test('rejects too long', () => {
    expect(validateDisplayName('a'.repeat(SMALL_TEXT_LENGTH + 1))).toBe('settings.about.name.errors.tooLong');
  });
  test('accepts valid', () => {
    expect(validateDisplayName('VNG Innovation Hub')).toBeUndefined();
  });
});

describe('validateDescription', () => {
  test('rejects empty', () => {
    expect(validateDescription('')).toBe('settings.about.description.errors.required');
  });
  test('rejects too long', () => {
    expect(validateDescription('x'.repeat(MARKDOWN_TEXT_LENGTH + 1))).toBe('settings.about.description.errors.tooLong');
  });
  test('accepts at boundary', () => {
    expect(validateDescription('x'.repeat(MARKDOWN_TEXT_LENGTH))).toBeUndefined();
  });
});

describe('validateTagline', () => {
  test('accepts empty', () => {
    expect(validateTagline('')).toBeUndefined();
  });
  test('rejects too long', () => {
    expect(validateTagline('y'.repeat(MID_TEXT_LENGTH + 1))).toBe('settings.about.tagline.errors.tooLong');
  });
  test('accepts at boundary', () => {
    expect(validateTagline('y'.repeat(MID_TEXT_LENGTH))).toBeUndefined();
  });
});

describe('validateTags', () => {
  test('always permissive', () => {
    expect(validateTags([])).toBeUndefined();
    expect(validateTags(['one'])).toBeUndefined();
    expect(validateTags(Array.from({ length: 100 }, (_, i) => `t${i}`))).toBeUndefined();
  });
});
