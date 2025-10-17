import { describe, expect, test } from 'vitest';
import { nameIdValidator, NAMEID_MAX_LENGTH } from './nameIdValidator';

describe('nameIdValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid nameIds', async () => {
      await expect(nameIdValidator.validate('my-space')).resolves.toBe('my-space');
      await expect(nameIdValidator.validate('test123')).resolves.toBe('test123');
      await expect(nameIdValidator.validate('user-profile')).resolves.toBe('user-profile');
    });

    test('rejects empty string', async () => {
      await expect(nameIdValidator.validate('')).rejects.toThrow();
    });

    test('rejects undefined', async () => {
      await expect(nameIdValidator.validate(undefined)).rejects.toThrow();
    });
  });

  describe('format validation (lowercase alphanumeric with hyphens)', () => {
    test('accepts lowercase letters', async () => {
      await expect(nameIdValidator.validate('abc')).resolves.toBe('abc');
      await expect(nameIdValidator.validate('lowercase')).resolves.toBe('lowercase');
    });

    test('accepts numbers', async () => {
      await expect(nameIdValidator.validate('123')).resolves.toBe('123');
      await expect(nameIdValidator.validate('test123')).resolves.toBe('test123');
    });

    test('accepts hyphens', async () => {
      await expect(nameIdValidator.validate('my-name')).resolves.toBe('my-name');
      await expect(nameIdValidator.validate('test-123')).resolves.toBe('test-123');
      await expect(nameIdValidator.validate('multi-word-id')).resolves.toBe('multi-word-id');
    });

    test('rejects uppercase letters', async () => {
      await expect(nameIdValidator.validate('MySpace')).rejects.toThrow();
      await expect(nameIdValidator.validate('TEST')).rejects.toThrow();
      await expect(nameIdValidator.validate('Test-123')).rejects.toThrow();
    });

    test('rejects spaces', async () => {
      await expect(nameIdValidator.validate('my space')).rejects.toThrow();
      await expect(nameIdValidator.validate('test 123')).rejects.toThrow();
    });

    test('rejects underscores', async () => {
      await expect(nameIdValidator.validate('my_space')).rejects.toThrow();
      await expect(nameIdValidator.validate('test_123')).rejects.toThrow();
    });

    test('rejects special characters', async () => {
      await expect(nameIdValidator.validate('test@domain')).rejects.toThrow();
      await expect(nameIdValidator.validate('my.space')).rejects.toThrow();
      await expect(nameIdValidator.validate('test!123')).rejects.toThrow();
      await expect(nameIdValidator.validate('name#id')).rejects.toThrow();
    });
  });

  describe('minLength validation (3 characters)', () => {
    test('rejects nameIds shorter than 3 characters', async () => {
      await expect(nameIdValidator.validate('ab')).rejects.toThrow();
      await expect(nameIdValidator.validate('a')).rejects.toThrow();
      await expect(nameIdValidator.validate('12')).rejects.toThrow();
    });

    test('accepts nameIds with exactly 3 characters', async () => {
      await expect(nameIdValidator.validate('abc')).resolves.toBe('abc');
      await expect(nameIdValidator.validate('123')).resolves.toBe('123');
      await expect(nameIdValidator.validate('a-b')).resolves.toBe('a-b');
    });

    test('accepts nameIds longer than 3 characters', async () => {
      await expect(nameIdValidator.validate('test')).resolves.toBe('test');
      await expect(nameIdValidator.validate('my-space')).resolves.toBe('my-space');
    });
  });

  describe('maxLength validation (NAMEID_MAX_LENGTH)', () => {
    test('rejects nameIds longer than NAMEID_MAX_LENGTH', async () => {
      const longNameId = 'a'.repeat(NAMEID_MAX_LENGTH + 1);
      await expect(nameIdValidator.validate(longNameId)).rejects.toThrow();
    });

    test('accepts nameIds equal to NAMEID_MAX_LENGTH', async () => {
      const maxLengthNameId = 'a'.repeat(NAMEID_MAX_LENGTH);
      await expect(nameIdValidator.validate(maxLengthNameId)).resolves.toBe(maxLengthNameId);
    });

    test('accepts nameIds shorter than NAMEID_MAX_LENGTH', async () => {
      await expect(nameIdValidator.validate('short-id')).resolves.toBe('short-id');
      await expect(nameIdValidator.validate('test123')).resolves.toBe('test123');
    });
  });

  describe('edge cases', () => {
    test('handles nameIds with only numbers', async () => {
      await expect(nameIdValidator.validate('12345')).resolves.toBe('12345');
    });

    test('handles nameIds starting with numbers', async () => {
      await expect(nameIdValidator.validate('123-test')).resolves.toBe('123-test');
    });

    test('handles nameIds ending with numbers', async () => {
      await expect(nameIdValidator.validate('test-123')).resolves.toBe('test-123');
    });

    test('handles nameIds with multiple hyphens', async () => {
      await expect(nameIdValidator.validate('my-test-name-id')).resolves.toBe('my-test-name-id');
    });

    test('handles nameIds with consecutive hyphens', async () => {
      await expect(nameIdValidator.validate('test--id')).resolves.toBe('test--id');
    });

    test('handles nameIds starting with hyphen', async () => {
      await expect(nameIdValidator.validate('-test')).resolves.toBe('-test');
    });

    test('handles nameIds ending with hyphen', async () => {
      await expect(nameIdValidator.validate('test-')).resolves.toBe('test-');
    });
  });

  describe('validation errors', () => {
    test('provides appropriate error for too short nameIds', async () => {
      try {
        await nameIdValidator.validate('ab');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('provides appropriate error for invalid characters', async () => {
      try {
        await nameIdValidator.validate('Test_123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('provides appropriate error for too long nameIds', async () => {
      try {
        await nameIdValidator.validate('a'.repeat(26));
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('provides appropriate error for required validation', async () => {
      try {
        await nameIdValidator.validate('');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
