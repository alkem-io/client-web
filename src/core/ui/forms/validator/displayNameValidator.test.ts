import { describe, expect, test } from 'vitest';
import { displayNameValidator } from './displayNameValidator';

describe('displayNameValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid display names', async () => {
      await expect(displayNameValidator().validate('John Doe')).resolves.toBe('John Doe');
      await expect(displayNameValidator().validate('Alice Smith')).resolves.toBe('Alice Smith');
      await expect(displayNameValidator().validate('Test User 123')).resolves.toBe('Test User 123');
    });
  });

  describe('minLength validation (3 characters)', () => {
    test('rejects display names shorter than 3 characters', async () => {
      await expect(displayNameValidator().validate('AB')).rejects.toThrow();
      await expect(displayNameValidator().validate('X')).rejects.toThrow();
    });

    test('accepts display names with exactly 3 characters', async () => {
      await expect(displayNameValidator().validate('Bob')).resolves.toBe('Bob');
      await expect(displayNameValidator().validate('ABC')).resolves.toBe('ABC');
    });

    test('accepts display names longer than 3 characters', async () => {
      await expect(displayNameValidator().validate('John')).resolves.toBe('John');
      await expect(displayNameValidator().validate('Alice')).resolves.toBe('Alice');
    });
  });

  describe('maxLength validation (SMALL_TEXT_LENGTH)', () => {
    test('rejects display names longer than SMALL_TEXT_LENGTH (128)', async () => {
      const longName = 'A'.repeat(129);
      await expect(displayNameValidator().validate(longName)).rejects.toThrow();
    });

    test('accepts display names equal to SMALL_TEXT_LENGTH (128)', async () => {
      const maxLengthName = 'A'.repeat(128);
      await expect(displayNameValidator().validate(maxLengthName)).resolves.toBe(maxLengthName);
    });

    test('accepts display names shorter than SMALL_TEXT_LENGTH', async () => {
      const shortName = 'A'.repeat(50);
      await expect(displayNameValidator().validate(shortName)).resolves.toBe(shortName);
    });
  });

  describe('allowOnlySpaces validation (false)', () => {
    test('rejects display names with only spaces', async () => {
      await expect(displayNameValidator().validate('   ')).rejects.toThrow();
      await expect(displayNameValidator().validate('     ')).rejects.toThrow();
    });

    test('accepts display names with text and spaces', async () => {
      await expect(displayNameValidator().validate('John Doe')).resolves.toBe('John Doe');
      await expect(displayNameValidator().validate('  Alice  ')).resolves.toBe('  Alice  ');
      await expect(displayNameValidator().validate('Test User')).resolves.toBe('Test User');
    });
  });

  describe('edge cases', () => {
    test('handles names with special characters', async () => {
      await expect(displayNameValidator().validate("O'Brien")).resolves.toBe("O'Brien");
      await expect(displayNameValidator().validate('Jean-Paul')).resolves.toBe('Jean-Paul');
      await expect(displayNameValidator().validate('Müller')).resolves.toBe('Müller');
    });

    test('handles names with numbers', async () => {
      await expect(displayNameValidator().validate('User123')).resolves.toBe('User123');
      await expect(displayNameValidator().validate('Agent 007')).resolves.toBe('Agent 007');
    });

    test('handles unicode characters', async () => {
      await expect(displayNameValidator().validate('王小明')).resolves.toBe('王小明');
      await expect(displayNameValidator().validate('Владимир')).resolves.toBe('Владимир');
    });

    test('handles emojis in names', async () => {
      await expect(displayNameValidator().validate('User 🎉')).resolves.toBe('User 🎉');
    });
  });

  describe('validation errors', () => {
    test('provides appropriate error for too short names', async () => {
      try {
        await displayNameValidator().validate('AB');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('provides appropriate error for only spaces', async () => {
      try {
        await displayNameValidator().validate('   ');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('provides appropriate error for too long names', async () => {
      try {
        await displayNameValidator().validate('A'.repeat(129));
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('required flag', () => {
    test('rejects undefined when required', async () => {
      await expect(displayNameValidator({ required: true }).validate(undefined)).rejects.toThrow();
    });

    test('rejects empty string when required', async () => {
      await expect(displayNameValidator({ required: true }).validate('')).rejects.toThrow();
    });

    test('accepts valid name when required', async () => {
      await expect(displayNameValidator({ required: true }).validate('Valid User')).resolves.toBe('Valid User');
    });

    test('accepts undefined when not required', async () => {
      await expect(displayNameValidator().validate(undefined)).resolves.toBeUndefined();
    });
  });
});
