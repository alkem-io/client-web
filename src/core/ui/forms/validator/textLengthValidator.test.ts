import { describe, expect, test } from 'vitest';
import { textLengthValidator } from './textLengthValidator';

describe('textLengthValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid text within length constraints', async () => {
      const validator = textLengthValidator({ maxLength: 10 });
      await expect(validator.validate('hello')).resolves.toBe('hello');
    });

    test('accepts empty string when not required', async () => {
      const validator = textLengthValidator({ maxLength: 10 });
      await expect(validator.validate('')).resolves.toBe('');
    });

    test('accepts undefined when not required', async () => {
      const validator = textLengthValidator({ maxLength: 10 });
      await expect(validator.validate(undefined)).resolves.toBeUndefined();
    });
  });

  describe('required validation', () => {
    test('rejects empty string when required', async () => {
      const validator = textLengthValidator({ maxLength: 10, required: true });
      await expect(validator.validate('')).rejects.toThrow();
    });

    test('rejects undefined when required', async () => {
      const validator = textLengthValidator({ maxLength: 10, required: true });
      await expect(validator.validate(undefined)).rejects.toThrow();
    });

    test('accepts valid text when required', async () => {
      const validator = textLengthValidator({ maxLength: 10, required: true });
      await expect(validator.validate('hello')).resolves.toBe('hello');
    });
  });

  describe('minLength validation', () => {
    test('rejects text shorter than minLength', async () => {
      const validator = textLengthValidator({ minLength: 5, maxLength: 20 });
      await expect(validator.validate('hi')).rejects.toThrow();
    });

    test('accepts text equal to minLength', async () => {
      const validator = textLengthValidator({ minLength: 5, maxLength: 20 });
      await expect(validator.validate('hello')).resolves.toBe('hello');
    });

    test('accepts text longer than minLength', async () => {
      const validator = textLengthValidator({ minLength: 3, maxLength: 20 });
      await expect(validator.validate('hello world')).resolves.toBe('hello world');
    });
  });

  describe('maxLength validation', () => {
    test('rejects text longer than maxLength', async () => {
      const validator = textLengthValidator({ maxLength: 5 });
      await expect(validator.validate('hello world')).rejects.toThrow();
    });

    test('accepts text equal to maxLength', async () => {
      const validator = textLengthValidator({ maxLength: 5 });
      await expect(validator.validate('hello')).resolves.toBe('hello');
    });

    test('accepts text shorter than maxLength', async () => {
      const validator = textLengthValidator({ maxLength: 10 });
      await expect(validator.validate('hi')).resolves.toBe('hi');
    });
  });

  describe('allowOnlySpaces validation', () => {
    test('rejects strings with only spaces when allowOnlySpaces is false', async () => {
      const validator = textLengthValidator({ maxLength: 10, allowOnlySpaces: false });
      await expect(validator.validate('   ')).rejects.toThrow();
    });

    test('accepts strings with only spaces when allowOnlySpaces is true', async () => {
      const validator = textLengthValidator({ maxLength: 10, allowOnlySpaces: true });
      await expect(validator.validate('   ')).resolves.toBe('   ');
    });

    test('accepts strings with text and spaces when allowOnlySpaces is false', async () => {
      const validator = textLengthValidator({ maxLength: 20, allowOnlySpaces: false });
      await expect(validator.validate('hello world')).resolves.toBe('hello world');
    });

    test('rejects empty spaces by default (allowOnlySpaces defaults to false)', async () => {
      const validator = textLengthValidator({ maxLength: 10 });
      await expect(validator.validate('   ')).rejects.toThrow();
    });
  });

  describe('combined validations', () => {
    test('validates all constraints together', async () => {
      const validator = textLengthValidator({
        minLength: 3,
        maxLength: 10,
        required: true,
        allowOnlySpaces: false,
      });

      await expect(validator.validate('hi')).rejects.toThrow(); // too short
      await expect(validator.validate('hello')).resolves.toBe('hello'); // valid
      await expect(validator.validate('hello world')).rejects.toThrow(); // too long
      await expect(validator.validate('   ')).rejects.toThrow(); // only spaces
      await expect(validator.validate('')).rejects.toThrow(); // required
    });
  });

  describe('default options', () => {
    test('works with no options provided', async () => {
      const validator = textLengthValidator();
      await expect(validator.validate('any text')).resolves.toBe('any text');
    });

    test('works with empty options object', async () => {
      const validator = textLengthValidator({});
      await expect(validator.validate('any text')).resolves.toBe('any text');
    });
  });

  describe('edge cases', () => {
    test('handles very long text', async () => {
      const validator = textLengthValidator({ maxLength: 1000 });
      const longText = 'a'.repeat(1000);
      await expect(validator.validate(longText)).resolves.toBe(longText);
    });

    test('handles unicode characters', async () => {
      const validator = textLengthValidator({ maxLength: 10 });
      await expect(validator.validate('🎉🎊🎈')).resolves.toBe('🎉🎊🎈');
    });

    test('handles newlines and special characters', async () => {
      const validator = textLengthValidator({ maxLength: 20, allowOnlySpaces: true });
      await expect(validator.validate('hello\nworld\ttab')).resolves.toBe('hello\nworld\ttab');
    });
  });
});
